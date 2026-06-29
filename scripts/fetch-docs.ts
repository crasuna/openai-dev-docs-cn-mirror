import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DOCS_DIR,
  MANIFEST_PATH,
  PUBLIC_ASSETS_DIR,
  REPORTS_DIR,
  ROOT_INDEX_URL,
  createEmptyManifest,
  ensureDir,
  normalizeMarkdown,
  pagePathForSlug,
  productFromUrl,
  readJsonFile,
  readTranslationInfo,
  relativeFromRoot,
  sha256,
  slugFromMarkdownUrl,
  sourcePathForSlug,
  sourceUrlFromMarkdownUrl,
  sortDocs,
  writeJsonFile,
  writeTextFile
} from "./lib.js";
import { fetchBufferWithRetry, fetchText } from "./fetch-utils.js";
import { getKnownUpstreamAssetWarning } from "./known-upstream-asset-warnings.js";
import type { KnownUpstreamAssetWarning } from "./known-upstream-asset-warnings.js";
import type { DiscoveredDoc, DocEntry, Manifest } from "./types.js";

interface FetchArgs {
  limit?: number;
  only?: string;
  concurrency: number;
  includeAssets: boolean;
}

interface FetchResult {
  doc: DocEntry;
  changed: boolean;
  previousChecksum?: string;
  assetFailures: AssetFailure[];
}

interface AssetFailure {
  url: string;
  message: string;
  knownUpstream?: KnownUpstreamAssetWarning;
}

const args = parseArgs(process.argv.slice(2));
const previousManifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const previousByUrl = new Map(previousManifest.docs.map((doc) => [doc.markdownUrl, doc]));

console.log(`Discovering OpenAI docs from ${ROOT_INDEX_URL}`);
const discovered = await discoverDocs(ROOT_INDEX_URL);
const filtered = discovered
  .filter((doc) => (args.only ? doc.markdownUrl.includes(args.only) || doc.title.includes(args.only) : true))
  .slice(0, args.limit ?? Number.POSITIVE_INFINITY);

console.log(`Discovered ${discovered.length} Markdown docs; fetching ${filtered.length}.`);
const results = await mapLimit(filtered, args.concurrency, (doc) => fetchDoc(doc, previousByUrl.get(doc.markdownUrl)));
const docs = sortDocs(results.map((result) => result.doc));
const manifest: Manifest = {
  generatedAt: new Date().toISOString(),
  rootIndexUrl: ROOT_INDEX_URL,
  docCount: docs.length,
  products: [...new Set(docs.map((doc) => doc.product))].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
  docs
};

await writeJsonFile(MANIFEST_PATH, manifest);
await writeReport(results, previousManifest, discovered.length, filtered.length);

const changed = results.filter((result) => result.changed).length;
const assetFailures = results.flatMap((result) => result.assetFailures);
const knownUpstreamAssetFailures = assetFailures.filter(isKnownUpstreamAssetFailure);
const unknownAssetFailures = assetFailures.filter((failure) => !failure.knownUpstream);
console.log(`Wrote ${relativeFromRoot(MANIFEST_PATH)} with ${manifest.docCount} docs.`);
console.log(
  `Changed docs: ${changed}; asset warnings: ${unknownAssetFailures.length}; known upstream asset warnings: ${knownUpstreamAssetFailures.length}.`
);

function parseArgs(rawArgs: string[]): FetchArgs {
  const parsed: FetchArgs = { concurrency: 6, includeAssets: true };
  const args = rawArgs.filter((arg) => arg !== "--");
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--limit") parsed.limit = Number(args[++index]);
    else if (arg === "--only") parsed.only = args[++index];
    else if (arg === "--concurrency") parsed.concurrency = Number(args[++index]);
    else if (arg === "--no-assets") parsed.includeAssets = false;
  }
  if (!Number.isFinite(parsed.concurrency) || parsed.concurrency < 1) parsed.concurrency = 6;
  return parsed;
}

