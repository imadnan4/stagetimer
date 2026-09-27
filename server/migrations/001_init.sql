-- StageTimer application schema.
-- Lives in its own schema so it never collides with Neon Auth's tables
-- (which are managed in the `neon_auth` schema).

CREATE SCHEMA IF NOT EXISTS app;

-- Per-identity free-room usage. Identity keys are opaque, salted hashes
-- (`ip:<hash>`, `device:<hash>`, `user:<id>`) so raw IPs / device ids are
-- never persisted.
CREATE TABLE IF NOT EXISTS app.room_usage (
  identity_key   TEXT PRIMARY KEY,
  identity_type  TEXT NOT NULL,
  rooms_created  INTEGER NOT NULL DEFAULT 0,
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lifetime entitlements granted by paid Polar orders.
CREATE TABLE IF NOT EXISTS app.entitlements (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            TEXT NOT NULL,
  email              TEXT,
  polar_order_id     TEXT NOT NULL UNIQUE,
  polar_customer_id  TEXT,
  polar_product_id   TEXT,
  status             TEXT NOT NULL DEFAULT 'active',
  amount             INTEGER,
  currency           TEXT,
  purchased_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entitlements_user_active_idx
  ON app.entitlements (user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS entitlements_email_idx
  ON app.entitlements (lower(email));

-- Idempotency ledger for webhook deliveries.
CREATE TABLE IF NOT EXISTS app.webhook_events (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
