import { MANIFEST_PATH, createEmptyManifest, readJsonFile, readTranslationInfo } from "./lib.js";
import type { Manifest } from "./types.js";

const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const counts = {
  translated: 0,
  "needs-review": 0,
  untranslated: 0
};

for (const doc of manifest.docs) {
  const translation = await readTranslationInfo(doc.slug, doc.checksum);
  counts[translation.status] += 1;
}

console.log(`Total docs: ${manifest.docs.length}`);
console.log(`Translated: ${counts.translated}`);
console.log(`Needs review: ${counts["needs-review"]}`);
console.log(`Untranslated: ${counts.untranslated}`);

const untranslatedByProduct = new Map<string, number>();
const reviewByProduct = new Map<string, number>();
for (const doc of manifest.docs) {
  const translation = await readTranslationInfo(doc.slug, doc.checksum);
  if (translation.status === "untranslated") {
    untranslatedByProduct.set(doc.product, (untranslatedByProduct.get(doc.product) ?? 0) + 1);
  } else if (translation.status === "needs-review") {
    reviewByProduct.set(doc.product, (reviewByProduct.get(doc.product) ?? 0) + 1);
  }
}

if (untranslatedByProduct.size) {
  console.log("\nUntranslated by product:");
  for (const [product, count] of [...untranslatedByProduct.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"))) {
    console.log(`- ${product}: ${count}`);
  }
}

if (reviewByProduct.size) {
  console.log("\nNeeds review by product:");
  for (const [product, count] of [...reviewByProduct.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"))) {
    console.log(`- ${product}: ${count}`);
  }
}
