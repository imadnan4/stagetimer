"use strict";

/**
 * Storage abstraction for free-room usage and lifetime entitlements.
 *
 * Two implementations share the same interface:
 *   - createPgStore(pool)  durable Postgres storage (production)
 *   - createMemoryStore()  in-process fallback (dev/test, no DATABASE_URL)
 *
 * Entries passed to reserveRoom look like `{ key, type }`, e.g.
 * `{ key: "ip:ab12…", type: "ip" }`.
 */

function createMemoryStore() {
  const usage = new Map(); // key -> { type, count }
  const byOrder = new Map(); // polar_order_id -> entitlement row
  const webhooks = new Set();

  return {
    async isEntitled(userId) {
      if (!userId) return false;
      for (const row of byOrder.values()) {
        if (row.user_id === userId && row.status === "active") return true;
      }
      return false;
    },

    async getUsage(keys) {
      let max = 0;
      let key = null;
      for (const k of keys) {
        const rec = usage.get(k);
        if (rec && rec.count > max) {
          max = rec.count;
          key = k;
        }
      }
      return { used: max, key };
    },

    async reserveRoom(entries, limit) {
      let used = 0;
      for (const e of entries) {
        const rec = usage.get(e.key);
        if (rec) used = Math.max(used, rec.count);
      }
      if (used >= limit) return { allowed: false, used };
      for (const e of entries) {
        const rec = usage.get(e.key);
        if (rec) {
          rec.count += 1;
        } else {
          usage.set(e.key, { type: e.type, count: 1 });
        }
      }
      return { allowed: true, used };
    },

    async getPolarCustomerId(userId) {
      if (!userId) return null;
      for (const row of byOrder.values()) {
        if (row.user_id === userId && row.status === "active" && row.polar_customer_id) {
          return row.polar_customer_id;
        }
      }
      return null;
    },

    async grantFromOrder(order) {
      byOrder.set(order.orderId, {
        user_id: order.userId,
        email: order.email || null,
        polar_order_id: order.orderId,
        polar_customer_id: order.customerId || null,
        polar_product_id: order.productId || null,
        status: "active",
        amount: order.amount ?? null,
        currency: order.currency || null,
        purchased_at: order.purchasedAt || null,
      });
    },

    async revokeOrder(orderId) {
      const row = byOrder.get(orderId);
      if (row) row.status = "refunded";
    },

    async recordWebhook(id, type) {
      if (webhooks.has(id)) return false;
      webhooks.add(id);
      return true;
    },

    async close() {},
  };
}

function createPgStore(pool) {
  return {
    async isEntitled(userId) {
      if (!userId) return false;
      const { rows } = await pool.query(
        "SELECT 1 FROM app.entitlements WHERE user_id = $1 AND status = 'active' LIMIT 1",
        [userId]
      );
      return rows.length > 0;
    },

    async getUsage(keys) {
      if (keys.length === 0) return { used: 0, key: null };
      const { rows } = await pool.query(
        `SELECT identity_key, rooms_created FROM app.room_usage
          WHERE identity_key = ANY($1)
          ORDER BY rooms_created DESC
          LIMIT 1`,
        [keys]
      );
      if (rows.length === 0) return { used: 0, key: null };
      return { used: rows[0].rooms_created, key: rows[0].identity_key };
    },

    async reserveRoom(entries, limit) {
      if (entries.length === 0) return { allowed: true, used: 0 };
      const conn = await pool.connect();
      try {
        await conn.query("BEGIN");
        const keys = entries.map((e) => e.key);
        const types = entries.map((e) => e.type);
        // Ensure every row exists before locking so concurrent first-writes
        // cannot both slip past the limit check.
        await conn.query(
          `INSERT INTO app.room_usage (identity_key, identity_type)
           SELECT key, type FROM unnest($1::text[], $2::text[]) AS t(key, type)
           ON CONFLICT (identity_key) DO NOTHING`,
          [keys, types]
        );
        const { rows } = await conn.query(
          `SELECT rooms_created FROM app.room_usage
            WHERE identity_key = ANY($1)
            FOR UPDATE`,
          [keys]
        );
        const used = rows.reduce((m, r) => Math.max(m, r.rooms_created), 0);
        if (used >= limit) {
          await conn.query("ROLLBACK");
          return { allowed: false, used };
        }
        await conn.query(
          `UPDATE app.room_usage
              SET rooms_created = rooms_created + 1, updated_at = now()
            WHERE identity_key = ANY($1)`,
          [keys]
        );
        await conn.query("COMMIT");
        return { allowed: true, used };
      } catch (err) {
        await conn.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
    },

    async getPolarCustomerId(userId) {
      if (!userId) return null;
      const { rows } = await pool.query(
        `SELECT polar_customer_id FROM app.entitlements
          WHERE user_id = $1 AND status = 'active' AND polar_customer_id IS NOT NULL
          ORDER BY purchased_at DESC NULLS LAST
          LIMIT 1`,
        [userId]
      );
      return rows.length > 0 ? rows[0].polar_customer_id : null;
    },

    async grantFromOrder(order) {
      await pool.query(
        `INSERT INTO app.entitlements
           (user_id, email, polar_order_id, polar_customer_id, polar_product_id,
            status, amount, currency, purchased_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8, now())
         ON CONFLICT (polar_order_id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           email = EXCLUDED.email,
           polar_customer_id = EXCLUDED.polar_customer_id,
           polar_product_id = EXCLUDED.polar_product_id,
           status = 'active',
           amount = EXCLUDED.amount,
           currency = EXCLUDED.currency,
           purchased_at = EXCLUDED.purchased_at,
           updated_at = now()`,
        [
          order.userId,
          order.email || null,
          order.orderId,
          order.customerId || null,
          order.productId || null,
          order.amount ?? null,
          order.currency || null,
          order.purchasedAt || null,
        ]
      );
    },

    async revokeOrder(orderId) {
      await pool.query(
        `UPDATE app.entitlements
            SET status = 'refunded', updated_at = now()
          WHERE polar_order_id = $1`,
        [orderId]
      );
    },

    async recordWebhook(id, type) {
      const { rowCount } = await pool.query(
        `INSERT INTO app.webhook_events (id, type) VALUES ($1, $2)
         ON CONFLICT (id) DO NOTHING`,
        [id, type]
      );
      return rowCount > 0;
    },

    async close() {},
  };
}

module.exports = { createMemoryStore, createPgStore };
