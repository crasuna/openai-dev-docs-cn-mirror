import {
  MANIFEST_PATH,
  NAVIGATION_PATH,
  createEmptyManifest,
  readJsonFile,
  writeJsonFile
} from "./lib.js";
import { fetchText } from "./fetch-utils.js";
import type { Manifest, NavigationItem, NavigationProduct, NavigationSnapshot } from "./types.js";

const OFFICIAL_ORIGIN = "https://developers.openai.com";

const PRODUCT_NAVIGATION_SOURCES: Record<string, string> = {
  "Ads": "https://developers.openai.com/ads/api-overview",
  "API Reference": "https://developers.openai.com/api/reference/overview",
  "Apps SDK": "https://developers.openai.com/apps-sdk/quickstart",
  "Codex": "https://developers.openai.com/codex/quickstart",
  "Commerce": "https://developers.openai.com/commerce/guides/get-started",
  "OpenAI API Docs": "https://developers.openai.com/docs/overview",
  "Workspace Agents": "https://developers.openai.com/workspace-agents/authentication"
};

interface HtmlNode {
  type: "root" | "element" | "text";
  tag?: string;
  attrs: Record<string, string>;
  children: HtmlNode[];
  text?: string;
  parent?: HtmlNode;
  start: number;
}

const manifest = await readJsonFile<Manifest>(MANIFEST_PATH, createEmptyManifest());
const products: NavigationProduct[] = [];

