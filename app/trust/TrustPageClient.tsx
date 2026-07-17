"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  ArrowDownToLine,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  FileText,
  Globe2,
  Search,
  ShieldCheck,
} from "lucide-react";
import certificatesData from "../data/certificates-public.json";
import type { Locale } from "../content";

type CertificateStatus = "current" | "monitored" | "expired";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issuerCountry: string;
  documentType: string;
  certificateNo: string;
  scope: string;
  standards: string[];
  partNumbers: string[];
  issued: string;
  validUntil: string | null;
  language: string;
  note: string;
  status: CertificateStatus;
  preview: string;
};

const statusCopy: Record<CertificateStatus, { en: string; ar: string }> = {
  current: { en: "Current", ar: "سارية" },
  monitored: { en: "Monitored", ar: "مراقبة مستمرة" },
  expired: { en: "Archive / expired", ar: "أرشيف / منتهية" },
};

function TrustBrand() {
  return (
    <Link className="brand" href="/" aria-label="Datacom home">
      <svg viewBox="0 0 42 42" role="img" aria-hidden="true">
        <path d="M4 4h34v34H4z" fill="none" stroke="currentColor" strokeWidth="3" />
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

const formatDate = (value: string | null, locale: Locale) => {
  if (!value) return locale === "en" ? "Ongoing surveillance" : "مراقبة مستمرة";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

export default function TrustPageClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [query, setQuery] = useState(initialQuery);
  const [issuer, setIssuer] = useState("All");
  const [includeArchive, setIncludeArchive] = useState(false);
  const certificates = certificatesData as Certificate[];
  const issuers = ["All", ...Array.from(new Set(certificates.map((item) => item.issuer)))];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return certificates.filter((certificate) => {
      if (!includeArchive && certificate.status === "expired") return false;
      if (issuer !== "All" && certificate.issuer !== issuer) return false;
      const searchable = [
        certificate.title,
        certificate.issuer,
        certificate.certificateNo,
        certificate.scope,
        certificate.standards.join(" "),
        certificate.partNumbers.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return !term || searchable.includes(term);
    });
  }, [certificates, includeArchive, issuer, query]);

  const currentCount = certificates.filter((item) => item.status === "current").length;
  const monitoredCount = certificates.filter((item) => item.status === "monitored").length;
  const expiredCount = certificates.filter((item) => item.status === "expired").length;

  return (
    <div className={locale === "ar" ? "arabic trust-page" : "trust-page"} dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="trust-page-header">
        <TrustBrand />
        <nav aria-label={locale === "en" ? "Trust centre navigation" : "التنقل في مركز الثقة"}>
          <Link href="/">
            <ArrowLeft size={16} />
            {locale === "en" ? "Back to website" : "العودة إلى الموقع"}
          </Link>
          <Link href="/products">{locale === "en" ? "Product catalogue" : "كتالوج المنتجات"}</Link>
          <button type="button" onClick={() => setLocale(locale === "en" ? "ar" : "en")}>
            <Globe2 size={15} />
            {locale === "en" ? "العربية" : "English"}
          </button>
        </nav>
      </header>

      <main>
        <section className="trust-page-hero" aria-labelledby="trust-centre-title">
          <div className="trust-hero-copy">
            <span className="eyebrow">{locale === "en" ? "INDEPENDENT EVIDENCE / CONTROLLED LIBRARY" : "أدلة مستقلة / مكتبة محكومة"}</span>
            <h1 id="trust-centre-title">
              {locale === "en" ? (
                <>Proof has a <em>document number.</em></>
              ) : (
                <>للإثبات <em>رقم مستند.</em></>
              )}
            </h1>
            <p>
              {locale === "en"
                ? "Third-party compliance evidence mapped to real Datacom part numbers. Validity and surveillance status are shown exactly as stated by each issuing laboratory."
                : "أدلة مطابقة من جهات مستقلة مرتبطة بأرقام قطع داتاكوم الفعلية. تظهر حالة الصلاحية والمراقبة كما حددها كل مختبر مُصدر."}
            </p>
          </div>
          <div className="trust-status-board">
            <article className="status-current"><ShieldCheck /><strong>{currentCount}</strong><span>{locale === "en" ? "Current documents" : "مستندات سارية"}</span></article>
            <article className="status-monitored"><BadgeCheck /><strong>{monitoredCount}</strong><span>{locale === "en" ? "Under surveillance" : "تحت المراقبة"}</span></article>
            <article className="status-expired"><Archive /><strong>{expiredCount}</strong><span>{locale === "en" ? "Archived records" : "سجلات مؤرشفة"}</span></article>
          </div>
        </section>

        <section className="trust-library section" aria-labelledby="evidence-library-title">
          <div className="trust-library-heading">
            <div>
              <span className="eyebrow">{locale === "en" ? "PRODUCT COMPLIANCE EVIDENCE" : "أدلة مطابقة المنتجات"}</span>
              <h2 id="evidence-library-title">{locale === "en" ? <>Verify the <em>physical layer.</em></> : <>تحقق من <em>الطبقة المادية.</em></>}</h2>
            </div>
            <p>{locale === "en" ? "Search by part number, standard, issuer or certificate number." : "ابحث برقم القطعة أو المعيار أو الجهة المصدرة أو رقم الشهادة."}</p>
          </div>

          <div className="trust-controls">
            <label className="trust-search">
              <Search size={18} />
              <span className="sr-only">{locale === "en" ? "Search evidence" : "بحث الأدلة"}</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Part number, standard or certificate…" : "رقم القطعة أو المعيار أو الشهادة…"} />
            </label>
            <div className="trust-issuer-filter" role="group" aria-label={locale === "en" ? "Certificate issuer" : "الجهة المصدرة"}>
              {issuers.map((item) => (
                <button type="button" key={item} className={issuer === item ? "active" : ""} onClick={() => setIssuer(item)} aria-pressed={issuer === item}>
                  {item === "All" ? (locale === "en" ? "All issuers" : "كل الجهات") : item}
                </button>
              ))}
            </div>
            <label className="archive-toggle">
              <input type="checkbox" checked={includeArchive} onChange={(event) => setIncludeArchive(event.target.checked)} />
              <Archive size={15} />
              {locale === "en" ? `Show archive (${expiredCount})` : `عرض الأرشيف (${expiredCount})`}
            </label>
          </div>

          <div className="certificate-grid">
            {filtered.map((certificate) => {
              const viewUrl = `/api/certificates/${certificate.id}`;
              return (
                <article className={`certificate-card certificate-${certificate.status}`} key={certificate.id}>
                  <div className="certificate-preview">
                    <Image src={certificate.preview} alt={`First page of ${certificate.title}`} width={640} height={850} sizes="(max-width: 700px) 88vw, (max-width: 1100px) 45vw, 30vw" />
                    <span className={`certificate-status status-${certificate.status}`}>{statusCopy[certificate.status][locale]}</span>
                  </div>
                  <div className="certificate-body">
                    <div className="certificate-meta"><span>{certificate.issuer}</span><code>{certificate.certificateNo}</code></div>
                    <h3>{certificate.title}</h3>
                    <p>{certificate.scope}</p>
                    <div className="certificate-standards">{certificate.standards.slice(0, 4).map((standard) => <span key={standard}>{standard}</span>)}</div>
                    <div className="certificate-validity">
                      <CalendarClock size={15} />
                      <span>
                        {certificate.status === "expired"
                          ? `${locale === "en" ? "Expired" : "انتهت"}: ${formatDate(certificate.validUntil, locale)}`
                          : certificate.validUntil
                            ? `${locale === "en" ? "Valid to" : "صالحة حتى"}: ${formatDate(certificate.validUntil, locale)}`
                            : formatDate(null, locale)}
                      </span>
                    </div>
                    <div className="certificate-parts">
                      <small>{locale === "en" ? "VERIFIED PARTS" : "القطع المعتمدة"}</small>
                      <strong>{certificate.partNumbers.slice(0, 2).join(" · ")}</strong>
                      {certificate.partNumbers.length > 2 && <span>+{certificate.partNumbers.length - 2}</span>}
                    </div>
                    <div className="certificate-actions">
                      <a href={viewUrl} target="_blank" rel="noreferrer"><FileText size={16} />{locale === "en" ? "View evidence" : "عرض الدليل"}</a>
                      <a href={`${viewUrl}?download=1`}><ArrowDownToLine size={16} /><span className="sr-only">{locale === "en" ? "Download" : "تحميل"}</span></a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && <div className="trust-no-results"><strong>{locale === "en" ? "No evidence matches this search." : "لا توجد أدلة مطابقة لهذا البحث."}</strong><span>{locale === "en" ? "Try a product family, certificate number or issuer." : "جرّب عائلة منتج أو رقم شهادة أو جهة مصدرة."}</span></div>}
        </section>
      </main>

      <footer className="trust-page-footer">
        <TrustBrand />
        <p>{locale === "en" ? "Need a complete project submittal pack?" : "هل تحتاج إلى حزمة اعتماد كاملة للمشروع؟"}</p>
        <Link href="/#contact">{locale === "en" ? "Talk to an engineer" : "تحدث إلى مهندس"}</Link>
      </footer>
    </div>
  );
}
