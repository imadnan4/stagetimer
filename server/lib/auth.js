"use strict";

/**
 * Verifies Neon Managed Better Auth JWTs against the branch JWKS.
 * `jose` is ESM-only, so it is imported lazily from CommonJS.
 */

let jwksPromise = null;

function jwksUrl() {
  if (process.env.NEON_AUTH_JWKS_URL) return process.env.NEON_AUTH_JWKS_URL;
  if (process.env.NEON_AUTH_BASE_URL) {
    return `${process.env.NEON_AUTH_BASE_URL.replace(/\/$/, "")}/.well-known/jwks.json`;
  }
  return null;
}

async function getJwks() {
  if (!jwksPromise) {
    const url = jwksUrl();
    if (!url) return null;
    jwksPromise = import("jose").then(({ createRemoteJWKSet }) =>
      createRemoteJWKSet(new URL(url))
    );
  }
  return jwksPromise;
}

function bearerToken(req) {
  const header = req.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/** @returns {Promise<{id:string,email:string|null,name:string|null}|null>} */
async function getUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  try {
    const jwks = await getJwks();
    if (!jwks) return null;
    const { jwtVerify } = await import("jose");
    const options = {};
    if (process.env.NEON_AUTH_BASE_URL) {
      options.issuer = new URL(process.env.NEON_AUTH_BASE_URL).origin;
    }
    const { payload } = await jwtVerify(token, jwks, options);
    if (!payload || !payload.sub) return null;
    return {
      id: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

module.exports = { getUser, bearerToken };
