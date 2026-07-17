"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, BadgeCheck, FileText, Search, SlidersHorizontal } from "lucide-react";
import type { Locale } from "../content";
import verificationData from "../data/product-verifications.json";

export type CatalogProduct = {
  id: string;
  code: string;
  name: string;
  family: string;
  subcategory: string;
  spec: string;
  badge: string;
  image: string | null;
  pages: number;
  searchText?: string;
  featured: boolean;
  datasheetId?: string;
  datasheetIds?: string[];
  groupId?: string | null;
  breadcrumb?: string;
};

type ProductFinderProps = {
  locale: Locale;
  products: CatalogProduct[];
  fullCatalog?: boolean;
  initialQuery?: string;
  catalogKind?: "documents" | "skus";
  previewLimit?: number;
};

const familyOrder = ["Data Centre", "Copper", "Fibre", "Cabinets", "Power", "Building Systems"];

const familyArabic: Record<string, string> = {
  "Data Centre": "مراكز البيانات",
  Copper: "النحاس",
  Fibre: "الألياف",
  Cabinets: "الخزائن",
  Power: "الطاقة",
  "Building Systems": "أنظمة المباني",
};

const verificationIndex = verificationData as Record<string, string[]>;

export default function ProductFinder({ locale, products, fullCatalog = false, initialQuery = "", catalogKind = "documents", previewLimit = 8 }: ProductFinderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState("All");
  const [visibleCount, setVisibleCount] = useState(fullCatalog ? 12 : 8);
  const searchRef = useRef<HTMLInputElement>(null);

  const families = useMemo(
    () => ["All", ...familyOrder.filter((item) => products.some((product) => product.family === item))],
    [products],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFamily = family === "All" || product.family === family;
      const searchable = `${product.code} ${product.name} ${product.family} ${product.subcategory} ${product.spec} ${product.searchText ?? ""}`;
      return matchesFamily && (!term || searchable.toLowerCase().includes(term));
    });
  }, [family, products, query]);

  const visibleProducts = fullCatalog ? filtered.slice(0, visibleCount) : filtered.slice(0, previewLimit);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const familyLabel = (value: string) => {
    if (value === "All") return locale === "en" ? "All systems" : "كل الأنظمة";
    return locale === "en" ? value : familyArabic[value] ?? value;
  };

  return (
    <section className={`product-finder section ${fullCatalog ? "catalog-finder" : "home-product-finder viewport-chapter"}`} id="products" aria-labelledby="products-title">
      <div className="section-heading finder-heading">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "02 / SPECIFICATION PATH" : "02 / مسار المواصفات"}
          </span>
          <h2 id="products-title">
            {locale === "en" ? (
              <>Part number to <em>datasheet.</em></>
            ) : (
              <>من رقم القطعة إلى <em>ورقة البيانات.</em></>
            )}
          </h2>
        </div>
        <p>
          {locale === "en"
            ? catalogKind === "skus"
              ? `${products.length} individually searchable ordering codes, each connected to its parent technical sheet.`
              : `${products.length} verified technical documents. Search the real range, check the core specification and open the source sheet.`
            : catalogKind === "skus"
              ? `${products.length} رمز طلب قابل للبحث بشكل مستقل، وكل رمز مرتبط بورقة المواصفات الأصلية.`
              : `${products.length} مستنداً فنياً معتمداً. ابحث في المجموعة الفعلية وتحقق من المواصفات وافتح ورقة المصدر.`}
        </p>
      </div>

      <div className="finder-panel">
        <div className="finder-search">
          <Search size={20} aria-hidden="true" />
          <label htmlFor={fullCatalog ? "catalog-search" : "product-search"} className="sr-only">
            {locale === "en" ? "Search products" : "بحث المنتجات"}
          </label>
          <input
            ref={searchRef}
            id={fullCatalog ? "catalog-search" : "product-search"}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(fullCatalog ? 12 : 8);
            }}
            placeholder={locale === "en" ? "Search part code, product, standard or specification…" : "ابحث برقم القطعة أو المنتج أو المعيار أو المواصفة…"}
          />
          <kbd>/</kbd>
        </div>

        <div className="finder-filter" role="group" aria-label={locale === "en" ? "Product family" : "فئة المنتج"}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          {families.map((item) => (
            <button
              type="button"
              key={item}
              className={family === item ? "active" : ""}
              onClick={() => {
                setFamily(item);
                setVisibleCount(fullCatalog ? 12 : 8);
              }}
              aria-pressed={family === item}
            >
              {familyLabel(item)}
            </button>
          ))}
          <span className="finder-result-count">
            {filtered.length} {locale === "en" ? (catalogKind === "skus" ? "part codes" : "documents") : (catalogKind === "skus" ? "رمز قطعة" : "مستنداً")}
          </span>
        </div>

        <div className="product-table" role="table" aria-label={locale === "en" ? "Product catalogue results" : "نتائج كتالوج المنتجات"}>
          <div className="product-row product-table-head" role="row">
            <span role="columnheader">{locale === "en" ? "PART CODE / PRODUCT" : "رمز القطعة / المنتج"}</span>
            <span role="columnheader">{locale === "en" ? "CORE SPEC" : "المواصفة الأساسية"}</span>
            <span role="columnheader">{locale === "en" ? "SOURCE DOCUMENT" : "مستند المصدر"}</span>
          </div>

          {visibleProducts.map((product) => {
            const viewUrl = `/api/datasheets/${encodeURIComponent(product.datasheetId ?? product.id)}`;
            const verificationCount = verificationIndex[product.code]?.length ?? 0;
            return (
              <article className="product-row" role="row" key={product.id}>
                <div className="product-identity" role="cell">
                  <div className="product-thumbnail" aria-hidden="true">
                    {product.image ? (
                      <Image src={product.image} alt="" width={96} height={82} sizes="96px" />
                    ) : (
                      <FileText size={23} />
                    )}
                  </div>
                  <div>
                    <span className="product-family">{familyLabel(product.family)}</span>
                    <code>{product.code === "MULTI-SKU" ? (locale === "en" ? "PRODUCT FAMILY" : "عائلة منتجات") : product.code}</code>
                    <strong title={product.name}>{product.name}</strong>
                    <small className="product-subcategory">{product.breadcrumb ?? product.subcategory}</small>
                  </div>
                </div>
                <div className="product-spec" role="cell">
                  <span>{product.spec}</span>
                  <small>{product.badge}</small>
                  {verificationCount > 0 && (
                    <Link className="product-verification" href={`/trust?product=${encodeURIComponent(product.code)}`}>
                      <BadgeCheck size={13} />
                      {locale === "en" ? `${verificationCount} independent verification${verificationCount > 1 ? "s" : ""}` : `${verificationCount} من أدلة المطابقة المستقلة`}
                    </Link>
                  )}
                </div>
                <div className="product-actions" role="cell">
                  <a href={viewUrl} target="_blank" rel="noreferrer" aria-label={`${locale === "en" ? "View" : "عرض"} ${product.name}`}>
                    <FileText size={17} />
                    <span>{locale === "en" ? "View PDF" : "عرض PDF"}</span>
                  </a>
                  <a className="download" href={`${viewUrl}?download=1`} aria-label={`${locale === "en" ? "Download datasheet for" : "تحميل ورقة بيانات"} ${product.name}`}>
                    <ArrowDownToLine size={17} />
                  </a>
                  <small className="document-pages">{product.pages || "–"}P</small>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="no-results">
              <strong>{locale === "en" ? "No exact match." : "لا توجد نتيجة مطابقة."}</strong>
              <span>{locale === "en" ? "Try a family, standard, performance class or partial code." : "جرّب فئة أو معياراً أو تصنيف أداء أو جزءاً من الرمز."}</span>
            </div>
          )}
        </div>

        {fullCatalog && visibleCount < filtered.length ? (
          <button className="catalog-load-more" type="button" onClick={() => setVisibleCount((count) => count + 12)}>
            {locale === "en"
              ? `Load 12 more — ${filtered.length - visibleCount} remaining`
              : catalogKind === "skus"
                ? `عرض 12 رمز قطعة إضافياً — ${filtered.length - visibleCount} متبقٍ`
                : `عرض 12 مستنداً إضافياً — ${filtered.length - visibleCount} متبقٍ`}
          </button>
        ) : !fullCatalog ? (
          <Link href="/products" className="text-link finder-footer-link">
            {locale === "en" ? "Open the complete technical catalogue" : "فتح الكتالوج الفني الكامل"}
            <ArrowUpRight size={16} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
