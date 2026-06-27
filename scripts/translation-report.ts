import { existsSync } from "node:fs";
import path from "node:path";
import {
  MANIFEST_PATH,
  REPORTS_DIR,
  createEmptyManifest,
  ensureDir,
  extractFrontmatter,
  readJsonFile,
  readTextFile,
  readTranslationInfo,
  writeTextFile
} from "./lib.js";
import type { Manifest, TranslationStatus } from "./types.js";

interface ProductCounts {
  translated: number;
  "needs-review": number;
  untranslated: number;
}

const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const byProduct = new Map<string, ProductCounts>();
const missingTranslator: string[] = [];
const stale: string[] = [];

for (const doc of manifest.docs) {
  const translation = await readTranslationInfo(doc.slug, doc.checksum);
  const counts = byProduct.get(doc.product) ?? { translated: 0, "needs-review": 0, untranslated: 0 };
  counts[translation.status] += 1;
  byProduct.set(doc.product, counts);

  const translationPath = path.join(process.cwd(), "translations", "zh", `${doc.slug}.md`);
  if (!existsSync(translationPath)) continue;
  const frontmatter = extractFrontmatter(await readTextFile(translationPath));
  if (frontmatter.translator !== "codex-gpt-5.5-xhigh") missingTranslator.push(doc.slug);
  if (frontmatter.sourceChecksum && frontmatter.sourceChecksum !== doc.checksum) stale.push(doc.slug);
}

const totals = [...byProduct.values()].reduce<ProductCounts>(
  (sum, counts) => ({
    translated: sum.translated + counts.translated,
    "needs-review": sum["needs-review"] + counts["needs-review"],
    untranslated: sum.untranslated + counts.untranslated
  }),
  { translated: 0, "needs-review": 0, untranslated: 0 }
);

await ensureDir(REPORTS_DIR);
await writeTextFile(
  path.join(REPORTS_DIR, "translation-report.md"),
  `# Translation Progress Report

Generated at: ${new Date().toISOString()}
Total docs: ${manifest.docs.length}
Translated: ${totals.translated}
Needs review: ${totals["needs-review"]}
Untranslated: ${totals.untranslated}
Xhigh translator issues: ${missingTranslator.length}
Stale checksum issues: ${stale.length}

## By Product

| Product | Translated | Needs review | Untranslated |
| --- | ---: | ---: | ---: |
${[...byProduct.entries()]
  .sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"))
  .map(([product, counts]) => `| ${product} | ${counts.translated} | ${counts["needs-review"]} | ${counts.untranslated} |`)
  .join("\n")}

## Xhigh Translator Issues

${formatList(missingTranslator)}

## Stale Checksum Issues

${formatList(stale)}
`
);

console.log(`Translation report: ${totals["needs-review"]} needs review, ${totals.untranslated} untranslated.`);
console.log(`Xhigh translator issues: ${missingTranslator.length}`);
console.log(`Stale checksum issues: ${stale.length}`);

function formatList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}
