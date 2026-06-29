export type TranslationStatus = "untranslated" | "translated" | "needs-review";

export interface DocEntry {
  id: string;
  title: string;
  description: string;
  product: string;
  section: string;
  sourceUrl: string;
  markdownUrl: string;
  slug: string;
  localSourcePath: string;
  localPagePath: string;
  checksum: string;
  fetchedAt: string;
  translationStatus: TranslationStatus;
}

export interface Manifest {
  generatedAt: string;
  rootIndexUrl: string;
  docCount: number;
  products: string[];
  docs: DocEntry[];
}

export interface DiscoveredDoc {
  title: string;
  description: string;
  product: string;
  section: string;
  markdownUrl: string;
  sourceUrl: string;
  slug: string;
}

export interface TranslationInfo {
  status: TranslationStatus;
  sourceChecksum?: string;
}

export interface NavigationSnapshot {
  generatedAt: string;
  source: string;
  topNavigation: TopNavigationItem[];
  products: NavigationProduct[];
}

export type TopNavigationItem = TopNavigationLink | TopNavigationGroup;

export interface TopNavigationLink {
  type: "link";
  title: string;
  href: string;
  slug?: string;
  external?: boolean;
}

export interface TopNavigationGroup {
  type: "group";
  title: string;
  href: string;
  slug?: string;
  items: TopNavigationLink[];
}

export interface NavigationProduct {
  product: string;
  sourceUrl: string;
  items: NavigationItem[];
  warnings: string[];
}

export type NavigationItem = NavigationLink | NavigationSection;

export interface NavigationLink {
  type: "link";
  title: string;
  href: string;
  slug: string;
}

export interface NavigationSection {
  type: "section";
  title: string;
  href?: string;
  slug?: string;
  items: NavigationItem[];
}
