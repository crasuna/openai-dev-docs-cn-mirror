import { existsSync } from "node:fs";
import path from "node:path";
import {
  DOCS_DIR,
  MANIFEST_PATH,
  MIRROR_DIR,
  NAVIGATION_PATH,
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
import type { DocEntry, Manifest, NavigationItem, NavigationSection, NavigationSnapshot, TopNavigationGroup } from "./types.js";

interface DisplayDocEntry extends DocEntry {
  displayProduct: string;
  displaySection: string;
  displayTitle: string;
}

interface DisplayManifest extends Omit<Manifest, "docs"> {
  docs: DisplayDocEntry[];
}

interface OrderedNavigation {
  products: OrderedProductNavigation[];
}

interface OrderedProductNavigation {
  product: string;
  displayProduct: string;
  items: OrderedNavigationItem[];
}

type OrderedNavigationItem = OrderedNavigationLink | OrderedNavigationSection;

interface OrderedNavigationLink {
  type: "link";
  doc: DisplayDocEntry;
}

interface OrderedNavigationSection {
  type: "section";
  title: string;
  displayTitle: string;
  doc?: DisplayDocEntry;
  items: OrderedNavigationItem[];
  fallback?: boolean;
}

interface VitePressNavItem {
  text: string;
  link?: string;
  items?: VitePressNavItem[];
}

interface VitePressSidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: VitePressSidebarItem[];
}

type VitePressSidebar = Record<string, VitePressSidebarItem[]>;

interface TopNavigationGroupConfig {
  text: string;
  officialTitle: string;
  items: TopNavigationTarget[];
}

interface TopNavigationTarget {
  text: string;
  officialTitle: string;
  officialHref: string;
  product: string;
  preferredSlugs: string[];
}

const PRODUCT_DISPLAY_LABELS: Record<string, string> = {
  "Ads": "广告",
  "API Reference": "API 参考",
  "Apps SDK": "Apps SDK",
  "Codex": "Codex",
  "Commerce": "商务",
  "OpenAI API Docs": "OpenAI API 文档",
  "Workspace Agents": "工作区智能体"
};

const PRODUCT_SIDEBAR_PREFIXES: Record<string, string> = {
  "Ads": "/mirror/ads/",
  "API Reference": "/mirror/api/reference/",
  "Apps SDK": "/mirror/apps-sdk/",
  "Codex": "/mirror/codex/",
  "Commerce": "/mirror/commerce/",
  "OpenAI API Docs": "/mirror/api/docs/",
  "Workspace Agents": "/mirror/workspace-agents/"
};

