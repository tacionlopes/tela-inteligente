import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const rootDir = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const sourceRootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const require = createRequire(import.meta.url);
const generateQuestionsHandler = require(join(sourceRootDir, "api/ai/generate-questions.js"));
const generateStudyExplanationHandler = require(join(sourceRootDir, "api/ai/generate-study-explanation.js"));

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8"
};

const server = createServer((request, response) => {
  const parsedUrl = new URL(request.url || "/index.html", `http://127.0.0.1:${port}`);
  const pathname = parsedUrl.pathname || "/index.html";

  if (pathname === "/api/ai/generate-questions") {
    generateQuestionsHandler(request, response);
    return;
  }

  if (pathname === "/api/ai/generate-study-explanation") {
    generateStudyExplanationHandler(request, response);
    return;
  }

  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(rootDir, safePath);

  if (!filePath.startsWith(rootDir) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Preview disponível em http://127.0.0.1:${port}`);
});
