import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const assets = new URL("../dist/assets/", import.meta.url);
const files = await readdir(assets);
const report = [];
for (const [label, expression, budget] of [
  ["Entry JS gzip", /^index-.*\.js$/, 135_000],
  ["Library JS gzip", /^ImagingLibrary-.*\.js$/, 18_000],
  ["Entry CSS gzip", /^index-.*\.css$/, 13_000],
]) {
  const matching = files.filter((file) => expression.test(file));
  if (matching.length !== 1)
    throw new Error(`${label}: expected one asset, found ${matching.length}`);
  const size = gzipSync(await readFile(new URL(matching[0], assets))).length;
  report.push({ label, bytes: size, budget });
  if (size > budget)
    throw new Error(`${label}: ${size} bytes exceeds ${budget}`);
}
const media = new URL("../dist/media/", import.meta.url);
const images = (await readdir(media)).filter((file) => file.endsWith(".webp"));
const total = (
  await Promise.all(images.map((file) => readFile(new URL(file, media))))
).reduce((sum, file) => sum + file.length, 0);
if (total > 1_700_000)
  throw new Error(`WebP assets: ${total} bytes exceeds 1700000`);
report.push({
  label: "WebP assets",
  files: images.length,
  bytes: total,
  budget: 1_700_000,
});
console.log(JSON.stringify(report, null, 2));