const SECTION_DISPLAY_LABELS: Record<string, string> = {
  "Ads — Api Overview": "API 概览",
  "Ads — Api Quickstart": "API 快速开始",
  "Ads — Api Reference": "API 参考",
  "Ads — Campaign Targeting": "广告活动定向",
  "Ads — Conversions Api": "转化 API",
  "Ads — Image Tag": "图片标签",
  "Ads — Measurement Pixel": "测量像素",
  "Ads — Product Feeds": "商品 Feed",
  "Ads — Supported Events": "支持的事件",
  "Agentic Commerce — Guides": "指南",
  "Agentic Commerce — Specs": "规范",
  "Apps SDK — App Submission Guidelines": "应用提交指南",
  "Apps SDK — Build": "构建",
  "Apps SDK — Concepts": "概念",
  "Apps SDK — Deploy": "部署",
  "Apps SDK — Guides": "指南",
  "Apps SDK — Mcp Apps In Chatgpt": "ChatGPT 中的 MCP 应用",
  "Apps SDK — Plan": "规划",
  "Apps SDK — Quickstart": "快速开始",
  "Codex — Agent Approvals Security": "智能体审批与安全",
  "Codex — Amazon Bedrock": "Amazon Bedrock",
  "Codex — App": "应用",
  "Codex — App Server": "应用服务器",
  "Codex — Appshots": "应用快照",
  "Codex — Auth": "身份验证",
  "Codex — Cli": "CLI",
  "Codex — Cloud": "云端",
  "Codex — Community": "社区",
  "Codex — Concepts": "概念",
  "Codex — Config Advanced": "高级配置",
  "Codex — Config Basic": "基础配置",
  "Codex — Config Reference": "配置参考",
  "Codex — Config Sample": "配置示例",
  "Codex — Custom Prompts": "自定义提示",
  "Codex — Enterprise": "企业",
  "Codex — Environment Variables": "环境变量",
  "Codex — Feature Maturity": "功能成熟度",
  "Codex — Github Action": "GitHub Action",
  "Codex — Glossary": "术语表",
  "Codex — Guides": "指南",
  "Codex — Hooks": "钩子",
  "Codex — Ide": "IDE",
  "Codex — Import": "导入",
  "Codex — Integrations": "集成",
  "Codex — Learn": "学习",
  "Codex — Mcp": "MCP",
  "Codex — Memories": "记忆",
  "Codex — Models": "模型",
  "Codex — Noninteractive": "非交互式",
  "Codex — Open Source": "开源",
  "Codex — Overview": "概览",
  "Codex — Permissions": "权限",
  "Codex — Plugins": "插件",
  "Codex — Pricing": "价格",
  "Codex — Prompting": "提示",
  "Codex — Quickstart": "快速开始",
  "Codex — Record And Replay": "录制与回放",
  "Codex — Remote Connections": "远程连接",
  "Codex — Rules": "规则",
  "Codex — Sdk": "SDK",
  "Codex — Security": "安全",
  "Codex — Sites": "站点",
  "Codex — Skills": "技能",
  "Codex — Speed": "速度",
  "Codex — Subagents": "子代理",
  "Codex — Videos": "视频",
  "Codex — Windows": "Windows",
  "Codex — Workflows": "工作流",
  "Documentation sets": "文档集",
  "OpenAI API — Docs": "文档",
  "OpenAI API — Reference": "参考",
  "Workspace Agents — Authentication": "身份验证",
  "Workspace Agents — Trigger Runs": "触发运行"
};

const NAVIGATION_GROUP_DISPLAY_LABELS: Record<string, string> = {
  "API": "API",
  "API Reference": "API 参考",
  "Administration": "管理",
  "Agents SDK": "Agents SDK",
  "Agent Builder": "Agent Builder",
  "App": "应用",
  "Assistants": "Assistants 助手",
  "Assistants API": "Assistants API",
  "Audio": "音频",
  "Authentication": "身份验证",
  "Automation": "自动化",
  "Advertiser API": "广告主 API",
  "Batches": "批处理",
  "Build": "构建",
  "Calls": "调用",
  "Chat Completions": "Chat Completions",
  "ChatGPT Actions": "ChatGPT Actions",
  "ChatKit": "ChatKit",
  "Checkpoints": "检查点",
  "CLI": "CLI",
  "Client Secrets": "客户端密钥",
  "Completions": "Completions 补全",
  "Concepts": "概念",
  "Configuration": "配置",
  "Config File": "配置文件",
  "Connection methods": "连接方式",
  "Containers": "容器",
  "Content": "内容",
  "Context management": "上下文管理",
  "Conversations": "Conversations 对话",
  "Conversion apps": "转化应用",
  "Codex Security": "Codex Security",
  "Codex Security cloud": "Codex Security 云端",
  "Codex Security plugin": "Codex Security 插件",
  "Cost optimization": "成本优化",
  "Core Concepts": "核心概念",
  "Core concepts": "核心概念",
  "Deploy": "部署",
  "Deployment": "部署",
  "Embeddings": "嵌入",
  "Enterprise": "企业",
  "Evals": "评估",
  "Evaluation": "评估",
  "File Upload": "文件上传",
  "File Batches": "文件批次",
  "File search and retrieval": "文件搜索与检索",
  "Files": "文件",
  "Fine Tuning": "微调",
  "Fine-tuning": "微调",
  "Get started": "入门",
  "Getting Started": "入门",
  "Going live": "上线",
  "Guides": "指南",
  "IDE Extension": "IDE 扩展",
  "Images": "图像",
  "Integrations": "集成",
  "Items": "项",
  "Jobs": "作业",
  "Latency optimization": "延迟优化",
  "Learn": "学习",
  "Legacy": "旧版",
  "Legacy APIs": "旧版 API",
  "Measurement": "衡量",
  "Messages": "消息",
  "Models": "模型",
  "Moderations": "内容审核",
  "More tools": "更多工具",
  "Parts": "分片",
  "Permissions": "权限",
  "Plan": "规划",
  "Platform APIs": "平台 API",
  "Plugins": "插件",
  "Prompting": "提示",
  "Realtime": "Realtime",
  "Realtime and audio": "Realtime 与音频",
  "Realtime Beta": "Realtime Beta",
  "Realtime sessions": "Realtime 会话",
  "Reasoning": "推理",
  "Releases": "发布",
  "Responses": "Responses 响应",
  "Responses API": "Responses API",
  "Resources": "资源",
  "Runs": "运行",
  "Run and scale": "运行与扩展",
  "Safety": "安全",
  "Security": "安全",
  "Sessions": "会话",
  "Skills": "技能",
  "SDKs and CLI": "SDK 和 CLI",
  "Specialized models": "专用模型",
  "Steps": "步骤",
  "Threads": "线程",
  "Tools": "工具",
  "Transcription": "转录",
  "Uploads": "上传",
  "Using Codex": "使用 Codex",
  "Vector Stores": "向量存储",
  "Videos": "视频",
  "Voice Consents": "语音授权",
  "Web": "Web",
  "Webhooks": "Webhook"
};

