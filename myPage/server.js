const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT) || 8000;
const host = "127.0.0.1";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".wav": "audio/wav",
};

const sendDirectory = (targetPath, response) => {
  fs.readdir(targetPath, (error, names) => {
    if (error) {
      response.writeHead(500);
      response.end("Directory read failed");
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(
      names
        .map((name) => `<a href="${encodeURIComponent(name)}">${name}</a>`)
        .join("\n")
    );
  });
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${host}:${port}`);
  const requestPath = decodeURIComponent(requestUrl.pathname);
  const targetPath = path.join(root, requestPath === "/" ? "index.html" : requestPath);

  if (!targetPath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(targetPath, (error, stats) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    if (stats.isDirectory()) {
      sendDirectory(targetPath, response);
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(targetPath)] || "application/octet-stream",
    });
    fs.createReadStream(targetPath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Homepage is running at http://${host}:${port}`);
});