async function discoverDocs(rootUrl: string): Promise<DiscoveredDoc[]> {
  const rootIndex = await fetchText(rootUrl);
  const indexUrls = [
    rootUrl,
    ...parseIndexLinks(rootIndex).filter((url) => url.endsWith("/llms.txt") || url.endsWith("/llms-full.txt"))
  ];
  const docs = new Map<string, DiscoveredDoc>();

  for (const indexUrl of [...new Set(indexUrls)]) {
    const indexText = indexUrl === rootUrl ? rootIndex : await fetchText(indexUrl);
    for (const doc of parseDocLinks(indexText)) {
      if (!docs.has(doc.markdownUrl)) docs.set(doc.markdownUrl, doc);
    }
  }

  return [...docs.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseIndexLinks(markdown: string): string[] {
  return [...markdown.matchAll(/\[[^\]]+\]\((https:\/\/developers\.openai\.com\/[^)\s]+?\.txt)\)/g)].map((match) => match[1]);
}

function parseDocLinks(markdown: string): DiscoveredDoc[] {
  const docs: DiscoveredDoc[] = [];
  let currentH2 = "";
  let currentH3 = "";

  for (const line of markdown.split(/\r?\n/)) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      currentH2 = h2[1].trim();
      currentH3 = "";
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      currentH3 = h3[1].trim();
      continue;
    }

    const match = line.match(/^- \[([^\]]+)\]\((https:\/\/developers\.openai\.com\/[^)\s]+?\.md)\)(?::\s*(.*))?\s*$/);
    if (!match) continue;

    const markdownUrl = match[2];
    const slug = slugFromMarkdownUrl(markdownUrl);
    docs.push({
      title: match[1].trim(),
      description: (match[3] ?? "").trim(),
      product: productFromUrl(markdownUrl),
      section: currentH3 || currentH2 || productFromUrl(markdownUrl),
      markdownUrl,
      sourceUrl: sourceUrlFromMarkdownUrl(markdownUrl),
      slug
    });
  }

  return docs;
}

async function fetchDoc(discovered: DiscoveredDoc, previous?: DocEntry): Promise<FetchResult> {
  const content = normalizeMarkdown(await fetchText(discovered.markdownUrl));
  const checksum = sha256(content);
  const sourcePath = sourcePathForSlug(discovered.slug);
  const changed = previous?.checksum !== checksum || !existsSync(sourcePath);
  if (changed) {
    await writeTextFile(sourcePath, content);
  }

  const translation = await readTranslationInfo(discovered.slug, checksum);
  const assetFailures = args.includeAssets ? await cacheAssets(content, discovered.markdownUrl) : [];

  return {
    doc: {
      id: checksum.slice(0, 12),
      title: discovered.title,
      description: discovered.description,
      product: discovered.product,
      section: discovered.section,
      sourceUrl: discovered.sourceUrl,
      markdownUrl: discovered.markdownUrl,
      slug: discovered.slug,
      localSourcePath: relativeFromRoot(sourcePath),
      localPagePath: relativeFromRoot(pagePathForSlug(discovered.slug)),
      checksum,
      fetchedAt: new Date().toISOString(),
      translationStatus: translation.status
    },
    changed,
    previousChecksum: previous?.checksum,
    assetFailures
  };
}

async function cacheAssets(markdown: string, markdownUrl: string): Promise<AssetFailure[]> {
  const failures: AssetFailure[] = [];
  const assetUrls = discoverAssetUrls(markdown, markdownUrl);
  await mapLimit(assetUrls, 4, async (assetUrl) => {
    try {
      const localPath = assetPath(assetUrl);
      if (existsSync(localPath)) return;
      const buffer = await fetchBufferWithRetry(assetUrl);
      await ensureDir(path.dirname(localPath));
      await writeFile(localPath, buffer);
    } catch (error) {
      failures.push({
        url: assetUrl,
        message: summarizeError(error),
        knownUpstream: getKnownUpstreamAssetWarning(assetUrl)
      });
    }
  });
  return failures;
}

function summarizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function discoverAssetUrls(markdown: string, markdownUrl: string): string[] {
  const urls = new Set<string>();
  const imageMatches = markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g);
  for (const match of imageMatches) {
    try {
      const resolved = new URL(match[1], markdownUrl);
      if (resolved.hostname !== "developers.openai.com") continue;
      if (resolved.pathname.endsWith(".md") || resolved.pathname.endsWith(".txt")) continue;
      urls.add(resolved.toString());
    } catch {
      // Ignore invalid Markdown image targets.
    }
  }
  return [...urls];
}

function assetPath(assetUrl: string): string {
  const parsed = new URL(assetUrl);
  const safePath = parsed.pathname
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"))
    .join("/");
  return path.join(PUBLIC_ASSETS_DIR, parsed.hostname, safePath || "asset");
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const current = next;
      next += 1;
      results[current] = await mapper(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function writeReport(
  results: FetchResult[],
  previousManifest: Manifest,
  discoveredCount: number,
  fetchedCount: number
): Promise<void> {
  await ensureDir(REPORTS_DIR);
  const previousByUrl = new Map(previousManifest.docs.map((doc) => [doc.markdownUrl, doc]));
  const added = results.filter((result) => !previousByUrl.has(result.doc.markdownUrl));
  const updated = results.filter((result) => result.previousChecksum && result.previousChecksum !== result.doc.checksum);
  const needsReview = results.filter((result) => result.doc.translationStatus === "needs-review");
  const assetFailures = results.flatMap((result) => result.assetFailures);
  const unknownAssetFailures = assetFailures.filter((failure) => !failure.knownUpstream).map(formatAssetFailure);
  const knownUpstreamAssetFailures = assetFailures.filter(isKnownUpstreamAssetFailure).map(formatKnownUpstreamAssetFailure);

  const lines = [
    "# OpenAI Docs Update Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Root index: ${ROOT_INDEX_URL}`,
    `Discovered docs: ${discoveredCount}`,
    `Fetched docs: ${fetchedCount}`,
    `Added docs: ${added.length}`,
    `Updated docs: ${updated.length}`,
    `Translations needing review: ${needsReview.length}`,
    `Asset warnings: ${unknownAssetFailures.length}`,
    `Known upstream asset warnings: ${knownUpstreamAssetFailures.length}`,
    "",
    "## Added",
    ...formatDocList(added.map((result) => result.doc)),
    "",
    "## Updated",
    ...formatDocList(updated.map((result) => result.doc)),
    "",
    "## Needs Translation Review",
    ...formatDocList(needsReview.map((result) => result.doc)),
    "",
    "## Asset Warnings",
    ...(unknownAssetFailures.length ? unknownAssetFailures : ["- None"]),
    "",
    "## Known Upstream Asset Warnings",
    ...(knownUpstreamAssetFailures.length ? knownUpstreamAssetFailures : ["- None"])
  ];

  await writeTextFile(path.join(REPORTS_DIR, "update-report.md"), lines.join("\n"));
}

function formatDocList(docs: DocEntry[]): string[] {
  if (!docs.length) return ["- None"];
  return docs.map((doc) => `- ${doc.product} / ${doc.section}: [${doc.title}](${doc.sourceUrl})`);
}

function formatAssetFailure(failure: AssetFailure): string {
  return `- ${failure.url}: ${failure.message}`;
}

function formatKnownUpstreamAssetFailure(failure: AssetFailure & { knownUpstream: KnownUpstreamAssetWarning }): string {
  const warning = failure.knownUpstream;
  return `- ${failure.url} (source: ${warning.sourceSlug}; first seen: ${warning.firstSeen}; last verified: ${warning.lastVerified}): ${warning.reason} Latest error: ${failure.message}`;
}

function isKnownUpstreamAssetFailure(
  failure: AssetFailure
): failure is AssetFailure & { knownUpstream: KnownUpstreamAssetWarning } {
  return Boolean(failure.knownUpstream);
}
