"use client";

import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, FileText, Search, SlidersHorizontal } from "lucide-react";
import { products, type Locale } from "../content";

export default function ProductFinder({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const families = ["All", "Fibre", "Copper", "Racks", "Power"];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFamily = family === "All" || product.family === family;
      const matchesQuery = !term || `${product.code} ${product.name.en} ${product.name.ar} ${product.spec}`.toLowerCase().includes(term);
      return matchesFamily && matchesQuery;
    });
  }, [family, query]);

  return (
    <section className="product-finder section" id="products" aria-labelledby="products-title">
      <div className="section-heading finder-heading">
        <div>
          <span className="eyebrow">{locale === "en" ? "02 / SPECIFICATION PATH" : "02 / مسار المواصفات"}</span>
          <h2 id="products-title">
            {locale === "en" ? <>Part number to <em>datasheet.</em></> : <>من رقم القطعة إلى <em>ورقة البيانات.</em></>}
          </h2>
        </div>
        <p>{locale === "en" ? "For engineers who know exactly what they need. Search the range, verify the spec, download the document." : "للمهندسين الذين يعرفون احتياجاتهم بدقة. ابحث في المجموعة وتحقق من المواصفات وحمّل المستند."}</p>
      </div>

      <div className="finder-panel">
        <div className="finder-search">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="product-search" className="sr-only">{locale === "en" ? "Search products" : "بحث المنتجات"}</label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "en" ? "Search part code, product or specification…" : "ابحث برقم القطعة أو المنتج أو المواصفة…"}
          />
          <kbd>/</kbd>
        </div>
        <div className="finder-filter" role="group" aria-label={locale === "en" ? "Product family" : "فئة المنتج"}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          {families.map((item) => (
            <button key={item} className={family === item ? "active" : ""} onClick={() => setFamily(item)}>
              {item === "All" ? (locale === "en" ? "All systems" : "كل الأنظمة") : item}
            </button>
          ))}
        </div>

        <div className="product-table" role="table" aria-label={locale === "en" ? "Product catalogue results" : "نتائج كتالوج المنتجات"}>
          <div className="product-row product-table-head" role="row">
            <span role="columnheader">{locale === "en" ? "PART CODE / PRODUCT" : "رمز القطعة / المنتج"}</span>
            <span role="columnheader">{locale === "en" ? "CORE SPEC" : "المواصفة"}</span>
            <span role="columnheader">{locale === "en" ? "DOCUMENT" : "المستند"}</span>
          </div>
          {filtered.map((product) => (
            <article className="product-row" role="row" key={product.code}>
              <div className="product-identity" role="cell">
                <span className="product-family">{product.family}</span>
                <div>
                  <code>{product.code}</code>
                  <strong>{product.name[locale]}</strong>
                </div>
              </div>
              <div className="product-spec" role="cell">
                <span>{product.spec}</span>
                <small>{product.badge}</small>
              </div>
              <div className="product-actions" role="cell">
                <button aria-label={`${locale === "en" ? "View" : "عرض"} ${product.code}`}>
                  <FileText size={17} />
                  <span>{locale === "en" ? "View" : "عرض"}</span>
                </button>
                <button className="download" aria-label={`${locale === "en" ? "Download datasheet for" : "تحميل ورقة بيانات"} ${product.code}`}>
                  <ArrowDownToLine size={17} />
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              <strong>{locale === "en" ? "No exact match." : "لا توجد نتيجة مطابقة."}</strong>
              <span>{locale === "en" ? "Try a family, performance class or partial code." : "جرّب فئة أو تصنيف أداء أو جزءاً من الرمز."}</span>
            </div>
          )}
        </div>

        <a href="#contact" className="text-link finder-footer-link">
          {locale === "en" ? "Open full technical catalogue" : "فتح الكتالوج التقني الكامل"}
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
