import { mkdir, copyFile, rm, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const files = [
  "index.html",
  "style.css",
  "SecretSanta.js",
  "draw.js",
  "translations.js",
  "parseQueryParams.js",
  "gift.svg",
  "favicon.svg",
];
const source = new Map(
  await Promise.all(
    files.map(async (file) => [file, await readFile(file, "utf8")]),
  ),
);
// Version the entire module graph, including files that existed on the old site.
// Existing browser caches must never mix old scripts/styles with the new app.
const version = createHash("sha256")
  .update([...source.values()].join("\n"))
  .digest("hex")
  .slice(0, 12);
await rm("dist", { recursive: true, force: true });
await mkdir("dist/vendor", { recursive: true });
for (const [file, original] of source) {
  let content = original;
  if (file.endsWith(".js")) {
    content = content.replace(
      /(from\s+["']\.\/)([^"']+)(["'])/g,
      (match, prefix, path, suffix) =>
        source.has(path) ? `${prefix}${path}?v=${version}${suffix}` : match,
    );
  }
  if (file === "index.html") {
    content = content.replace(
      /((?:src|href)=["'])([^"']+\.(?:js|css))(["'])/g,
      (_, prefix, path, suffix) => `${prefix}${path}?v=${version}${suffix}`,
    );
  }
  await writeFile(`dist/${file}`, content);
}
await copyFile(
  "node_modules/crypto-js/crypto-js.js",
  "dist/vendor/crypto-js.js",
);
console.log(`Built static site in dist/ (assets ${version})`);
