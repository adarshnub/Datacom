"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, FileStack, Globe2, ShieldCheck } from "lucide-react";
import ProductHierarchyBrowser, { type NestedProductGroup, type ProductHierarchyNode } from "../components/ProductHierarchyBrowser";
import ProductFinder, { type CatalogProduct } from "../components/ProductFinder";
import type { Locale } from "../content";
import hierarchyData from "../data/product-hierarchy.json";
import nestedProductsData from "../data/nested-products-public.json";
import catalogue from "../data/sku-catalog-public.json";

function CatalogueBrand() {
  return (
    <Link className="brand" href="/" aria-label="Datacom home">
      <svg viewBox="0 0 42 42" role="img" aria-hidden="true">
        <path d="M4 4h34v34H4z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M14 14h14v14H14z" fill="#ff4d00" />
        <path d="M18 8h6v26h-6zM8 18h26v6H8z" fill="currentColor" />
        <path d="M15 15h12v12H15z" fill="#ff4d00" />
      </svg>
      <span>
        <strong>DATACOM</strong>
        <small>INFRASTRUCTURE SYSTEMS</small>
      </span>
    </Link>
  );
}

export default function ProductsPageClient({ initialQuery = "", initialGroupPath = "" }: { initialQuery?: string; initialGroupPath?: string }) {
  const [locale, setLocale] = useState<Locale>("en");
  const products = catalogue as CatalogProduct[];
  const hierarchy = hierarchyData as ProductHierarchyNode[];
  const nestedProducts = nestedProductsData as NestedProductGroup[];

  return (
    <div className={locale === "ar" ? "arabic catalogue-page" : "catalogue-page"} dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="catalogue-header">
        <CatalogueBrand />
        <nav aria-label={locale === "en" ? "Catalogue navigation" : "التنقل في الكتالوج"}>
          <Link href="/">
            <ArrowLeft size={16} />
            {locale === "en" ? "Back to solutions" : "العودة إلى الحلول"}
          </Link>
          <Link href="/trust"><ShieldCheck size={15} />{locale === "en" ? "Trust centre" : "مركز الثقة"}</Link>
          <button type="button" onClick={() => setLocale(locale === "en" ? "ar" : "en")}>
            <Globe2 size={15} />
            {locale === "en" ? "العربية" : "English"}
          </button>
        </nav>
      </header>

      <main>
        <section className="catalogue-hero" aria-labelledby="catalogue-title" data-count={products.length}>
          <div className="catalogue-hero-grid" aria-hidden="true" />
          <div className="catalogue-hero-copy">
            <span className="eyebrow">{locale === "en" ? "DATACOM / TECHNICAL LIBRARY" : "داتاكوم / المكتبة الفنية"}</span>
            <h1 id="catalogue-title">
              {locale === "en" ? (
                <>The physical layer, <em>specified.</em></>
              ) : (
                <>الطبقة المادية، <em>بمواصفات دقيقة.</em></>
              )}
            </h1>
            <p>
              {locale === "en"
                ? "The source library for Datacom data-centre, copper, fibre, power, cabinet and building-system infrastructure. Every result opens the supplied technical sheet."
                : "مكتبة المصدر لبنية داتاكوم التحتية لمراكز البيانات والنحاس والألياف والطاقة والخزائن وأنظمة المباني. كل نتيجة تفتح ورقة المواصفات الأصلية."}
            </p>
          </div>
          <div className="catalogue-stats" aria-label={locale === "en" ? "Catalogue coverage" : "تغطية الكتالوج"}>
            <article>
              <FileStack size={21} />
              <strong>{products.length}</strong>
              <span>{locale === "en" ? "searchable part codes" : "رمز قطعة قابل للبحث"}</span>
            </article>
            <article>
              <BadgeCheck size={21} />
              <strong>{nestedProducts.length}</strong>
              <span>{locale === "en" ? `image-backed groups / ${hierarchy.length} source folders` : `مجموعة مصورة / ${hierarchy.length} مجلد مصدر`}</span>
            </article>
          </div>
        </section>

        <ProductHierarchyBrowser key={initialGroupPath} locale={locale} nodes={hierarchy} groups={nestedProducts} initialPath={initialGroupPath} />
        <ProductFinder key={initialQuery} locale={locale} products={products} fullCatalog initialQuery={initialQuery} catalogKind="skus" />
      </main>

      <footer className="catalogue-footer">
        <CatalogueBrand />
        <p>{locale === "en" ? "Need a submittal pack or project-specific schedule?" : "هل تحتاج إلى حزمة اعتماد أو جدول خاص بالمشروع؟"}</p>
        <Link href="/#contact">{locale === "en" ? "Talk to an engineer" : "تحدث إلى مهندس"}</Link>
      </footer>
    </div>
  );
}
