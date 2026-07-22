import { revalidatePath, revalidateTag } from "next/cache";
import type { AdminCollectionName } from "./admin-config";

export const contentCacheTags = {
  all: "datacom:content:all",
  home: "datacom:content:home",
  products: "datacom:content:products",
  trust: "datacom:content:trust",
  datasheets: "datacom:content:datasheets",
  certificateFiles: "datacom:content:certificate-files",
} as const;

type CacheRule = {
  tags: string[];
  paths: string[];
};

const collectionCacheRules: Record<AdminCollectionName, CacheRule> = {
  siteContent: { tags: [contentCacheTags.home], paths: ["/"] },
  featuredProducts: { tags: [contentCacheTags.home], paths: ["/"] },
  skuCatalogPublic: { tags: [contentCacheTags.products], paths: ["/products"] },
  productCatalog: { tags: [contentCacheTags.datasheets], paths: [] },
  productCatalogPublic: { tags: [contentCacheTags.products], paths: ["/products"] },
  productHierarchy: { tags: [contentCacheTags.home, contentCacheTags.products], paths: ["/", "/products"] },
  nestedProductsPublic: { tags: [contentCacheTags.products], paths: ["/products"] },
  certificatesPublic: { tags: [contentCacheTags.trust], paths: ["/trust"] },
  certificates: { tags: [contentCacheTags.certificateFiles], paths: [] },
  productVerifications: { tags: [contentCacheTags.home, contentCacheTags.products], paths: ["/", "/products"] },
};

export type RevalidationResult = {
  tags: string[];
  paths: string[];
  revalidatedAt: string;
};

export function revalidateContentCache(collection?: AdminCollectionName): RevalidationResult {
  const rule = collection
    ? collectionCacheRules[collection]
    : {
        tags: Object.values(contentCacheTags),
        paths: ["/", "/products", "/trust"],
      };
  const tags = [...new Set(rule.tags)];
  const paths = [...new Set(rule.paths)];

  // Webhook/CMS writes require the next visitor to receive fresh data rather
  // than one stale-while-revalidate response, so expire these entries now.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);

  return { tags, paths, revalidatedAt: new Date().toISOString() };
}
