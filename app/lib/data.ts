import { unstable_cache } from "next/cache";
import type { CatalogProduct } from "../components/ProductFinder";
import type { NestedProductGroup, ProductHierarchyNode } from "../components/ProductHierarchyBrowser";
import type { Certificate } from "../trust/TrustPageClient";
import { faqs, solutions, trustProof, type HomePageContent } from "../content";
import { getDatabase } from "./mongodb";
import { contentCacheTags } from "./content-cache";

const publicProjection = { _id: 0, _position: 0, _sourceFile: 0, sourceFile: 0, fileHash: 0 } as const;
const internalProjection = { _id: 0, _position: 0, _sourceFile: 0 } as const;

export type ProductRecord = CatalogProduct & {
  sourceFile: string;
  partNumbers?: string[];
};

export type CertificateRecord = Certificate & {
  sourceFile: string;
  fileHash: string;
};

async function loadVerificationIndex() {
  const database = await getDatabase();
  const records = await database
    .collection("productVerifications")
    .find({}, { projection: { _id: 0, code: 1, certificateIds: 1 } })
    .toArray();

  return Object.fromEntries(
    records.map((record) => [record.code as string, record.certificateIds as string[]]),
  );
}

export const getHomePageData = unstable_cache(async () => {
  const database = await getDatabase();
  const [featuredProducts, productHierarchy, verificationIndex, siteContentRecord] = await Promise.all([
    database
      .collection("featuredProducts")
      .find({}, { projection: publicProjection })
      .sort({ _position: 1 })
      .toArray(),
    database
      .collection("productHierarchy")
      .find({}, { projection: publicProjection })
      .sort({ _position: 1 })
      .toArray(),
    loadVerificationIndex(),
    database.collection("siteContent").findOne({ id: "homepage" }, { projection: publicProjection }),
  ]);

  return {
    featuredProducts: featuredProducts as unknown as CatalogProduct[],
    productHierarchy: productHierarchy as unknown as ProductHierarchyNode[],
    verificationIndex,
    siteContent: (siteContentRecord || { id: "homepage", solutions, trustProof, faqs }) as unknown as HomePageContent,
  };
}, ["datacom-home-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.home],
  revalidate: 86_400,
});

export const getProductsPageData = unstable_cache(async () => {
  const database = await getDatabase();
  const [products, hierarchy, groups, verificationIndex] = await Promise.all([
    database.collection("skuCatalogPublic").find({}, { projection: publicProjection }).sort({ _position: 1 }).toArray(),
    database
      .collection("productHierarchy")
      .find({}, { projection: publicProjection })
      .sort({ _position: 1 })
      .toArray(),
    database
      .collection("nestedProductsPublic")
      .find({}, { projection: publicProjection })
      .sort({ _position: 1 })
      .toArray(),
    loadVerificationIndex(),
  ]);

  return {
    products: products as unknown as CatalogProduct[],
    hierarchy: hierarchy as unknown as ProductHierarchyNode[],
    groups: groups as unknown as NestedProductGroup[],
    verificationIndex,
  };
}, ["datacom-products-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.products],
  revalidate: 86_400,
});

export const getCertificates = unstable_cache(async () => {
  const database = await getDatabase();
  const certificates = await database
    .collection("certificatesPublic")
    .find({}, { projection: publicProjection })
    .sort({ _position: 1 })
    .toArray();

  return certificates as unknown as Certificate[];
}, ["datacom-trust-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.trust],
  revalidate: 86_400,
});

export const getProductById = unstable_cache(async (id: string) => {
  const database = await getDatabase();
  return database.collection("productCatalog").findOne({ id }, { projection: internalProjection }) as Promise<ProductRecord | null>;
}, ["datacom-product-by-id-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.datasheets],
  revalidate: 86_400,
});

export const getCertificateById = unstable_cache(async (id: string) => {
  const database = await getDatabase();
  return database
    .collection("certificates")
    .findOne({ id }, { projection: internalProjection }) as Promise<CertificateRecord | null>;
}, ["datacom-certificate-by-id-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.certificateFiles],
  revalidate: 86_400,
});
