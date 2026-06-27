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