for (const product of manifest.products) {
  const sourceUrl = PRODUCT_NAVIGATION_SOURCES[product] ?? manifest.docs.find((doc) => doc.product === product)?.sourceUrl;
  if (!sourceUrl) {
    products.push({ product, sourceUrl: "", items: [], warnings: [`No source URL found for product: ${product}`] });
    continue;
  }

  try {
    console.log(`Fetching navigation for ${product}: ${sourceUrl}`);
    const html = await fetchText(sourceUrl);
    const parsed = parseOfficialNavigation(html);
    products.push({ product, sourceUrl, items: parsed.items, warnings: parsed.warnings });
    console.log(`Parsed ${countNavigationLinks(parsed.items)} links for ${product}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    products.push({
      product,
      sourceUrl,
      items: [],
      warnings: [`Failed to fetch or parse official navigation: ${message}`]
    });
    console.warn(`Failed to fetch navigation for ${product}: ${message}`);
  }
}

const snapshot: NavigationSnapshot = {
  generatedAt: new Date().toISOString(),
  source: OFFICIAL_ORIGIN,
  products
};

await writeJsonFile(NAVIGATION_PATH, snapshot);
console.log(`Wrote navigation snapshot with ${products.length} products to sources/navigation.json.`);

function parseOfficialNavigation(html: string): { items: NavigationItem[]; warnings: string[] } {
  const dataLeftNav = extractDataLeftNavHtml(html);
  if (dataLeftNav) {
    return { items: parseDataLeftNav(dataLeftNav), warnings: [] };
  }

  const starlightSidebar = extractStarlightSidebarHtml(html);
  if (starlightSidebar) {
    return { items: parseStarlightSidebar(starlightSidebar), warnings: [] };
  }

  return { items: [], warnings: ["No official left navigation block found."] };
}

function extractDataLeftNavHtml(html: string): string | null {
  const matches = [...html.matchAll(/<nav\b[^>]*data-left-nav[^>]*>/gi)];
  const candidates = matches
    .map((match) => {
      const block = extractElementHtml(html, match.index ?? 0, "nav");
      return block ? { opening: match[0], block } : null;
    })
    .filter((candidate): candidate is { opening: string; block: string } => Boolean(candidate));

  return candidates.find((candidate) => /data-left-nav-id=/i.test(candidate.opening))?.block ?? candidates[0]?.block ?? null;
}

function extractStarlightSidebarHtml(html: string): string | null {
  const marker = html.search(/id=["']starlight__sidebar["']/i);
  if (marker === -1) return null;
  const start = html.lastIndexOf("<div", marker);
  if (start === -1) return null;
  return extractElementHtml(html, start, "div");
}

function extractElementHtml(html: string, start: number, tag: string): string | null {
  const re = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = start;
  let depth = 0;
  let sawOpening = false;
  for (let match = re.exec(html); match; match = re.exec(html)) {
    const token = match[0];
    const isClosing = /^<\//.test(token);
    const isSelfClosing = /\/>$/.test(token);
    if (!isClosing) {
      sawOpening = true;
      if (!isSelfClosing) depth += 1;
    } else if (sawOpening) {
      depth -= 1;
    }
    if (sawOpening && depth === 0) return html.slice(start, re.lastIndex);
  }
  return null;
}

function parseDataLeftNav(html: string): NavigationItem[] {
  const items: NavigationItem[] = [];
  const firstH3Index = html.search(/<h3\b/i);
  if (firstH3Index > -1) {
    items.push(...parsePrefixNavigationLinks(html.slice(0, firstH3Index)));
  }

  const root = parseHtmlFragment(html);
  const h3Nodes = findDescendants(root, (node) => node.tag === "h3");
  for (const h3 of h3Nodes) {
    const ul = nextElementSibling(h3, "ul");
    if (!ul) continue;
    const sectionItems = parseNavigationList(ul);
    if (!sectionItems.length) continue;
    items.push({
      type: "section",
      title: textContent(h3),
      items: sectionItems
    });
  }

  if (!items.length) {
    const firstList = findDescendant(root, (node) => node.tag === "ul");
    if (firstList) return parseNavigationList(firstList);
    return parsePrefixNavigationLinks(html);
  }

  return items;
}

function parsePrefixNavigationLinks(html: string): NavigationItem[] {
  const root = parseHtmlFragment(html);
  const firstList = findDescendant(root, (node) => node.tag === "ul");
  if (firstList) return parseNavigationList(firstList);
  return findDescendants(root, (node) => node.tag === "a").map(anchorToNavigationLink).filter(isNavigationLink);
}

function parseStarlightSidebar(html: string): NavigationItem[] {
  const root = parseHtmlFragment(html);
  const sidebarRoot = findDescendant(root, (node) => hasClass(node, "stldocs-sidebar"));
  const firstList = sidebarRoot ? findDescendant(sidebarRoot, (node) => node.tag === "ul") : findDescendant(root, (node) => node.tag === "ul");
  return firstList ? parseNavigationList(firstList) : [];
}

function parseNavigationList(ul: HtmlNode): NavigationItem[] {
  const items: NavigationItem[] = [];
  for (const li of elementChildren(ul).filter((child) => child.tag === "li")) {
    const item = parseNavigationListItem(li);
    if (item) items.push(item);
  }
  return items;
}

function parseNavigationListItem(li: HtmlNode): NavigationItem | null {
  const disclosure = findDisclosureNode(li);
  if (disclosure) {
    const summary = findSummaryNode(disclosure);
    const summaryLink = summary ? findDescendant(summary, (node) => node.tag === "a") : null;
    const nestedList = findDescendant(disclosure, (node) => node.tag === "ul" && (!summary || !isDescendantOf(node, summary)));
    const children = nestedList ? parseNavigationList(nestedList) : [];
    const link = summaryLink ? anchorToNavigationLink(summaryLink) : null;
    const title = (summaryLink ? textContent(summaryLink) : summary ? summaryText(summary) : "").trim();

    if (children.length) {
      return {
        type: "section",
        title: title || link?.title || "Untitled",
        href: link?.href,
        slug: link?.slug,
        items: children
      };
    }
    return link;
  }

  const anchor = findDescendant(li, (node) => node.tag === "a");
  return anchor ? anchorToNavigationLink(anchor) : null;
}

function findDisclosureNode(li: HtmlNode): HtmlNode | null {
  return (
    elementChildren(li).find((child) => child.tag === "details") ??
    findDescendant(li, (node) => hasClass(node, "stldocs-sidebar-expander"))
  );
}

function findSummaryNode(node: HtmlNode): HtmlNode | null {
  return (
    elementChildren(node).find((child) => child.tag === "summary") ??
    findDescendant(node, (child) => hasClass(child, "stldocs-expander-summary"))
  );
}

function summaryText(summary: HtmlNode): string {
  const span = findDescendant(summary, (node) => node.tag === "span");
  return span ? textContent(span) : textContent(summary);
}

function anchorToNavigationLink(anchor: HtmlNode): NavigationItem | null {
  const href = anchor.attrs.href;
  const slug = href ? slugFromOfficialHref(href) : null;
  if (!href || !slug) return null;
  return {
    type: "link",
    title: textContent(anchor),
    href,
    slug
  };
}

function isNavigationLink(item: NavigationItem | null): item is NavigationItem {
  return Boolean(item);
}

function slugFromOfficialHref(href: string): string | null {
  try {
    const parsed = new URL(href, OFFICIAL_ORIGIN);
    if (parsed.hostname !== "developers.openai.com") return null;
    parsed.hash = "";
    parsed.search = "";
    const raw = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.md$/, "");
    if (!raw) return null;
    return raw
      .split("/")
      .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"))
      .filter(Boolean)
      .join("/");
  } catch {
    return null;
  }
}

function parseHtmlFragment(html: string): HtmlNode {
  const root: HtmlNode = { type: "root", attrs: {}, children: [], start: 0 };
  const stack: HtmlNode[] = [root];
  const tagRe = /<!--[\s\S]*?-->|<![^>]*>|<\/?([A-Za-z][A-Za-z0-9:-]*)([^>]*)>/g;
  let cursor = 0;

  for (let match = tagRe.exec(html); match; match = tagRe.exec(html)) {
    if ((match.index ?? 0) > cursor) {
      appendText(stack.at(-1) ?? root, html.slice(cursor, match.index));
    }

    const full = match[0];
    cursor = tagRe.lastIndex;
    if (full.startsWith("<!--") || full.startsWith("<!")) continue;

    const tag = match[1]?.toLowerCase();
    if (!tag) continue;

    if (full.startsWith("</")) {
      closeElement(stack, tag);
      continue;
    }

    const node: HtmlNode = {
      type: "element",
      tag,
      attrs: parseAttributes(match[2] ?? ""),
      children: [],
      parent: stack.at(-1),
      start: match.index ?? 0
    };
    (stack.at(-1) ?? root).children.push(node);
    if (!full.endsWith("/>") && !isVoidTag(tag)) stack.push(node);
  }

  if (cursor < html.length) appendText(stack.at(-1) ?? root, html.slice(cursor));
  return root;
}

function appendText(parent: HtmlNode, text: string): void {
  if (!text) return;
  parent.children.push({
    type: "text",
    attrs: {},
    children: [],
    text,
    parent,
    start: parent.start
  });
}

function closeElement(stack: HtmlNode[], tag: string): void {
  for (let index = stack.length - 1; index > 0; index -= 1) {
    if (stack[index].tag === tag) {
      stack.length = index;
      return;
    }
  }
}

function parseAttributes(value: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRe = /([:@A-Za-z0-9_.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (let match = attrRe.exec(value); match; match = attrRe.exec(value)) {
    attrs[match[1]] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function isVoidTag(tag: string): boolean {
  return new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]).has(
    tag
  );
}

function elementChildren(node: HtmlNode): HtmlNode[] {
  return node.children.filter((child) => child.type === "element");
}

function nextElementSibling(node: HtmlNode, tag: string): HtmlNode | null {
  const parent = node.parent;
  if (!parent) return null;
  const siblings = elementChildren(parent);
  const index = siblings.indexOf(node);
  for (const sibling of siblings.slice(index + 1)) {
    if (sibling.tag === tag) return sibling;
  }
  return null;
}

function findDescendant(node: HtmlNode, predicate: (node: HtmlNode) => boolean): HtmlNode | null {
  for (const child of elementChildren(node)) {
    if (predicate(child)) return child;
    const nested = findDescendant(child, predicate);
    if (nested) return nested;
  }
  return null;
}

function findDescendants(node: HtmlNode, predicate: (node: HtmlNode) => boolean): HtmlNode[] {
  const result: HtmlNode[] = [];
  for (const child of elementChildren(node)) {
    if (predicate(child)) result.push(child);
    result.push(...findDescendants(child, predicate));
  }
  return result;
}

function isDescendantOf(node: HtmlNode, parent: HtmlNode): boolean {
  for (let current = node.parent; current; current = current.parent) {
    if (current === parent) return true;
  }
  return false;
}

function hasClass(node: HtmlNode, className: string): boolean {
  return node.attrs.class?.split(/\s+/).includes(className) ?? false;
}

function textContent(node: HtmlNode): string {
  const text = node.type === "text" ? node.text ?? "" : node.children.map(textContent).join(" ");
  return decodeHtml(text).replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function countNavigationLinks(items: NavigationItem[]): number {
  return items.reduce((count, item) => count + (item.type === "link" ? 1 : countNavigationLinks(item.items)), 0);
}
