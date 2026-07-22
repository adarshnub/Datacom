import type { Metadata } from "next";
import { getProductsPageData } from "../lib/data";
import ProductsPageClient from "./ProductsPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Technical Product Catalogue | Datacom",
  description:
    "Search Datacom data-centre, copper, fibre, cabinet, power and building-system specification sheets by product or part number.",
};

type ProductsPageProps = {
  searchParams: Promise<{ query?: string; group?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [{ query = "", group = "" }, data] = await Promise.all([searchParams, getProductsPageData()]);
  return (
    <ProductsPageClient
      initialQuery={query}
      initialGroupPath={group}
      products={data.products}
      hierarchy={data.hierarchy}
      nestedProducts={data.groups}
      verificationIndex={data.verificationIndex}
    />
  );
}
