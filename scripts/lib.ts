import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DocEntry, Manifest, TranslationInfo, TranslationStatus } from "./types.js";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT_INDEX_URL = "https://developers.openai.com/llms.txt";
export const SOURCES_DIR = path.join(ROOT, "sources");
export const EN_DIR = path.join(SOURCES_DIR, "en");
export const TRANSLATIONS_DIR = path.join(ROOT, "translations", "zh");
export const DOCS_DIR = path.join(ROOT, "docs");
export const MIRROR_DIR = path.join(DOCS_DIR, "mirror");
export const PUBLIC_ASSETS_DIR = path.join(DOCS_DIR, "public", "openai-assets");
export const REPORTS_DIR = path.join(ROOT, "reports");
export const MANIFEST_PATH = path.join(SOURCES_DIR, "manifest.json");
export const NAVIGATION_PATH = path.join(SOURCES_DIR, "navigation.json");

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function relativeFromRoot(value: string): string {
  return toPosixPath(path.relative(ROOT, value));
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readTextFile(filePath)) as T;
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function removeGeneratedDir(dir: string): Promise<void> {
  const resolved = path.resolve(dir);
  const allowed = path.resolve(MIRROR_DIR);
  if (resolved !== allowed) {
    throw new Error(`Refusing to remove unexpected directory: ${resolved}`);
  }
  await rm(resolved, { recursive: true, force: true });
  await ensureDir(resolved);
}

export function slugFromMarkdownUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.hostname !== "developers.openai.com") {
    throw new Error(`Unexpected docs host: ${parsed.hostname}`);
  }
  const raw = parsed.pathname.replace(/^\/+/, "").replace(/\.md$/, "");
  return raw
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"))
    .filter(Boolean)
    .join("/");
}

export function sourceUrlFromMarkdownUrl(url: string): string {
  const parsed = new URL(url);
  parsed.pathname = parsed.pathname.replace(/\.md$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

export function productFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  if (pathname.startsWith("/api/reference/")) return "API Reference";
  if (pathname.startsWith("/api/docs/")) return "OpenAI API Docs";
  if (pathname.startsWith("/api/")) return "OpenAI API";
  if (pathname.startsWith("/apps-sdk/")) return "Apps SDK";
  if (pathname.startsWith("/workspace-agents/")) return "Workspace Agents";
  if (pathname.startsWith("/codex/")) return "Codex";
  if (pathname.startsWith("/commerce/")) return "Commerce";
  if (pathname.startsWith("/ads/")) return "Ads";
  if (pathname.startsWith("/cookbook/")) return "Cookbook";
  if (pathname.startsWith("/showcase/")) return "Showcase";
  if (pathname.startsWith("/blog/")) return "Blog";
  if (pathname.startsWith("/learn/")) return "Learn";
  if (pathname.startsWith("/community/")) return "Community";
  return "OpenAI Developers";
}

export function sourcePathForSlug(slug: string): string {
  return path.join(EN_DIR, `${slug}.md`);
}

export function pagePathForSlug(slug: string): string {
  return path.join(MIRROR_DIR, `${slug}.md`);
}

export function translationPathForSlug(slug: string): string {
  return path.join(TRANSLATIONS_DIR, `${slug}.md`);
}

export function pageLinkForSlug(slug: string): string {
  return `/mirror/${slug}`;
}

export async function readTranslationInfo(slug: string, checksum: string): Promise<TranslationInfo> {
  const filePath = translationPathForSlug(slug);
  if (!existsSync(filePath)) return { status: "untranslated" };

  const content = await readTextFile(filePath);
  const frontmatter = extractFrontmatter(content);
  const sourceChecksum = frontmatter.sourceChecksum;
  const status = normalizeTranslationStatus(frontmatter.status);
  if (status === "translated" && sourceChecksum && sourceChecksum !== checksum) {
    return { status: "needs-review", sourceChecksum };
  }
  if (status === "needs-review") return { status: "needs-review", sourceChecksum };
  return { status: "translated", sourceChecksum };
}

function normalizeTranslationStatus(value: string | undefined): TranslationStatus {
  if (value === "translated" || value === "needs-review") return value;
  return "translated";
}

export function extractFrontmatter(content: string): Record<string, string> {
  if (!content.startsWith("---\n")) return {};
  const end = content.indexOf("\n---", 4);
  if (end === -1) return {};
  const frontmatter = content.slice(4, end).trim();
  const result: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    result[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return result;
}

export function stripFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) return content;
  const end = content.indexOf("\n---", 4);
  if (end === -1) return content;
  return content.slice(end + 4).replace(/^\s+/, "");
}

export function stripLeadingH1(content: string): string {
  return content.replace(/^\s*# .*(?:\r?\n)+/, "").trimStart();
}

export function escapeYamlString(value: string): string {
  return JSON.stringify(value.replace(/\r?\n/g, " "));
}

export function normalizeMarkdown(content: string): string {
  return content.replace(/\r\n/g, "\n").trimEnd() + "\n";
}

export function sortDocs(docs: DocEntry[]): DocEntry[] {
  return [...docs].sort((a, b) => {
    const product = a.product.localeCompare(b.product, "zh-Hans-CN");
    if (product !== 0) return product;
    const section = a.section.localeCompare(b.section, "zh-Hans-CN");
    if (section !== 0) return section;
    return a.title.localeCompare(b.title, "zh-Hans-CN");
  });
}

export function createEmptyManifest(): Manifest {
  return {
    generatedAt: new Date().toISOString(),
    rootIndexUrl: ROOT_INDEX_URL,
    docCount: 0,
    products: [],
    docs: []
  };
}
