// Static file server for the exported out/ directory (next.config.ts uses output: "export",
// so `next start` cannot serve the build).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..", "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback for client-side routes
      filePath = path.join(ROOT, "index.html");
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      });
      res.end(data);
    });
  });
}).listen(PORT, () => {
  console.log(`Static server serving ${ROOT} on http://localhost:${PORT}`);
});