const TOP_NAVIGATION_GROUPS: TopNavigationGroupConfig[] = [
  {
    text: "API",
    officialTitle: "API",
    items: [
      {
        text: "OpenAI API 文档",
        officialTitle: "Docs",
        officialHref: "/api/docs",
        product: "OpenAI API Docs",
        preferredSlugs: ["api/docs/quickstart"]
      },
      {
        text: "API 参考",
        officialTitle: "API reference",
        officialHref: "/api/reference/overview",
        product: "API Reference",
        preferredSlugs: ["api/reference/overview"]
      }
    ]
  },
  {
    text: "Codex",
    officialTitle: "Codex",
    items: [
      {
        text: "Codex 文档",
        officialTitle: "Docs",
        officialHref: "/codex",
        product: "Codex",
        preferredSlugs: ["codex/overview"]
      },
      {
        text: "快速开始",
        officialTitle: "Quickstart",
        officialHref: "/codex/quickstart",
        product: "Codex",
        preferredSlugs: ["codex/quickstart"]
      }
    ]
  },
  {
    text: "ChatGPT",
    officialTitle: "ChatGPT",
    items: [
      {
        text: "Apps SDK",
        officialTitle: "Apps SDK",
        officialHref: "/apps-sdk",
        product: "Apps SDK",
        preferredSlugs: ["apps-sdk/quickstart"]
      },
      {
        text: "工作区智能体",
        officialTitle: "Workspace Agents",
        officialHref: "/workspace-agents",
        product: "Workspace Agents",
        preferredSlugs: ["workspace-agents/authentication"]
      },
      {
        text: "商务",
        officialTitle: "Commerce",
        officialHref: "/commerce",
        product: "Commerce",
        preferredSlugs: ["commerce/guides/get-started"]
      },
      {
        text: "广告",
        officialTitle: "Ads",
        officialHref: "/ads",
        product: "Ads",
        preferredSlugs: ["ads/api-overview"]
      }
    ]
  }
];

const warnedDisplayProducts = new Set<string>();
const warnedDisplaySections = new Set<string>();
const warnedNavigationLabels = new Set<string>();
const warnedNavigationBuild = new Set<string>();
const warnedTopNavigation = new Set<string>();

