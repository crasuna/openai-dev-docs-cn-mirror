import { existsSync } from "node:fs";
import path from "node:path";
import {
  DOCS_DIR,
  MANIFEST_PATH,
  MIRROR_DIR,
  REPORTS_DIR,
  createEmptyManifest,
  ensureDir,
  escapeYamlString,
  normalizeMarkdown,
  pageLinkForSlug,
  readJsonFile,
  readTranslationInfo,
  readTextFile,
  relativeFromRoot,
  removeGeneratedDir,
  stripFrontmatter,
  stripLeadingH1,
  translationPathForSlug,
  writeJsonFile,
  writeTextFile
} from "./lib.js";
import type { DocEntry, Manifest } from "./types.js";

const manifest = await refreshTranslationStatuses(await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest()));
const displayManifest = await addDisplayTitles(manifest);
const urlMap = buildUrlMap(displayManifest.docs);

await ensureDir(DOCS_DIR);
await removeGeneratedDir(MIRROR_DIR);
await generateHome(displayManifest);
await generateCatalog(displayManifest);
await generateTranslationStatus(displayManifest);
await generatePages(displayManifest);
await generateVitePressData(displayManifest);
await writeBuildReport(displayManifest);

console.log(`Generated ${displayManifest.docs.length} pages under ${relativeFromRoot(MIRROR_DIR)}.`);

interface DisplayDocEntry extends DocEntry {
  displayTitle: string;
}

interface DisplayManifest extends Omit<Manifest, "docs"> {
  docs: DisplayDocEntry[];
}

async function refreshTranslationStatuses(manifest: Manifest): Promise<Manifest> {
  let changed = false;
  const docs: DocEntry[] = [];
  for (const doc of manifest.docs) {
    const translation = await readTranslationInfo(doc.slug, doc.checksum);
    const nextDoc = { ...doc, translationStatus: translation.status };
    if (nextDoc.translationStatus !== doc.translationStatus) changed = true;
    docs.push(nextDoc);
  }

  const nextManifest = { ...manifest, docs };
  if (changed) {
    await writeJsonFile(MANIFEST_PATH, nextManifest);
    console.log(`Updated translation statuses in ${relativeFromRoot(MANIFEST_PATH)}.`);
  }
  return nextManifest;
}

async function addDisplayTitles(manifest: Manifest): Promise<DisplayManifest> {
  const docs: DisplayDocEntry[] = [];
  for (const doc of manifest.docs) {
    docs.push({ ...doc, displayTitle: await displayTitleForDoc(doc) });
  }
  return { ...manifest, docs };
}

async function displayTitleForDoc(doc: DocEntry): Promise<string> {
  const translationPath = translationPathForSlug(doc.slug);
  if (!existsSync(translationPath)) return doc.title;
  const translation = await readTextFile(translationPath);
  return extractH1Title(translation) || doc.title;
}

