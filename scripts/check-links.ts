import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DOCS_DIR } from "./lib.js";

const markdownFiles = await collectMarkdownFiles(DOCS_DIR);
const errors: string[] = [];

for (const file of markdownFiles) {
  const content = await readFile(file, "utf8");
  const relativeFile = path.relative(process.cwd(), file);
  for (const href of localLinks(content)) {
    const target = resolveLocalLink(href);
    if (!target) continue;
    if (!existsSync(target)) {
      errors.push(`${relativeFile}: missing local link target ${href}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Local links OK: ${markdownFiles.length} Markdown files scanned.`);

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".vitepress") continue;
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function localLinks(markdown: string): string[] {
  const links: string[] = [];
  let inFence = false;
  let fenceMarker = "";
  for (const line of markdown.split(/\r?\n/)) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[2][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (inFence) continue;
    for (const match of line.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)\s]+)\)/g)) {
      links.push(match[1]);
    }
    for (const match of line.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      links.push(match[1]);
    }
  }
  return links;
}

function resolveLocalLink(href: string): string | null {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "/") return path.join(DOCS_DIR, "index.md");
  if (clean.startsWith("/openai-assets/")) return path.join(DOCS_DIR, "public", clean.replace(/^\/+/, ""));
  return path.join(DOCS_DIR, `${clean.replace(/^\/+/, "")}.md`);
}
