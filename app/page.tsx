import HomePageClient from "./HomePageClient";
import { getHomePageData } from "./lib/data";

export default async function Home() {
  const { featuredProducts, productHierarchy, verificationIndex, siteContent } = await getHomePageData();

  return (
    <HomePageClient
      featuredProducts={featuredProducts}
      productHierarchy={productHierarchy}
      verificationIndex={verificationIndex}
      siteContent={siteContent}
    />
  );
}
