import { mkdir, copyFile, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist/vendor", { recursive: true });
for (const file of [
  "index.html",
  "style.css",
  "SecretSanta.js",
  "draw.js",
  "translations.js",
  "parseQueryParams.js",
  "gift.svg",
  "favicon.svg",
]) {
  await copyFile(file, `dist/${file}`);
}
await copyFile(
  "node_modules/crypto-js/crypto-js.js",
  "dist/vendor/crypto-js.js",
);
console.log("Built static site in dist/");
