"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, FileText, FolderTree, Images, Search, X } from "lucide-react";
import type { Locale } from "../content";

export type ProductHierarchyNode = {
  id: string;
  name: string;
  sourceName: string;
  path: string;
  pathSegments: string[];
  breadcrumbs: string[];
  depth: number;
  parentId: string | null;
  childIds: string[];
  directProductGroupId: string | null;
  directImageCount: number;
  totalImageCount: number;
  productGroupCount: number;
  preview: string | null;
};

export type NestedProductGroup = {
  id: string;
  name: string;
  sourceName: string;
  path: string;
  pathSegments: string[];
  breadcrumbs: string[];
  topLevel: string;
  depth: number;
  images: Array<{ src: string; name: string; sourceName: string }>;
  preview: string;
  searchText: string;
  datasheets: Array<{ id: string; name: string; spec: string; pages: number }>;
  skuCodes: string[];
};

type ProductHierarchyBrowserProps = {
  locale: Locale;
  nodes: ProductHierarchyNode[];
  groups: NestedProductGroup[];
  initialPath?: string;
};

export default function ProductHierarchyBrowser({ locale, nodes, groups, initialPath = "" }: ProductHierarchyBrowserProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => nodes.find((node) => node.path === initialPath)?.id ?? null);
  const [query, setQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const nodesById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const nodesByPath = useMemo(() => new Map(nodes.map((node) => [node.path, node])), [nodes]);
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;
  const activeGroup = activeGroupId ? groupsById.get(activeGroupId) ?? null : null;

  const childNodes = useMemo(() => {
    if (!selectedNode) return nodes.filter((node) => node.parentId === null);
    return selectedNode.childIds.map((id) => nodesById.get(id)).filter((node): node is ProductHierarchyNode => Boolean(node));
  }, [nodes, nodesById, selectedNode]);

  const directGroup = selectedNode?.directProductGroupId ? groupsById.get(selectedNode.directProductGroupId) ?? null : null;
  const searchedGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return groups.filter((group) => `${group.path} ${group.searchText} ${group.skuCodes.join(" ")}`.toLowerCase().includes(term));
  }, [groups, query]);

  const openNode = (node: ProductHierarchyNode) => {
    setSelectedNodeId(node.id);
    setActiveGroupId(null);
  };

  const selectBreadcrumb = (index: number) => {
    if (!selectedNode || index < 0) {
      setSelectedNodeId(null);
      return;
    }
    const path = selectedNode.pathSegments.slice(0, index + 1).join("/");
    setSelectedNodeId(nodesByPath.get(path)?.id ?? null);
    setActiveGroupId(null);
  };

  const groupCard = (group: NestedProductGroup) => (
    <button className="nested-product-card" type="button" key={group.id} onClick={() => setActiveGroupId(group.id)}>
      <span className="nested-product-image"><Image src={group.preview} alt="" width={500} height={360} sizes="(max-width: 700px) 88vw, 28vw" /></span>
      <span className="nested-product-copy">
        <small>{group.breadcrumbs.slice(0, -1).join(" / ")}</small>
        <strong>{group.name}</strong>
        <span>{group.images.length} {locale === "en" ? "image views" : "صور"} · {group.skuCodes.length} {locale === "en" ? "part codes" : "رموز قطع"}</span>
      </span>
      <ArrowRight size={17} />
    </button>
  );

  return (
    <section className="product-hierarchy section" id="product-hierarchy" aria-labelledby="product-hierarchy-title">
      <div className="hierarchy-heading">
        <div>
          <span className="eyebrow">{locale === "en" ? "01 / SOURCE PRODUCT HIERARCHY" : "01 / التسلسل الأصلي للمنتجات"}</span>
          <h2 id="product-hierarchy-title">{locale === "en" ? <>Browse every <em>system layer.</em></> : <>تصفح كل <em>طبقة في النظام.</em></>}</h2>
        </div>
        <p>{locale === "en" ? "The catalogue mirrors the supplied product-image directory at every level. Open a branch or search any nested product directly." : "يعكس الكتالوج بنية مجلد صور المنتجات في كل مستوى. افتح فرعاً أو ابحث مباشرة عن أي منتج متداخل."}</p>
      </div>

      <div className="hierarchy-shell">
        <label className="hierarchy-search">
          <Search size={19} />
          <span className="sr-only">{locale === "en" ? "Search nested products" : "بحث المنتجات المتداخلة"}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search any nested product, folder or image name…" : "ابحث عن منتج أو مجلد أو اسم صورة…"} />
          <kbd>{groups.length}</kbd>
        </label>

        {query.trim() ? (
          <div className="hierarchy-search-results">
            <div className="hierarchy-result-label"><Search size={14} />{searchedGroups.length} {locale === "en" ? "matching product groups" : "مجموعات منتجات مطابقة"}</div>
            <div className="nested-product-grid">{searchedGroups.map(groupCard)}</div>
            {searchedGroups.length === 0 && <div className="hierarchy-empty">{locale === "en" ? "No nested product matches this search." : "لا يوجد منتج متداخل مطابق لهذا البحث."}</div>}
          </div>
        ) : (
          <>
            <nav className="hierarchy-breadcrumb" aria-label={locale === "en" ? "Product hierarchy breadcrumb" : "مسار فئات المنتجات"}>
              <button type="button" onClick={() => selectBreadcrumb(-1)} className={!selectedNode ? "active" : ""}><FolderTree size={14} />{locale === "en" ? "All product systems" : "كل أنظمة المنتجات"}</button>
              {selectedNode?.breadcrumbs.map((label, index) => (
                <span key={`${label}-${index}`}><ChevronRight size={13} /><button type="button" onClick={() => selectBreadcrumb(index)}>{label}</button></span>
              ))}
            </nav>

            <div className="hierarchy-directory-grid">
              {childNodes.map((node) => (
                <button className="hierarchy-directory" type="button" key={node.id} onClick={() => openNode(node)}>
                  <span className="hierarchy-directory-image">
                    {node.preview ? <Image src={node.preview} alt="" width={560} height={360} sizes="(max-width: 700px) 88vw, 30vw" /> : <FolderTree size={28} />}
                    <b>{String(node.depth).padStart(2, "0")}</b>
                  </span>
                  <span className="hierarchy-directory-copy">
                    <small>{node.productGroupCount} {locale === "en" ? "nested products" : "منتجات متداخلة"}</small>
                    <strong>{node.name}</strong>
                    <span>{node.childIds.length} {locale === "en" ? "subgroups" : "مجموعات فرعية"} · {node.totalImageCount} {locale === "en" ? "images" : "صورة"}</span>
                  </span>
                  <ArrowRight size={18} />
                </button>
              ))}
            </div>

            {directGroup && (
              <div className="hierarchy-direct-product">
                <div className="hierarchy-result-label"><Images size={15} />{locale === "en" ? "Products at this exact level" : "المنتجات في هذا المستوى مباشرة"}</div>
                <div className="nested-product-grid">{groupCard(directGroup)}</div>
              </div>
            )}
          </>
        )}

        {activeGroup && (
          <div className="nested-product-detail" role="dialog" aria-modal="false" aria-labelledby="nested-product-title">
            <button className="nested-product-close" type="button" onClick={() => setActiveGroupId(null)} aria-label={locale === "en" ? "Close product details" : "إغلاق تفاصيل المنتج"}><X size={18} /></button>
            <div className="nested-product-detail-copy">
              <span className="eyebrow">{activeGroup.breadcrumbs.join(" / ")}</span>
              <h3 id="nested-product-title">{activeGroup.name}</h3>
              <p>{locale === "en" ? "All supplied product views stay grouped here. Use a part code below to jump to its searchable technical record." : "تبقى جميع صور المنتج الموردة مجمعة هنا. استخدم رمز القطعة أدناه للانتقال إلى سجله الفني القابل للبحث."}</p>
              <div className="nested-product-skus">
                {activeGroup.skuCodes.slice(0, 24).map((code) => <Link key={code} href={`/products?query=${encodeURIComponent(code)}#products`}>{code}</Link>)}
                {activeGroup.skuCodes.length > 24 && <span>+{activeGroup.skuCodes.length - 24}</span>}
              </div>
              <div className="nested-product-documents">
                {activeGroup.datasheets.map((document) => <a key={document.id} href={`/api/datasheets/${document.id}`} target="_blank" rel="noreferrer"><FileText size={15} /><span>{document.name}<small>{document.spec} · {document.pages}P</small></span></a>)}
                {activeGroup.datasheets.length === 0 && <span>{locale === "en" ? "No matched specification sheet in the supplied library." : "لا توجد ورقة مواصفات مطابقة في المكتبة الموردة."}</span>}
              </div>
            </div>
            <div className="nested-product-gallery">
              {activeGroup.images.map((image) => <figure key={image.src}><Image src={image.src} alt={`${activeGroup.name} — ${image.name}`} width={900} height={650} sizes="(max-width: 800px) 84vw, 34vw" /><figcaption>{image.name}</figcaption></figure>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
