import path from "node:path";
import {
  MANIFEST_PATH,
  REPORTS_DIR,
  createEmptyManifest,
  ensureDir,
  readJsonFile,
  readTextFile,
  readTranslationInfo,
  relativeFromRoot,
  stripFrontmatter,
  writeJsonFile,
  writeTextFile
} from "./lib.js";
import type { DocEntry, Manifest, TranslationStatus } from "./types.js";

interface Args {
  limit?: number;
  product?: string;
  maxBatchKb: number;
  maxBatchDocs: number;
  includeNeedsReview: boolean;
  includeTranslated: boolean;
}

interface QueueDoc {
  id: string;
  title: string;
  product: string;
  section: string;
  slug: string;
  sourceUrl: string;
  sourcePath: string;
  translationPath: string;
  checksum: string;
  status: TranslationStatus;
  bytes: number;
  headingCount: number;
  splitRecommended: boolean;
}

interface TranslationBatch {
  id: string;
  totalBytes: number;
  docs: QueueDoc[];
}

const args = parseArgs(process.argv.slice(2));
const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const queue = await buildQueue(manifest.docs, args);
const batches = buildBatches(queue, args.maxBatchKb * 1024, args.maxBatchDocs);

await ensureDir(REPORTS_DIR);
await writeJsonFile(path.join(REPORTS_DIR, "translation-queue.json"), {
  generatedAt: new Date().toISOString(),
  docCount: queue.length,
  batchCount: batches.length,
  maxBatchKb: args.maxBatchKb,
  maxBatchDocs: args.maxBatchDocs,
  batches
});
await writeTextFile(path.join(REPORTS_DIR, "translation-plan.md"), renderReport(queue, batches, args));

console.log(`Queued docs: ${queue.length}`);
console.log(`Batches: ${batches.length}`);
console.log(`Wrote ${relativeFromRoot(path.join(REPORTS_DIR, "translation-plan.md"))}`);
console.log(`Wrote ${relativeFromRoot(path.join(REPORTS_DIR, "translation-queue.json"))}`);

function parseArgs(rawArgs: string[]): Args {
  const parsed: Args = { maxBatchKb: 180, maxBatchDocs: 25, includeNeedsReview: false, includeTranslated: false };
  const args = rawArgs.filter((arg) => arg !== "--");
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--limit") parsed.limit = Number(args[++index]);
    else if (arg === "--product") parsed.product = args[++index];
    else if (arg === "--max-batch-kb") parsed.maxBatchKb = Number(args[++index]);
    else if (arg === "--max-batch-docs") parsed.maxBatchDocs = Number(args[++index]);
    else if (arg === "--include-needs-review") parsed.includeNeedsReview = true;
    else if (arg === "--include-translated") parsed.includeTranslated = true;
  }
  if (!Number.isFinite(parsed.maxBatchKb) || parsed.maxBatchKb < 8) parsed.maxBatchKb = 180;
  if (!Number.isFinite(parsed.maxBatchDocs) || parsed.maxBatchDocs < 1) parsed.maxBatchDocs = 25;
  return parsed;
}

async function buildQueue(docs: DocEntry[], args: Args): Promise<QueueDoc[]> {
  const result: QueueDoc[] = [];
  for (const doc of docs) {
    if (args.product && doc.product !== args.product) continue;
    const translation = await readTranslationInfo(doc.slug, doc.checksum);
    if (!args.includeTranslated && translation.status === "translated") continue;
    if (!args.includeTranslated && !args.includeNeedsReview && translation.status === "needs-review") continue;

    const sourcePath = path.join(process.cwd(), doc.localSourcePath);
    const source = await readTextFile(sourcePath);
    const body = stripFrontmatter(source);
    const bytes = Buffer.byteLength(source, "utf8");
    result.push({
      id: doc.id,
      title: doc.title,
      product: doc.product,
      section: doc.section,
      slug: doc.slug,
      sourceUrl: doc.sourceUrl,
      sourcePath: doc.localSourcePath,
      translationPath: `translations/zh/${doc.slug}.md`,
      checksum: doc.checksum,
      status: translation.status,
      bytes,
      headingCount: countHeadings(body),
      splitRecommended: bytes > args.maxBatchKb * 1024
    });
  }

  return result.sort(compareQueueDocs).slice(0, args.limit ?? Number.POSITIVE_INFINITY);
}

