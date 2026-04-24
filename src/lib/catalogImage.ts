// Shared CDN image resolver for admin/storefront catalog images
const CDN_BASE = "https://d1311wbk6unapo.cloudfront.net/NushopCatalogue";
const STORE_ID = "69870e125223b1da7d5437a8";

export const resolveCatalogImage = (path: string | null | undefined, w = 200): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CDN_BASE}/tr:f-webp,w-${w},fo-auto/${STORE_ID}/${path}`;
};
