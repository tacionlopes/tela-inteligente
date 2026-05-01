import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(rootDir, "dist");

const entriesToCopy = [
  "index.html",
  "styles.css",
  "app.js",
  "firebase-config.js",
  "firebase-config.example.js",
  "data"
];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const entry of entriesToCopy) {
  const source = join(rootDir, entry);
  const target = join(distDir, entry);

  if (!existsSync(source)) {
    throw new Error(`Arquivo ou pasta ausente para build: ${entry}`);
  }

  cpSync(source, target, { recursive: true });
}

console.log(`Build estático concluído em ${distDir}`);