function compareQueueDocs(a: QueueDoc, b: QueueDoc): number {
  const product = productPriority(a.product) - productPriority(b.product);
  if (product !== 0) return product;
  const size = Number(a.splitRecommended) - Number(b.splitRecommended);
  if (size !== 0) return size;
  const section = a.section.localeCompare(b.section, "zh-Hans-CN");
  if (section !== 0) return section;
  return a.title.localeCompare(b.title, "zh-Hans-CN");
}

function productPriority(product: string): number {
  const priorities = new Map([
    ["OpenAI API Docs", 0],
    ["API Reference", 1],
    ["Codex", 2],
    ["Apps SDK", 3],
    ["Commerce", 4],
    ["Ads", 5],
    ["Workspace Agents", 6]
  ]);
  return priorities.get(product) ?? 99;
}

function buildBatches(queue: QueueDoc[], maxBatchBytes: number, maxBatchDocs: number): TranslationBatch[] {
  const batches: TranslationBatch[] = [];
  let current: TranslationBatch = createBatch(1);

  for (const doc of queue) {
    if (doc.splitRecommended) {
      if (current.docs.length) {
        batches.push(current);
        current = createBatch(batches.length + 1);
      }
      batches.push({ id: batchId(batches.length + 1), totalBytes: doc.bytes, docs: [doc] });
      current = createBatch(batches.length + 1);
      continue;
    }

    if (current.docs.length && (current.totalBytes + doc.bytes > maxBatchBytes || current.docs.length >= maxBatchDocs)) {
      batches.push(current);
      current = createBatch(batches.length + 1);
    }
    current.docs.push(doc);
    current.totalBytes += doc.bytes;
  }

  if (current.docs.length) batches.push(current);
  return batches.map((batch, index) => ({ ...batch, id: batchId(index + 1) }));
}

function createBatch(index: number): TranslationBatch {
  return { id: batchId(index), totalBytes: 0, docs: [] };
}

function batchId(index: number): string {
  return `zh-${String(index).padStart(4, "0")}`;
}

function countHeadings(markdown: string): number {
  return markdown.split(/\r?\n/).filter((line) => /^#{1,6}\s+\S/.test(line)).length;
}

function renderReport(queue: QueueDoc[], batches: TranslationBatch[], args: Args): string {
  const byProduct = new Map<string, number>();
  for (const doc of queue) byProduct.set(doc.product, (byProduct.get(doc.product) ?? 0) + 1);
  const largeDocs = queue.filter((doc) => doc.splitRecommended);

  return `# Translation Plan

Generated at: ${new Date().toISOString()}
Filter product: ${args.product ?? "all"}
Queued docs: ${queue.length}
Batches: ${batches.length}
Max normal batch: ${args.maxBatchKb} KB
Max docs per normal batch: ${args.maxBatchDocs}
Include needs-review: ${args.includeNeedsReview || args.includeTranslated ? "yes" : "no"}
Include translated: ${args.includeTranslated ? "yes" : "no"}
Large docs needing section-level translation: ${largeDocs.length}

## By Product

${[...byProduct.entries()].map(([product, count]) => `- ${product}: ${count}`).join("\n") || "- None"}

## Next Batches

${batches
  .slice(0, 20)
  .map(
    (batch) =>
      `- ${batch.id}: ${batch.docs.length} doc(s), ${formatKb(batch.totalBytes)} KB, ${batch.docs
        .map((doc) => doc.slug)
        .join(", ")}`
  )
  .join("\n") || "- None"}

## Large Docs

${largeDocs.map((doc) => `- ${doc.slug}: ${formatKb(doc.bytes)} KB, ${doc.headingCount} headings`).join("\n") || "- None"}
`;
}

function formatKb(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}
