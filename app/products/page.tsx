import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Technical Product Catalogue | Datacom",
  description:
    "Search Datacom data-centre, copper, fibre, cabinet, power and building-system specification sheets by product or part number.",
};

type ProductsPageProps = {
  searchParams: Promise<{ query?: string; group?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { query = "", group = "" } = await searchParams;
  return <ProductsPageClient initialQuery={query} initialGroupPath={group} />;
}
