export const adminCollections = [
  {
    name: "siteContent",
    label: "Site content",
    description: "Homepage solutions, trust metrics and FAQs.",
    group: "Website",
  },
  {
    name: "featuredProducts",
    label: "Featured products",
    description: "Products promoted on the homepage.",
    group: "Website",
  },
  {
    name: "skuCatalogPublic",
    label: "Product catalogue",
    description: "Searchable part numbers shown on the products page.",
    group: "Catalogue",
  },
  {
    name: "productCatalog",
    label: "Technical products",
    description: "Canonical technical-sheet metadata and source paths.",
    group: "Catalogue",
  },
  {
    name: "productCatalogPublic",
    label: "Public products",
    description: "Public-safe technical product projection.",
    group: "Catalogue",
  },
  {
    name: "productHierarchy",
    label: "Product hierarchy",
    description: "Navigation tree, paths and parent-child relationships.",
    group: "Catalogue",
  },
  {
    name: "nestedProductsPublic",
    label: "Product groups",
    description: "Image-backed groups shown in the hierarchy browser.",
    group: "Catalogue",
  },
  {
    name: "certificatesPublic",
    label: "Trust centre",
    description: "Certificates and approvals displayed publicly.",
    group: "Compliance",
  },
  {
    name: "certificates",
    label: "Certificate sources",
    description: "Canonical certificate records and document paths.",
    group: "Compliance",
  },
  {
    name: "productVerifications",
    label: "Product evidence",
    description: "Part-number to certificate relationships.",
    group: "Compliance",
  },
] as const;

export type AdminCollectionName = (typeof adminCollections)[number]["name"];

const collectionNames = new Set<string>(adminCollections.map((collection) => collection.name));

export function isAdminCollection(value: string): value is AdminCollectionName {
  return collectionNames.has(value);
}
