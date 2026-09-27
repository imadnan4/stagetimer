"use strict";

const crypto = require("crypto");

function salt() {
  return process.env.USAGE_HASH_SALT || "stagetimer-usage-v1";
}

/** One-way hash so raw IPs / device ids are never stored. */
function hashIdentity(value) {
  return crypto
    .createHash("sha256")
    .update(`${salt()}:${value}`)
    .digest("hex")
    .slice(0, 40);
}

/** Real client IP behind Heroku / Netlify proxies. */
function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || (req.socket && req.socket.remoteAddress) || "unknown";
}

const DEVICE_RE = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Build the set of identity keys a request is counted against. A signed-in
 * user is tracked by user id *and* by IP so a fresh account cannot reset the
 * free allowance from the same network.
 */
function identityEntries(req, userId) {
  const entries = [];
  const ip = clientIp(req);
  if (ip && ip !== "unknown") {
    entries.push({ key: `ip:${hashIdentity(ip)}`, type: "ip" });
  }
  const device = req.get("x-device-id");
  if (device && DEVICE_RE.test(device)) {
    entries.push({ key: `device:${hashIdentity(device)}`, type: "device" });
  }
  if (userId) {
    entries.push({ key: `user:${userId}`, type: "user" });
  }
  return entries;
}

module.exports = { identityEntries, hashIdentity, clientIp };
