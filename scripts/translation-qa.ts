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
  relativeFromRoot,
  stripFrontmatter,
  writeTextFile
} from "./lib.js";
import type { DocEntry, Manifest } from "./types.js";

interface Finding {
  level: "error" | "warning";
  slug: string;
  message: string;
}

const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const findings: Finding[] = [];
let checked = 0;

for (const doc of manifest.docs) {
  const translationPath = path.join(process.cwd(), "translations", "zh", `${doc.slug}.md`);
  if (!existsSync(translationPath)) continue;
  checked += 1;
  await checkTranslation(doc, translationPath);
}

await ensureDir(REPORTS_DIR);
await writeTextFile(path.join(REPORTS_DIR, "translation-qa-report.md"), renderReport(checked, findings));

const errors = findings.filter((finding) => finding.level === "error");
const warnings = findings.filter((finding) => finding.level === "warning");
console.log(`Checked translations: ${checked}`);
console.log(`Translation QA errors: ${errors.length}`);
console.log(`Translation QA warnings: ${warnings.length}`);
console.log(`Wrote ${relativeFromRoot(path.join(REPORTS_DIR, "translation-qa-report.md"))}`);

if (errors.length) {
  process.exitCode = 1;
}

async function checkTranslation(doc: DocEntry, translationPath: string): Promise<void> {
  const source = await readTextFile(path.join(process.cwd(), doc.localSourcePath));
  const translation = await readTextFile(translationPath);
  const frontmatter = extractFrontmatter(translation);
  const body = stripFrontmatter(translation).trim();

  if (!translation.startsWith("---\n")) {
    add("error", doc.slug, "missing YAML frontmatter");
  }
  if (!body) {
    add("error", doc.slug, "empty translation body");
  }
  if (frontmatter.status !== "translated" && frontmatter.status !== "needs-review") {
    add("error", doc.slug, "frontmatter status must be translated or needs-review");
  }
  if (!frontmatter.sourceChecksum) {
    add("error", doc.slug, "frontmatter sourceChecksum is missing");
  } else if (frontmatter.sourceChecksum !== doc.checksum) {
    add("warning", doc.slug, "sourceChecksum differs from current source checksum");
  }
  if (!frontmatter.sourceId) {
    add("warning", doc.slug, "frontmatter sourceId is missing");
  }
  if (!frontmatter.sourceUrl) {
    add("warning", doc.slug, "frontmatter sourceUrl is missing");
  }
  if (frontmatter.translator !== "codex-gpt-5.5-xhigh") {
    add("error", doc.slug, "frontmatter translator must be codex-gpt-5.5-xhigh");
  }

  compareMarkdownShape(doc, source, translation);
}

function compareMarkdownShape(doc: DocEntry, source: string, translation: string): void {
  const sourceBody = stripFrontmatter(source);
  const translationBody = stripFrontmatter(translation);
  const sourceFences = fenceLines(sourceBody);
  const translationFences = fenceLines(translationBody);

  if (sourceFences.length !== translationFences.length) {
    add("error", doc.slug, `code fence count changed: source ${sourceFences.length}, translation ${translationFences.length}`);
  }
  if (hasUnclosedFence(translationBody)) {
    add("error", doc.slug, "translation has an unclosed code fence");
  }

  const sourceLinks = countMatches(sourceBody, /(?<!!)\[[^\]]+\]\([^)]+\)/g);
  const translationLinks = countMatches(translationBody, /(?<!!)\[[^\]]+\]\([^)]+\)/g);
  if (translationLinks < sourceLinks) {
    add("warning", doc.slug, `link count decreased: source ${sourceLinks}, translation ${translationLinks}`);
  }

  const sourceImages = countMatches(sourceBody, /!\[[^\]]*\]\([^)]+\)/g);
  const translationImages = countMatches(translationBody, /!\[[^\]]*\]\([^)]+\)/g);
  if (translationImages < sourceImages) {
    add("warning", doc.slug, `image count decreased: source ${sourceImages}, translation ${translationImages}`);
  }

  const sourceTables = countMatches(sourceBody, /^\s*\|.*\|\s*$/gm);
  const translationTables = countMatches(translationBody, /^\s*\|.*\|\s*$/gm);
  if (translationTables < sourceTables) {
    add("warning", doc.slug, `table row count decreased: source ${sourceTables}, translation ${translationTables}`);
  }
}

function fenceLines(markdown: string): string[] {
  return markdown.split(/\r?\n/).filter((line) => Boolean(fenceMarker(line)));
}

function hasUnclosedFence(markdown: string): boolean {
  let inFence = false;
  let marker = "";
  for (const line of markdown.split(/\r?\n/)) {
    const match = fenceMarker(line);
    if (!match) continue;
    const nextMarker = match[0];
    if (!inFence) {
      inFence = true;
      marker = nextMarker;
    } else if (marker === nextMarker) {
      inFence = false;
      marker = "";
    }
  }
  return inFence;
}

function fenceMarker(line: string): string | null {
  const blockStart = line.match(/^\s*(`{3,}|~{3,})/);
  if (blockStart) return blockStart[1];

  const inlineStart = line.match(/\s(`{3,}|~{3,})[A-Za-z0-9_+.#-]*\s*$/);
  return inlineStart?.[1] ?? null;
}

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function add(level: Finding["level"], slug: string, message: string): void {
  findings.push({ level, slug, message });
}

function renderReport(checked: number, findings: Finding[]): string {
  const errors = findings.filter((finding) => finding.level === "error");
  const warnings = findings.filter((finding) => finding.level === "warning");
  return `# Translation QA Report

Generated at: ${new Date().toISOString()}
Checked translations: ${checked}
Errors: ${errors.length}
Warnings: ${warnings.length}

## Errors

${errors.map((finding) => `- ${finding.slug}: ${finding.message}`).join("\n") || "- None"}

## Warnings

${warnings.map((finding) => `- ${finding.slug}: ${finding.message}`).join("\n") || "- None"}
`;
}