const manifest = await refreshTranslationStatuses(await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest()));
const displayManifest = await addDisplayMetadata(manifest);
const navigationSnapshot = await readJsonFile<NavigationSnapshot | null>(NAVIGATION_PATH, null);
const urlMap = buildUrlMap(displayManifest.docs);

await ensureDir(DOCS_DIR);
await removeGeneratedDir(MIRROR_DIR);
await generateHome(displayManifest);
await generateCatalog(displayManifest, navigationSnapshot);
await generateTranslationStatus(displayManifest);
await generatePages(displayManifest);
await generateVitePressData(displayManifest, navigationSnapshot);
await writeBuildReport(displayManifest);

console.log(`Generated ${displayManifest.docs.length} pages under ${relativeFromRoot(MIRROR_DIR)}.`);

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

async function addDisplayMetadata(manifest: Manifest): Promise<DisplayManifest> {
  const docs: DisplayDocEntry[] = [];
  for (const doc of manifest.docs) {
    docs.push({
      ...doc,
      displayProduct: displayProductLabel(doc.product),
      displaySection: displaySectionLabel(doc.section),
      displayTitle: await displayTitleForDoc(doc)
    });
  }
  return { ...manifest, docs };
}

function displayProductLabel(product: string): string {
  const label = PRODUCT_DISPLAY_LABELS[product];
  if (label) return label;
  warnOnce(warnedDisplayProducts, `Unmapped product metadata: ${product}`);
  return product;
}

function displaySectionLabel(section: string): string {
  const label = SECTION_DISPLAY_LABELS[section];
  if (label) return label;
  warnOnce(warnedDisplaySections, `Unmapped section metadata: ${section}`);
  return section;
}

