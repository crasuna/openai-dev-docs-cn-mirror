import { existsSync } from "node:fs";
import path from "node:path";
import { MANIFEST_PATH, createEmptyManifest, readJsonFile } from "./lib.js";
import type { Manifest } from "./types.js";

const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const errors: string[] = [];
const slugs = new Set<string>();
const urls = new Set<string>();

for (const doc of manifest.docs) {
  if (!doc.title) errors.push(`Missing title for ${doc.markdownUrl}`);
  if (!doc.slug) errors.push(`Missing slug for ${doc.markdownUrl}`);
  if (slugs.has(doc.slug)) errors.push(`Duplicate slug: ${doc.slug}`);
  slugs.add(doc.slug);
  if (urls.has(doc.markdownUrl)) errors.push(`Duplicate markdownUrl: ${doc.markdownUrl}`);
  urls.add(doc.markdownUrl);
  if (!doc.markdownUrl.startsWith("https://developers.openai.com/")) {
    errors.push(`Unexpected source host: ${doc.markdownUrl}`);
  }
  if (!existsSync(path.join(process.cwd(), doc.localSourcePath))) {
    errors.push(`Missing local source: ${doc.localSourcePath}`);
  }
  if (!existsSync(path.join(process.cwd(), doc.localPagePath))) {
    errors.push(`Missing generated page: ${doc.localPagePath}`);
  }
}

if (manifest.docCount !== manifest.docs.length) {
  errors.push(`docCount mismatch: ${manifest.docCount} !== ${manifest.docs.length}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Manifest OK: ${manifest.docs.length} docs.`);
