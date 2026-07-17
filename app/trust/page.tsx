import type { Metadata } from "next";
import certificates from "../data/certificates-public.json";
import TrustPageClient from "./TrustPageClient";

export const metadata: Metadata = {
  title: "Trust & Compliance Centre | Datacom",
  description:
    "Review Datacom third-party product approvals, certificates of conformance and standards evidence from GHMT, Intertek and FORCE Technology.",
};

type TrustPageProps = {
  searchParams: Promise<{ product?: string }>;
};

export default async function TrustPage({ searchParams }: TrustPageProps) {
  const { product = "" } = await searchParams;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Datacom Trust and Compliance Centre",
    description: "Third-party product certificates and standards evidence for Datacom infrastructure systems.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: certificates.length,
      itemListElement: certificates.map((certificate, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: certificate.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TrustPageClient initialQuery={product} />
    </>
  );
}
