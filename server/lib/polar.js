"use strict";

const crypto = require("crypto");

/** "sandbox" routes to Polar's sandbox API, anything else to production. */
function apiBase() {
  return process.env.POLAR_SERVER === "sandbox"
    ? "https://sandbox-api.polar.sh"
    : "https://api.polar.sh";
}

async function polarFetch(path, { method = "GET", body } = {}) {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not configured");
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const detail =
      json && json.detail
        ? JSON.stringify(json.detail)
        : (json && (json.error_description || json.error)) || text;
    const err = new Error(`Polar ${method} ${path} → ${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Create a hosted checkout for the one-time lifetime product. */
async function createCheckout({ user, successUrl, returnUrl }) {
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!productId) throw new Error("POLAR_PRODUCT_ID is not configured");
  const body = {
    products: [productId],
    customer_name: user.name || undefined,
    external_customer_id: user.id,
    metadata: { user_id: user.id },
    success_url: successUrl,
    return_url: returnUrl,
    allow_discount_codes: true,
  };
  let checkout;
  try {
    checkout = await polarFetch("/v1/checkouts/", {
      method: "POST",
      body: { ...body, customer_email: user.email || undefined },
    });
  } catch (err) {
    // Polar rejects undeliverable email domains; retry and let it collect the
    // email at checkout instead of blocking a legitimate purchase.
    if (err.status === 422 && user.email) {
      checkout = await polarFetch("/v1/checkouts/", { method: "POST", body });
    } else {
      throw err;
    }
  }
  return { id: checkout.id, url: checkout.url, expiresAt: checkout.expires_at };
}

/** Create a hosted customer portal session so users can manage their order. */
async function createPortalSession({ customerId, returnUrl }) {
  const session = await polarFetch("/v1/customer-sessions/", {
    method: "POST",
    body: { customer_id: customerId, return_url: returnUrl },
  });
  return { id: session.id, url: session.customer_portal_url };
}

const MAX_SKEW_SECONDS = 300;

/**
 * Verify a Polar (Standard Webhooks) delivery and return the parsed event, or
 * null when the signature is missing, stale, or invalid.
 */
function verifyWebhook(rawBody, headers, secret) {
  try {
    const id = headers["webhook-id"];
    const timestamp = headers["webhook-timestamp"];
    const signatureHeader = headers["webhook-signature"];
    if (!id || !timestamp || !signatureHeader || !secret) return null;

    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) {
      return null;
    }

    const body = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf8")
      : String(rawBody || "");
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const signed = `${id}.${timestamp}.${body}`;
    const expected = crypto
      .createHmac("sha256", secretBytes)
      .update(signed, "utf8")
      .digest("base64");
    const expectedBuf = Buffer.from(expected, "utf8");

    const valid = String(signatureHeader)
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .some((part) => {
        const sig = part.includes(",") ? part.split(",")[1] : part;
        const provided = Buffer.from(sig || "", "utf8");
        return (
          provided.length === expectedBuf.length &&
          crypto.timingSafeEqual(provided, expectedBuf)
        );
      });

    return valid ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

module.exports = {
  createCheckout,
  createPortalSession,
  verifyWebhook,
  apiBase,
};
