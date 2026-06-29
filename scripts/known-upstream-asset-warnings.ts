export interface KnownUpstreamAssetWarning {
  url: string;
  sourceSlug: string;
  reason: string;
  firstSeen: string;
  lastVerified: string;
}

export const knownUpstreamAssetWarnings: readonly KnownUpstreamAssetWarning[] = [
  {
    url: "https://developers.openai.com/codex/security/images/aardvark_recommended_findings.png",
    sourceSlug: "codex/security/setup",
    reason: "Official Markdown still references this image, but the official image URL currently returns 404.",
    firstSeen: "2026-06-27",
    lastVerified: "2026-06-29"
  }
];

export function getKnownUpstreamAssetWarning(assetUrl: string): KnownUpstreamAssetWarning | undefined {
  const normalized = normalizeAssetUrl(assetUrl);
  return knownUpstreamAssetWarnings.find((warning) => normalizeAssetUrl(warning.url) === normalized);
}

function normalizeAssetUrl(assetUrl: string): string {
  try {
    const parsed = new URL(assetUrl);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return assetUrl;
  }
}
