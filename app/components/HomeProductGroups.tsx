"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Boxes, Layers3 } from "lucide-react";
import type { Locale } from "../content";

type ParentProductGroup = {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  preview: string | null;
  productGroupCount: number;
  totalImageCount: number;
};

type HomeProductGroupsProps = {
  locale: Locale;
  groups: ParentProductGroup[];
};

const EnglishLabels: Record<string, string> = {
  "BMS CABLE_PHOTO": "BMS & Automation Cables",
  "CABINET & ENCLOSURES": "Cabinets & Enclosures",
  "COPPER CABLES": "Copper Cables",
  "COPPER CONNECTIVITY": "Copper Connectivity",
  "Data Center (DC) connectivity Products": "Data Centre Connectivity",
  "DATACENTER CABINET": "Data Centre Cabinets",
  EMS: "Environmental Monitoring",
  "FIBER OPTIC": "Fibre Optic",
  "OUTDOOR CABINETS": "Outdoor Cabinets",
  "POWER DISTRIBUTION UNITS": "Power Distribution Units",
};

const ArabicLabels: Record<string, string> = {
  "BMS CABLE_PHOTO": "كابلات أنظمة إدارة المباني",
  "CABINET & ENCLOSURES": "الخزائن والحاويات",
  "COPPER CABLES": "الكابلات النحاسية",
  "COPPER CONNECTIVITY": "موصلات النحاس",
  "Data Center (DC) connectivity Products": "توصيلات مراكز البيانات",
  "DATACENTER CABINET": "خزائن مراكز البيانات",
  EMS: "المراقبة البيئية",
  "FIBER OPTIC": "الألياف الضوئية",
  "OUTDOOR CABINETS": "الخزائن الخارجية",
  "POWER DISTRIBUTION UNITS": "وحدات توزيع الطاقة",
};

export default function HomeProductGroups({ locale, groups }: HomeProductGroupsProps) {
  const isArabic = locale === "ar";

  return (
    <section className="home-product-groups viewport-chapter section" aria-labelledby="home-product-groups-title">
      <div className="home-product-groups-heading">
        <div>
          <span className="eyebrow">
            {isArabic ? `دليل أنظمة المنتجات / ${groups.length} مجموعات رئيسية` : `PRODUCT SYSTEM INDEX / ${groups.length} PARENT GROUPS`}
          </span>
          <h2 id="home-product-groups-title">
            {isArabic ? <>كل مجموعة منتجات.<br /><em>مسار واضح للمواصفات.</em></> : <>Every product group.<br /><em>One clear specification path.</em></>}
          </h2>
        </div>
        <div className="home-product-groups-intro">
          <p>{isArabic ? "ابدأ من مجموعة المنتجات، ثم انتقل عبر نفس البنية المتداخلة الموجودة في مكتبة داتاكوم الفنية." : "Start with a product system, then move through the same nested structure used by Datacom’s technical source library."}</p>
          <Link className="text-link" href="/products#product-hierarchy">
            {isArabic ? "فتح كتالوج المنتجات الكامل" : "Open the complete product catalogue"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="home-product-group-grid">
        {groups.map((group, index) => {
          const title = isArabic ? ArabicLabels[group.path] ?? group.name : EnglishLabels[group.path] ?? group.name;
          return (
            <Link
              className="home-product-group-card"
              href={`/products?group=${encodeURIComponent(group.path)}#product-hierarchy`}
              key={group.id}
              aria-label={`${isArabic ? "عرض" : "View"} ${title}`}
            >
              <span className="home-product-group-visual">
                {group.preview ? <Image src={group.preview} alt="" width={500} height={340} sizes="(max-width: 620px) 50vw, (max-width: 1000px) 33vw, 20vw" /> : <Boxes size={34} />}
                <b>{String(index + 1).padStart(2, "0")}</b>
              </span>
              <span className="home-product-group-copy">
                <small><Layers3 size={12} />{group.productGroupCount} {isArabic ? "مجموعة فرعية" : "nested product groups"}</small>
                <strong>{title}</strong>
                <span>{group.totalImageCount} {isArabic ? "صورة منتج" : "supplied product images"}</span>
              </span>
              <ArrowUpRight className="home-product-group-arrow" size={18} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
