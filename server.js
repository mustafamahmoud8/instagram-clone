const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
};

const server = http.createServer((req, res) => {
  // Normalize request URL
  let parsedUrl = req.url.split("?")[0];
  parsedUrl = decodeURI(parsedUrl);

  if (parsedUrl === "/" || parsedUrl === "") {
    parsedUrl = "/index.html";
  }

  const filePath = path.join(ROOT_DIR, parsedUrl);

  // Security check against directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If directory requested, check for index.html
      if (stats && stats.isDirectory()) {
        const indexHtml = path.join(filePath, "index.html");
        if (fs.existsSync(indexHtml)) {
          serveFile(indexHtml, res);
          return;
        }
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`404 Not Found: ${parsedUrl}`);
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("500 Internal Server Error");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });
    res.end(content);
  });
}

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Instagram Clone is running successfully!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Sign up:   http://localhost:${PORT}/index.html`);
  console.log(` Log in:    http://localhost:${PORT}/login-page/login.html`);
  console.log(` Home Feed: http://localhost:${PORT}/Home-page/Home.html`);
  console.log(` Profile:   http://localhost:${PORT}/profile-page/profile.html`);
  console.log(`===============================================`);
});