function extractH1Title(markdown: string): string | null {
  const body = stripFrontmatter(markdown);
  const match = body.match(/^\s{0,3}#\s+(.+?)\s*$/m);
  if (!match) return null;
  const title = match[1].replace(/\s+\{#[A-Za-z0-9_-]+\}\s*$/, "").trim();
  return title || null;
}

async function generateHome(manifest: DisplayManifest): Promise<void> {
  const productRows = manifest.products
    .map((product) => {
      const count = manifest.docs.filter((doc) => doc.product === product).length;
      return `| ${product} | ${count} | [浏览](${productLink(product, manifest.docs)}) |`;
    })
    .join("\n");

  const translated = manifest.docs.filter((doc) => doc.translationStatus === "translated").length;
  const needsReview = manifest.docs.filter((doc) => doc.translationStatus === "needs-review").length;
  const covered = translated + needsReview;
  const untranslated = manifest.docs.length - translated - needsReview;

  const content = `# OpenAI Developers 文档非官方中文学习镜像站

这是一个非官方 OpenAI Developers 中文学习镜像站，已通过 GitHub Pages 公开部署。本站用于个人学习和中文阅读辅助，当前阶段已建立英文源文档缓存、中文译文覆盖层和本地搜索；没有中文译文覆盖的页面会显示英文原文。

::: warning 非官方说明
本站不是 OpenAI 官方网站，内容可能滞后、遗漏或存在翻译错误。学习、开发、上线和合规判断应以 OpenAI 官方英文文档为准。
:::

## 文档状态

| 指标 | 数量 |
| --- | ---: |
| 已索引页面 | ${manifest.docs.length} |
| 中文译文覆盖 | ${covered} |
| 人工复核完成 | ${translated} |
| 待人工复核 | ${needsReview} |
| 待补译 | ${untranslated} |
| 最近抓取 | ${manifest.generatedAt || "尚未抓取"} |

## 文档集

| 文档集 | 页面数 | 入口 |
| --- | ---: | --- |
${productRows || "| 暂无 | 0 | - |"}

## 维护工作流

1. 运行 \`pnpm fetch:docs\` 更新官方英文源文档。
2. 运行 \`pnpm build:pages\` 重建镜像页面。
3. 在 \`translations/zh/**.md\` 添加或复核中文译文。
4. 运行 \`pnpm translate:status\` 查看中文化进度。
5. 运行 \`pnpm check\` 完整校验并构建站点。
`;
  await writeTextFile(path.join(DOCS_DIR, "index.md"), content);
}

function productLink(product: string, docs: DisplayDocEntry[]): string {
  const firstDoc = docs.find((doc) => doc.product === product);
  return firstDoc ? pageLinkForSlug(firstDoc.slug) : "/catalog";
}

async function generateCatalog(manifest: DisplayManifest): Promise<void> {
  const rows = manifest.docs
    .map(
      (doc) =>
        `| ${doc.product} | ${doc.section} | [${escapeTable(doc.displayTitle)}](${pageLinkForSlug(doc.slug)}) | ${statusLabel(
          doc.translationStatus
        )} | [官方](${doc.sourceUrl}) |`
    )
    .join("\n");

  await writeTextFile(
    path.join(DOCS_DIR, "catalog.md"),
    `# 文档目录

| 文档集 | 分组 | 标题 | 翻译状态 | 官方源 |
| --- | --- | --- | --- | --- |
${rows || "| - | - | 暂无文档 | - | - |"}
`
  );
}

async function generateTranslationStatus(manifest: DisplayManifest): Promise<void> {
  const grouped = new Map<string, DisplayDocEntry[]>();
  for (const doc of manifest.docs) {
    const key = statusLabel(doc.translationStatus);
    grouped.set(key, [...(grouped.get(key) ?? []), doc]);
  }

  const sections = [...grouped.entries()]
    .map(([status, docs]) => {
      const lines = docs.map((doc) => `- [${doc.displayTitle}](${pageLinkForSlug(doc.slug)}) — ${doc.product} / ${doc.section}`);
      return `## ${status}\n\n${lines.join("\n") || "- None"}`;
    })
    .join("\n\n");

  await writeTextFile(
    path.join(DOCS_DIR, "translation-status.md"),
    `# 翻译状态

该页面由 \`pnpm build:pages\` 生成，用来追踪中文译文覆盖情况。

${sections || "暂无文档。"}
`
  );
}

async function generatePages(manifest: DisplayManifest): Promise<void> {
  for (const doc of manifest.docs) {
    const source = normalizeMarkdown(await readTextFile(path.join(process.cwd(), doc.localSourcePath)));
    const translationPath = translationPathForSlug(doc.slug);
    const translation = existsSync(translationPath) ? normalizeMarkdown(await readTextFile(translationPath)) : "";
    const page = buildPage(doc, source, translation);
    await writeTextFile(path.join(process.cwd(), doc.localPagePath), page);
  }
}

function buildPage(doc: DisplayDocEntry, source: string, translation: string): string {
  const safeRawFallback = requiresRawFallback(source);
  const sourceBody = safeRawFallback
    ? rawMarkdownBlock(stripLeadingH1(stripFrontmatter(source)))
    : transformDocMarkdown(stripLeadingH1(stripFrontmatter(source)), doc.markdownUrl);
  const translationBody = translation ? transformDocMarkdown(stripLeadingH1(stripFrontmatter(translation)), doc.markdownUrl) : "";
  const translated = doc.translationStatus === "translated" || doc.translationStatus === "needs-review";
  const translationNote =
    doc.translationStatus === "needs-review"
      ? "::: danger 译文待复核\n官方英文源文档已经变化，请复核本页中文译文。\n:::\n\n"
      : "";

  const body = translated
    ? `## 中文译文\n\n${translationNote}::: v-pre\n${translationBody}\n:::\n\n## English source\n\n::: details 展开英文原文\n::: v-pre\n${sourceBody}\n:::\n:::\n`
    : `## English source\n\n::: tip 待翻译\n当前页面还没有中文译文。你可以在 \`${relativeFromRoot(
        translationPathForSlug(doc.slug)
      )}\` 添加对应中文内容。\n:::\n\n${
        safeRawFallback
          ? "::: info 安全渲染\n该页包含官方交互组件残留，已以 raw Markdown 形式保留完整源文档，避免 VitePress/Vue 编译错误。\n:::\n\n"
          : "::: v-pre\n"
      }${sourceBody}${safeRawFallback ? "" : "\n:::"}\n`;

  return `---
title: ${escapeYamlString(doc.displayTitle)}
description: ${escapeYamlString(doc.description || doc.title)}
outline: deep
---

# ${doc.displayTitle}

**文档集**：${doc.product}  
**分组**：${doc.section}  
**翻译状态**：${statusLabel(doc.translationStatus)}

::: warning 非官方本地镜像
- 官方来源：[${doc.sourceUrl}](${doc.sourceUrl})
- Markdown 来源：[${doc.markdownUrl}](${doc.markdownUrl})
- 抓取时间：${doc.fetchedAt}
- Checksum：\`${doc.checksum}\`
:::

${body}
`;
}

function requiresRawFallback(markdown: string): boolean {
  return /data-content-switcher-pane|<span\s+slot=|<Cards\b|<Card\b|<table\b|className=|style=\{\{/i.test(markdown);
}

function rawMarkdownBlock(markdown: string): string {
  const fence = "``````";
  return `${fence}markdown\n${markdown.trimEnd()}\n${fence}`;
}

function transformDocMarkdown(markdown: string, markdownUrl: string): string {
  return transformOutsideCode(collapseMultilineLinks(markdown), (line) =>
    dropUnsafeMarkdownLine(line) ??
    dropRawHtmlWrapperLine(line) ??
    escapeRawHtml(rewriteRootPathHrefs(rewriteImages(rewriteLinks(escapeVueMustache(stripHeadingAnchorAttrs(line)), markdownUrl), markdownUrl)))
  );
}

function collapseMultilineLinks(markdown: string): string {
  return markdown.replace(/\[([^\]\n]+)\n([^\]]+)\]\(([^)]+)\)/g, (_full, first: string, second: string, href: string) => {
    return `[${first.trim()} ${second.trim()}](${href})`;
  });
}

function transformOutsideCode(markdown: string, transform: (line: string) => string): string {
  let inFence = false;
  let fenceMarker = "";
  return markdown
    .split(/\r?\n/)
    .map((line) => {
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
        return normalizeFenceLine(line);
      }
      return inFence ? line : transform(line);
    })
    .join("\n");
}

function normalizeFenceLine(line: string): string {
  const trimmed = line.trimStart();
  const match = trimmed.match(/^(`{3,}|~{3,})([A-Za-z0-9_+#.-]+)?(.*)$/);
  if (!match || !match[2]) return trimmed;
  const aliases: Record<string, string> = {
    cli: "bash",
    prompt: "text",
    "example-chat": "text",
    "example-content": "text",
    response: "json",
    react: "jsx"
  };
  const lang = match[2];
  return `${match[1]}${aliases[lang.toLowerCase()] ?? lang}${match[3]}`;
}

function escapeVueMustache(line: string): string {
  return line.replaceAll("{{", "&#123;&#123;").replaceAll("}}", "&#125;&#125;");
}

function stripHeadingAnchorAttrs(line: string): string {
  return line.replace(/^(\s{0,3}#{1,6}\s+.*?)\s+\{#[A-Za-z0-9_-]+\}\s*$/, "$1");
}

function escapeRawHtml(line: string): string {
  return line.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function dropRawHtmlWrapperLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return line;
  if (/^<\/?[A-Za-z][^>]*>$/.test(trimmed)) return "";
  if (/^<([A-Za-z][A-Za-z0-9:-]*)(\s+[^>]*)?>.*<\/\1>$/.test(trimmed)) {
    return trimmed.replace(/^<([A-Za-z][A-Za-z0-9:-]*)(\s+[^>]*)?>/, "").replace(/<\/[A-Za-z][A-Za-z0-9:-]*>$/, "");
  }
  return null;
}

function dropUnsafeMarkdownLine(line: string): string | null {
  return /^\s*\{\/\*.*\*\/\}\s*$/.test(line) ? "" : null;
}

function rewriteLinks(line: string, markdownUrl: string): string {
  return line.replace(/(?<!!)\[([^\]]+)\]\(([^)\s]+)(#[^)]+)?\)/g, (full, label: string, href: string, hash: string = "") => {
    const rewritten = localDocHref(href, markdownUrl, hash);
    if (rewritten) return `[${label}](${rewritten})`;
    const official = officialHref(href, markdownUrl);
    return official ? `[${label}](${official})` : full;
  });
}

function rewriteImages(line: string, markdownUrl: string): string {
  return line.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (full, alt: string, href: string, title?: string) => {
    const rewritten = localAssetHref(href, markdownUrl);
    if (!rewritten) return full;
    return title ? `![${alt}](${rewritten} "${title}")` : `![${alt}](${rewritten})`;
  });
}

function rewriteRootPathHrefs(line: string): string {
  return line.replace(/\]\((\/(?!mirror\/|openai-assets\/)[^)]+)\)/g, (_full, href: string) => {
    return `](https://developers.openai.com${href})`;
  });
}

function localDocHref(href: string, markdownUrl: string, explicitHash: string): string | null {
  try {
    const resolved = new URL(href, markdownUrl);
    if (resolved.hostname !== "developers.openai.com") return null;
    const hash = explicitHash || resolved.hash || "";
    const withoutHash = new URL(resolved.toString());
    withoutHash.hash = "";
    withoutHash.search = "";
    const candidates = [withoutHash.toString()];
    if (withoutHash.pathname.endsWith(".md")) {
      const sourceUrl = new URL(withoutHash.toString());
      sourceUrl.pathname = sourceUrl.pathname.replace(/\.md$/, "");
      candidates.push(sourceUrl.toString());
    } else {
      const markdownTwin = new URL(withoutHash.toString());
      markdownTwin.pathname = `${markdownTwin.pathname.replace(/\/$/, "")}.md`;
      candidates.push(markdownTwin.toString());
    }

    for (const candidate of candidates) {
      const slug = urlMap.get(candidate);
      if (slug) return `${pageLinkForSlug(slug)}${hash}`;
    }
    return null;
  } catch {
    return null;
  }
}

function localAssetHref(href: string, markdownUrl: string): string | null {
  try {
    const resolved = new URL(href, markdownUrl);
    if (resolved.hostname !== "developers.openai.com") return null;
    if (resolved.pathname.endsWith(".md") || resolved.pathname.endsWith(".txt")) return null;
    const safePath = resolved.pathname
      .replace(/^\/+/, "")
      .split("/")
      .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"))
      .join("/");
    const localHref = `/openai-assets/${resolved.hostname}/${safePath}`;
    const localPath = path.join(DOCS_DIR, "public", localHref.replace(/^\/+/, ""));
    return existsSync(localPath) ? localHref : resolved.toString();
  } catch {
    return null;
  }
}

function officialHref(href: string, markdownUrl: string): string | null {
  try {
    const resolved = new URL(href, markdownUrl);
    if (resolved.hostname !== "developers.openai.com") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function buildUrlMap(docs: DocEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const doc of docs) {
    map.set(doc.markdownUrl, doc.slug);
    map.set(doc.sourceUrl, doc.slug);
    map.set(doc.sourceUrl.replace(/\/$/, ""), doc.slug);
  }
  return map;
}

async function generateVitePressData(manifest: DisplayManifest): Promise<void> {
  const generatedDir = path.join(DOCS_DIR, ".vitepress", "generated");
  await ensureDir(generatedDir);
  await writeJsonFile(path.join(generatedDir, "sidebar.json"), buildSidebar(manifest));
  await writeJsonFile(path.join(generatedDir, "nav.json"), [
    { text: "首页", link: "/" },
    { text: "目录", link: "/catalog" },
    { text: "翻译状态", link: "/translation-status" },
    { text: "官方 Docs", link: "https://developers.openai.com/" }
  ]);
}

function buildSidebar(manifest: DisplayManifest): unknown[] {
  const base: unknown[] = [
    {
      text: "中文镜像",
      items: [
        { text: "首页", link: "/" },
        { text: "文档目录", link: "/catalog" },
        { text: "翻译状态", link: "/translation-status" }
      ]
    }
  ];

  const byProduct = new Map<string, DisplayDocEntry[]>();
  for (const doc of manifest.docs) {
    byProduct.set(doc.product, [...(byProduct.get(doc.product) ?? []), doc]);
  }

  for (const [product, docs] of byProduct) {
    const bySection = new Map<string, DisplayDocEntry[]>();
    for (const doc of docs) {
      bySection.set(doc.section, [...(bySection.get(doc.section) ?? []), doc]);
    }
    base.push({
      text: product,
      collapsed: true,
      items: [...bySection.entries()].map(([section, sectionDocs]) => ({
        text: section,
        collapsed: true,
        items: sectionDocs.map((doc) => ({
          text: doc.displayTitle,
          link: pageLinkForSlug(doc.slug)
        }))
      }))
    });
  }

  return base;
}

async function writeBuildReport(manifest: DisplayManifest): Promise<void> {
  await ensureDir(REPORTS_DIR);
  await writeTextFile(
    path.join(REPORTS_DIR, "build-report.md"),
    `# Build Pages Report

Generated at: ${new Date().toISOString()}
Manifest generated at: ${manifest.generatedAt}
Pages generated: ${manifest.docs.length}
Products: ${manifest.products.join(", ") || "None"}
`
  );
}

function statusLabel(status: string): string {
  if (status === "translated") return "已翻译";
  if (status === "needs-review") return "译文待复核";
  return "待翻译";
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, "\\|");
}