function warnOnce(warned: Set<string>, message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
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
      return `| ${escapeTable(displayProductLabel(product))} | ${count} | [浏览](${productLink(product, manifest.docs)}) |`;
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

async function generateCatalog(manifest: DisplayManifest, navigation: NavigationSnapshot | null): Promise<void> {
  const ordered = buildOrderedNavigation(manifest, navigation);
  const sections = ordered.products.map((product) => {
    const items = renderCatalogItems(product.items, 0);
    return `## ${escapeMarkdownText(product.displayProduct)}\n\n${items || "- 暂无文档"}`;
  });

  await writeTextFile(
    path.join(DOCS_DIR, "catalog.md"),
    `# 文档目录

该页面按 OpenAI Developers 官方站左侧导航的层级与顺序生成；未被官方导航快照覆盖但已镜像的页面会追加在对应文档集末尾。

${sections.join("\n\n") || "暂无文档。"}
`
  );
}

function renderCatalogItems(items: OrderedNavigationItem[], depth: number): string {
  const indent = "  ".repeat(depth);
  return items
    .map((item) => {
      if (item.type === "link") {
        return `${indent}- ${catalogDocLink(item.doc)}`;
      }

      const sectionLink = item.doc ? `：${catalogDocLink(item.doc)}` : "";
      const nested = renderCatalogItems(item.items, depth + 1);
      return [`${indent}- **${escapeMarkdownText(item.displayTitle)}**${sectionLink}`, nested].filter(Boolean).join("\n");
    })
    .join("\n");
}

function catalogDocLink(doc: DisplayDocEntry): string {
  return `[${escapeMarkdownText(doc.displayTitle)}](${pageLinkForSlug(doc.slug)}) — ${statusLabel(doc.translationStatus)} — [官方](${
    doc.sourceUrl
  })`;
}

async function generateTranslationStatus(manifest: DisplayManifest): Promise<void> {
  const grouped = new Map<string, DisplayDocEntry[]>();
  for (const doc of manifest.docs) {
    const key = statusLabel(doc.translationStatus);
    grouped.set(key, [...(grouped.get(key) ?? []), doc]);
  }

  const sections = [...grouped.entries()]
    .map(([status, docs]) => {
      const lines = docs.map(
        (doc) => `- [${doc.displayTitle}](${pageLinkForSlug(doc.slug)}) — ${doc.displayProduct} / ${doc.displaySection}`
      );
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

**文档集**：${doc.displayProduct}\\
**分组**：${doc.displaySection}\\
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

function buildOrderedNavigation(manifest: DisplayManifest, navigation: NavigationSnapshot | null): OrderedNavigation {
  if (!navigation) {
    warnOnce(warnedNavigationBuild, `Missing navigation snapshot: ${relativeFromRoot(NAVIGATION_PATH)}. Falling back to manifest order.`);
  }

  const docsBySlug = new Map(manifest.docs.map((doc) => [doc.slug, doc]));
  const navigationByProduct = new Map(navigation?.products.map((product) => [product.product, product]) ?? []);
  const products = manifest.products.map((product) => {
    const docs = manifest.docs.filter((doc) => doc.product === product);
    const navigationProduct = navigationByProduct.get(product);
    const usedSlugs = new Set<string>();
    let items: OrderedNavigationItem[] = [];

    if (navigationProduct?.items.length) {
      for (const warning of navigationProduct.warnings) {
        warnOnce(warnedNavigationBuild, `Navigation snapshot warning for ${product}: ${warning}`);
      }
      const stats = { skippedOfficialLinks: 0, duplicateOfficialLinks: 0 };
      items = materializeNavigationItems(navigationProduct.items, product, docsBySlug, usedSlugs, stats);
      if (stats.skippedOfficialLinks) {
        warnOnce(
          warnedNavigationBuild,
          `Skipped ${stats.skippedOfficialLinks} official navigation links for ${product} because they are not mirrored in the manifest.`
        );
      }
      if (stats.duplicateOfficialLinks) {
        warnOnce(warnedNavigationBuild, `Skipped ${stats.duplicateOfficialLinks} duplicate official navigation links for ${product}.`);
      }
    } else {
      warnOnce(warnedNavigationBuild, `No navigation snapshot items for ${product}. Falling back to manifest section order.`);
    }

    const fallbackDocs = docs.filter((doc) => !usedSlugs.has(doc.slug));
    if (fallbackDocs.length) {
      warnOnce(
        warnedNavigationBuild,
        `Appended ${fallbackDocs.length} mirrored docs for ${product} that were not found in the official navigation snapshot.`
      );
      items.push(...fallbackSectionsForDocs(fallbackDocs));
    }

    return {
      product,
      displayProduct: displayProductLabel(product),
      items
    };
  });

  return { products };
}

function materializeNavigationItems(
  items: NavigationItem[],
  product: string,
  docsBySlug: Map<string, DisplayDocEntry>,
  usedSlugs: Set<string>,
  stats: { skippedOfficialLinks: number; duplicateOfficialLinks: number }
): OrderedNavigationItem[] {
  const ordered: OrderedNavigationItem[] = [];
  for (const item of items) {
    if (item.type === "link") {
      const doc = takeNavigationDoc(item.slug, product, docsBySlug, usedSlugs, stats);
      if (doc) ordered.push({ type: "link", doc });
      continue;
    }

    const sectionDoc = item.slug ? takeNavigationDoc(item.slug, product, docsBySlug, usedSlugs, stats) : undefined;
    const sectionItems = materializeNavigationItems(item.items, product, docsBySlug, usedSlugs, stats);
    if (!sectionDoc && !sectionItems.length) continue;

    ordered.push({
      type: "section",
      title: item.title,
      displayTitle: displayNavigationGroupLabel(product, item, sectionDoc),
      doc: sectionDoc,
      items: sectionItems
    });
  }
  return ordered;
}

function takeNavigationDoc(
  slug: string,
  product: string,
  docsBySlug: Map<string, DisplayDocEntry>,
  usedSlugs: Set<string>,
  stats: { skippedOfficialLinks: number; duplicateOfficialLinks: number }
): DisplayDocEntry | undefined {
  if (usedSlugs.has(slug)) {
    stats.duplicateOfficialLinks += 1;
    return undefined;
  }

  const doc = docsBySlug.get(slug);
  if (!doc || doc.product !== product) {
    stats.skippedOfficialLinks += 1;
    return undefined;
  }

  usedSlugs.add(slug);
  return doc;
}

function fallbackSectionsForDocs(docs: DisplayDocEntry[]): OrderedNavigationItem[] {
  const bySection = new Map<string, DisplayDocEntry[]>();
  for (const doc of docs) {
    bySection.set(doc.section, [...(bySection.get(doc.section) ?? []), doc]);
  }

  return [...bySection.entries()].map(([section, sectionDocs]) => ({
    type: "section" as const,
    title: section,
    displayTitle: displaySectionLabel(section),
    items: sectionDocs.map((doc) => ({ type: "link" as const, doc })),
    fallback: true
  }));
}

function displayNavigationGroupLabel(product: string, item: NavigationSection, doc?: DisplayDocEntry): string {
  const productSpecific = NAVIGATION_GROUP_DISPLAY_LABELS[`${product}::${item.title}`];
  if (productSpecific) return productSpecific;
  const generic = NAVIGATION_GROUP_DISPLAY_LABELS[item.title];
  if (generic) return generic;
  if (doc) return doc.displayTitle;
  warnOnce(warnedNavigationLabels, `Unmapped official navigation group label for ${product}: ${item.title}`);
  return item.title;
}

async function generateVitePressData(manifest: DisplayManifest, navigation: NavigationSnapshot | null): Promise<void> {
  const generatedDir = path.join(DOCS_DIR, ".vitepress", "generated");
  await ensureDir(generatedDir);
  await writeJsonFile(path.join(generatedDir, "sidebar.json"), buildSidebar(manifest, navigation));
  await writeJsonFile(path.join(generatedDir, "nav.json"), buildTopNavigation(manifest, navigation));
}

function buildTopNavigation(manifest: DisplayManifest, navigation: NavigationSnapshot | null): VitePressNavItem[] {
  const docsBySlug = new Map(manifest.docs.map((doc) => [doc.slug, doc]));
  const navItems: VitePressNavItem[] = [{ text: "首页", link: "/" }];

  for (const group of TOP_NAVIGATION_GROUPS) {
    const officialGroup = findOfficialTopNavigationGroup(navigation, group.officialTitle);
    if (!officialGroup) {
      warnOnce(warnedTopNavigation, `Official top navigation group not found in snapshot: ${group.officialTitle}`);
    }

    const items = group.items
      .map((target) => resolveTopNavigationTarget(target, officialGroup, navigation, docsBySlug, manifest.docs))
      .filter((item): item is VitePressNavItem => Boolean(item));

    if (items.length) {
      navItems.push({
        text: group.text,
        items
      });
    } else {
      warnOnce(warnedTopNavigation, `No mirrored top navigation entries generated for group: ${group.text}`);
    }
  }

  navItems.push({ text: "官方文档", link: "https://developers.openai.com/" });

  return navItems;
}

function resolveTopNavigationTarget(
  target: TopNavigationTarget,
  officialGroup: TopNavigationGroup | undefined,
  navigation: NavigationSnapshot | null,
  docsBySlug: Map<string, DisplayDocEntry>,
  docs: DisplayDocEntry[]
): VitePressNavItem | null {
  const officialItem = officialGroup?.items.find(
    (item) => normalizeTopNavigationText(item.title) === normalizeTopNavigationText(target.officialTitle) || item.href === target.officialHref
  );
  const candidateSlugs = [
    officialItem?.slug,
    officialHrefToSlug(officialItem?.href),
    officialHrefToSlug(target.officialHref),
    ...target.preferredSlugs,
    firstMirroredSlugFromOfficialProductNavigation(target.product, navigation, docsBySlug)
  ].filter((slug): slug is string => Boolean(slug));

  for (const slug of candidateSlugs) {
    const doc = docsBySlug.get(slug);
    if (doc?.product === target.product) {
      return {
        text: target.text,
        link: pageLinkForSlug(doc.slug)
      };
    }
  }

  const fallbackDoc = docs.find((doc) => doc.product === target.product);
  if (fallbackDoc) {
    warnOnce(
      warnedTopNavigation,
      `Falling back to first manifest doc for top navigation entry ${target.text}: ${fallbackDoc.slug}`
    );
    return {
      text: target.text,
      link: pageLinkForSlug(fallbackDoc.slug)
    };
  }

  warnOnce(warnedTopNavigation, `No mirrored document found for top navigation entry: ${target.text}`);
  return null;
}

function findOfficialTopNavigationGroup(
  navigation: NavigationSnapshot | null,
  title: string
): TopNavigationGroup | undefined {
  return navigation?.topNavigation?.find(
    (item): item is TopNavigationGroup => item.type === "group" && normalizeTopNavigationText(item.title) === normalizeTopNavigationText(title)
  );
}

function firstMirroredSlugFromOfficialProductNavigation(
  product: string,
  navigation: NavigationSnapshot | null,
  docsBySlug: Map<string, DisplayDocEntry>
): string | undefined {
  const navigationProduct = navigation?.products.find((entry) => entry.product === product);
  if (!navigationProduct) return undefined;
  return firstMirroredSlugFromNavigationItems(navigationProduct.items, product, docsBySlug);
}

function firstMirroredSlugFromNavigationItems(
  items: NavigationItem[],
  product: string,
  docsBySlug: Map<string, DisplayDocEntry>
): string | undefined {
  for (const item of items) {
    if (item.slug && docsBySlug.get(item.slug)?.product === product) return item.slug;
    if (item.type === "section") {
      const nested = firstMirroredSlugFromNavigationItems(item.items, product, docsBySlug);
      if (nested) return nested;
    }
  }
  return undefined;
}

function officialHrefToSlug(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const parsed = new URL(href, "https://developers.openai.com");
    if (parsed.hostname !== "developers.openai.com") return undefined;
    parsed.hash = "";
    parsed.search = "";
    const raw = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.md$/, "");
    if (!raw) return undefined;
    return raw
      .split("/")
      .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"))
      .filter(Boolean)
      .join("/");
  } catch {
    return undefined;
  }
}

function normalizeTopNavigationText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildSidebar(manifest: DisplayManifest, navigation: NavigationSnapshot | null): VitePressSidebar {
  const sidebar: VitePressSidebar = {
    "/": [
      {
        text: "中文镜像",
        items: [
          { text: "首页", link: "/" },
          { text: "文档目录", link: "/catalog" },
          { text: "翻译状态", link: "/translation-status" }
        ]
      }
    ]
  };
  const ordered = buildOrderedNavigation(manifest, navigation);
  for (const product of ordered.products) {
    const prefix = PRODUCT_SIDEBAR_PREFIXES[product.product];
    if (!prefix) {
      warnOnce(warnedNavigationBuild, `No sidebar path prefix configured for product: ${product.product}`);
      continue;
    }
    sidebar[prefix] = product.items.map(sidebarItemForNavigationItem);
  }
  return sidebar;
}

function sidebarItemForNavigationItem(item: OrderedNavigationItem): VitePressSidebarItem {
  if (item.type === "link") {
    return {
      text: item.doc.displayTitle,
      link: pageLinkForSlug(item.doc.slug)
    };
  }

  const sidebarItem: VitePressSidebarItem = {
    text: item.displayTitle,
    collapsed: true,
    items: item.items.map(sidebarItemForNavigationItem)
  };
  if (item.doc) sidebarItem.link = pageLinkForSlug(item.doc.slug);
  return sidebarItem;
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

function escapeMarkdownText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\*/g, "\\*").replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\|/g, "\\|");
}
