import { unstable_cache } from "next/cache";
import type { CatalogProduct } from "../components/ProductFinder";
import type { NestedProductGroup, ProductHierarchyNode } from "../components/ProductHierarchyBrowser";
import type { Certificate } from "../trust/TrustPageClient";
import { faqs, solutions, trustProof, type HomePageContent } from "../content";
import certificatesSnapshot from "../data/certificates.json";
import certificatesPublicSnapshot from "../data/certificates-public.json";
import featuredProductsSnapshot from "../data/featured-products.json";
import nestedProductsPublicSnapshot from "../data/nested-products-public.json";
import productCatalogSnapshot from "../data/product-catalog.json";
import productCatalogPublicSnapshot from "../data/product-catalog-public.json";
import productHierarchySnapshot from "../data/product-hierarchy.json";
import productVerificationsSnapshot from "../data/product-verifications.json";
import siteContentSnapshot from "../data/site-content.json";
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

const fallbackSiteContent = (siteContentSnapshot[0] || {
  id: "homepage",
  solutions,
  trustProof,
  faqs,
}) as unknown as HomePageContent;

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

function logFallback(source: string, error: unknown) {
  console.error(`Falling back to bundled ${source} data.`, error);
}

export const getHomePageData = unstable_cache(async () => {
  try {
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
      siteContent: (siteContentRecord || fallbackSiteContent) as unknown as HomePageContent,
    };
  } catch (error) {
    logFallback("home page", error);

    return {
      featuredProducts: featuredProductsSnapshot as CatalogProduct[],
      productHierarchy: productHierarchySnapshot as ProductHierarchyNode[],
      verificationIndex: productVerificationsSnapshot as Record<string, string[]>,
      siteContent: fallbackSiteContent,
    };
  }
}, ["datacom-home-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.home],
  revalidate: 86_400,
});

export const getProductsPageData = unstable_cache(async () => {
  try {
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
  } catch (error) {
    logFallback("products page", error);

    return {
      products: productCatalogPublicSnapshot as CatalogProduct[],
      hierarchy: productHierarchySnapshot as ProductHierarchyNode[],
      groups: nestedProductsPublicSnapshot as NestedProductGroup[],
      verificationIndex: productVerificationsSnapshot as Record<string, string[]>,
    };
  }
}, ["datacom-products-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.products],
  revalidate: 86_400,
});

export const getCertificates = unstable_cache(async () => {
  try {
    const database = await getDatabase();
    const certificates = await database
      .collection("certificatesPublic")
      .find({}, { projection: publicProjection })
      .sort({ _position: 1 })
      .toArray();

    return certificates as unknown as Certificate[];
  } catch (error) {
    logFallback("certificates", error);

    return certificatesPublicSnapshot as Certificate[];
  }
}, ["datacom-trust-page-data-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.trust],
  revalidate: 86_400,
});

export const getProductById = unstable_cache(async (id: string) => {
  try {
    const database = await getDatabase();
    return database.collection("productCatalog").findOne({ id }, { projection: internalProjection }) as Promise<ProductRecord | null>;
  } catch (error) {
    logFallback("product catalog", error);

    return (productCatalogSnapshot as ProductRecord[]).find((product) => product.id === id) || null;
  }
}, ["datacom-product-by-id-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.datasheets],
  revalidate: 86_400,
});

export const getCertificateById = unstable_cache(async (id: string) => {
  try {
    const database = await getDatabase();
    return database
      .collection("certificates")
      .findOne({ id }, { projection: internalProjection }) as Promise<CertificateRecord | null>;
  } catch (error) {
    logFallback("certificate library", error);

    return (certificatesSnapshot as CertificateRecord[]).find((certificate) => certificate.id === id) || null;
  }
}, ["datacom-certificate-by-id-v1"], {
  tags: [contentCacheTags.all, contentCacheTags.certificateFiles],
  revalidate: 86_400,
});
