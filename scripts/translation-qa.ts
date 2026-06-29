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

interface MarkdownLine {
  lineNumber: number;
  text: string;
}

interface ProseCandidate extends MarkdownLine {
  normalized: string;
}

const MAX_WARNING_EXAMPLES = 3;

const COMMON_ENGLISH_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "before",
  "by",
  "can",
  "do",
  "for",
  "from",
  "if",
  "in",
  "into",
  "is",
  "it",
  "not",
  "of",
  "on",
  "or",
  "should",
  "that",
  "the",
  "their",
  "then",
  "there",
  "they",
  "this",
  "to",
  "use",
  "when",
  "with",
  "you",
  "your"
]);

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
  auditTranslationQuality(doc, source, translation);
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

function auditTranslationQuality(doc: DocEntry, source: string, translation: string): void {
  const h1 = firstH1(translation);
  if (!h1) {
    add("warning", doc.slug, "missing top-level H1 heading");
  } else if (!hasHan(h1)) {
    add("warning", doc.slug, `H1 has no Chinese characters: "${trimExample(h1)}"`);
  }

  const sourceNaturalEnglish = new Set(
    extractNaturalEnglishLines(source)
      .map((line) => line.normalized)
      .filter((line) => line.length >= 24)
  );
  const translationNaturalEnglish = extractNaturalEnglishLines(translation);
  if (translationNaturalEnglish.length) {
    add(
      "warning",
      doc.slug,
      `suspected untranslated English prose: ${translationNaturalEnglish.length} line(s); ${formatExamples(translationNaturalEnglish)}`
    );
  }

  const copiedSourceLines = translationNaturalEnglish.filter((line) => sourceNaturalEnglish.has(line.normalized));
  if (copiedSourceLines.length) {
    add(
      "warning",
      doc.slug,
      `English prose appears copied from source: ${copiedSourceLines.length} line(s); ${formatExamples(copiedSourceLines)}`
    );
  }
}

function firstH1(markdown: string): string | null {
  for (const line of bodyLines(markdown)) {
    const match = line.text.match(/^#\s+(.+?)\s*$/);
    if (match) return match[1].trim();
  }
  return null;
}

function bodyLines(markdown: string): MarkdownLine[] {
  const lines = markdown.split(/\r?\n/);
  let start = 0;
  if (lines[0] === "---") {
    const end = lines.findIndex((line, index) => index > 0 && line === "---");
    if (end !== -1) {
      start = end + 1;
    }
  }
  return lines.slice(start).map((text, index) => ({ lineNumber: start + index + 1, text }));
}

function extractNaturalEnglishLines(markdown: string): ProseCandidate[] {
  const candidates: ProseCandidate[] = [];
  let inFence = false;
  let fence = "";
  let inHtmlTable = false;

  for (const line of bodyLines(markdown)) {
    const trimmed = line.text.trim();
    const blockFence = trimmed.match(/^(`{3,}|~{3,})/);
    if (blockFence) {
      if (!inFence) {
        inFence = true;
        fence = blockFence[1];
      } else if (blockFence[1] === fence) {
        inFence = false;
        fence = "";
      }
      continue;
    }
    if (inFence) continue;

    if (/<table\b/i.test(trimmed)) {
      inHtmlTable = true;
      continue;
    }
    if (inHtmlTable) {
      if (/<\/table>/i.test(trimmed)) {
        inHtmlTable = false;
      }
      continue;
    }

    if (shouldSkipRawLine(trimmed)) continue;

    const visible = toVisibleText(trimmed);
    if (!visible || shouldSkipVisibleText(visible)) continue;
    if (!looksLikeNaturalEnglish(visible)) continue;

    candidates.push({
      lineNumber: line.lineNumber,
      text: visible,
      normalized: normalizeProse(visible)
    });
  }

  return candidates;
}

function shouldSkipRawLine(trimmed: string): boolean {
  if (!trimmed) return true;
  if (/^\|.*\|\s*$/.test(trimmed)) return true;
  if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) return true;
  if (/^!\[[^\]]*]\([^)]+\)\s*$/.test(trimmed)) return true;
  if (/^\[[^\]]+]\([^)]+\)\s*$/.test(trimmed)) return true;
  if (/^>\s*(User|Assistant|System|Developer):\s+/i.test(trimmed)) return true;
  if (/^\{\/\*/.test(trimmed)) return true;
  if (/^<!--/.test(trimmed)) return true;
  if (/^<\/?[A-Z][A-Za-z0-9]*\b/.test(trimmed)) return true;
  if (/^[A-Za-z][A-Za-z0-9_$:-]*=\{?["']/.test(trimmed)) return true;
  if (/^["']?(text|input|output|content|instructions)["']?\s*:\s*["']/i.test(trimmed)) return true;
  if (/^<\/?(div|span|p|a|code|strong|em|br|img|details|summary|table|thead|tbody|tr|td|th)\b/i.test(trimmed)) {
    return true;
  }
  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\/\S+/.test(trimmed)) return true;
  if (/^(curl|npm|pnpm|yarn|node|npx|pip|python|git)\s+/.test(trimmed)) return true;
  if (/^(import|export|const|let|var|function|class|interface|type)\s+/.test(trimmed)) return true;
  if (/^[{}[\],:"'0-9.\s-]+$/.test(trimmed)) return true;
  return false;
}

function toVisibleText(line: string): string {
  return line
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/<code\b[^>]*>.*?<\/code>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s*/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSkipVisibleText(text: string): boolean {
  if (!text) return true;
  if (/^[-=]+$/.test(text)) return true;
  if (/^[A-Z0-9_./:@-]+$/.test(text)) return true;
  if (/^[A-Za-z0-9_.:/@()[\]-]+$/.test(text) && !/\s/.test(text)) return true;
  if (hasHan(text) && hasQuotedEnglishExample(text)) return true;
  if (/^#+\s*$/.test(text)) return true;
  return false;
}

function hasQuotedEnglishExample(text: string): boolean {
  const quoted = [...text.matchAll(/["“]([^"”]+)["”]/g)].map((match) => match[1]);
  return quoted.some((value) => {
    const englishWords = value.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
    return englishWords.length >= 5 && /[.!?]$/.test(value.trim());
  });
}

function looksLikeNaturalEnglish(text: string): boolean {
  const englishWords = text.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  const lexicalWords = englishWords.filter((word) => /[a-z]/.test(word) && word.length > 1);
  if (lexicalWords.length < 4) return false;

  const hanCount = countHan(text);
  const englishLetters = (text.match(/[A-Za-z]/g) ?? []).length;
  if (englishLetters < 16) return false;

  const hasCommonEnglishWord = lexicalWords.some((word) => COMMON_ENGLISH_WORDS.has(word.toLowerCase()));
  if (!hasCommonEnglishWord) return false;

  const hasSentencePunctuation = /[.!?]["')\]]?\s*$/.test(text) || /[.!?]\s+[A-Z]/.test(text);
  if (hanCount === 0) {
    return lexicalWords.length >= 8 || (lexicalWords.length >= 4 && hasSentencePunctuation);
  }

  return lexicalWords.length >= 10 && englishLetters > hanCount * 3 && hasSentencePunctuation;
}

function normalizeProse(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasHan(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}

function countHan(value: string): number {
  return value.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
}

function formatExamples(lines: ProseCandidate[]): string {
  return lines
    .slice(0, MAX_WARNING_EXAMPLES)
    .map((line) => `L${line.lineNumber} "${trimExample(line.text)}"`)
    .join("; ");
}

function trimExample(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
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
