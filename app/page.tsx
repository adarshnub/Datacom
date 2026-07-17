"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Cable,
  Check,
  ChevronDown,
  CircleUserRound,
  Database,
  Globe2,
  GraduationCap,
  Menu,
  Network,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import ProductFinder, { type CatalogProduct } from "./components/ProductFinder";
import HomeProductGroups from "./components/HomeProductGroups";
import ScrollFilm from "./components/ScrollFilm";
import type { ProductHierarchyNode } from "./components/ProductHierarchyBrowser";
import { faqs, solutions, trustProof, type Locale } from "./content";
import featuredProducts from "./data/featured-products.json";
import productHierarchy from "./data/product-hierarchy.json";

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "compact" : ""}`} href="#top" aria-label="Datacom home">
      <svg viewBox="0 0 42 42" role="img" aria-hidden="true">
        <path d="M5 6h14v8H13v14h6v8H5V6Z" />
        <path d="M23 6h14v30H23v-8h6V14h-6V6Z" />
        <path className="brand-signal" d="M16 18h10v6H16z" />
      </svg>
      {!compact && (
        <span>
          <strong>DATACOM</strong>
          <small>INFRASTRUCTURE SYSTEMS</small>
        </span>
      )}
    </a>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSolution, setActiveSolution] = useState("dc");
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const isArabic = locale === "ar";
  const parentProductGroups = (productHierarchy as ProductHierarchyNode[]).filter((group) => group.parentId === null);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, locale]);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? window.scrollY / height : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "Datacom",
          description: "Global manufacturer of ICT infrastructure solutions for data centres, enterprise networks, GPON, PoE and outside plant.",
          foundingDate: "2006",
          address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
          knowsAbout: ["Data centre connectivity", "Structured cabling", "Fibre optics", "GPON", "Intelligent power distribution"],
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q.en,
            acceptedAnswer: { "@type": "Answer", text: faq.a.en },
          })),
        },
      ],
    }),
    [],
  );

  const goToProducts = () => {
    document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.querySelector<HTMLInputElement>("#product-search")?.focus(), 750);
    setMenuOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main id="top" className={isArabic ? "arabic" : ""}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="page-progress" style={{ transform: `scaleX(${progress})` }} />

      <header className="site-header">
        <BrandMark />
        <nav className="desktop-nav" aria-label={isArabic ? "التنقل الرئيسي" : "Primary navigation"}>
          <a href="#solutions">{isArabic ? "الحلول" : "Solutions"}<ChevronDown size={13} /></a>
          <button onClick={goToProducts}>{isArabic ? "المنتجات" : "Products"}</button>
          <a href="#trust">{isArabic ? "لماذا داتاكوم" : "Why Datacom"}</a>
          <a href="#resources">{isArabic ? "المصادر" : "Resources"}</a>
        </nav>
        <div className="header-actions">
          <a className="partner-shortcut" href="#contact"><CircleUserRound size={15} />{isArabic ? "بوابة الشركاء" : "Partner portal"}</a>
          <button className="locale-toggle" onClick={() => setLocale(isArabic ? "en" : "ar")} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}>
            <Globe2 size={15} />
            <span>{isArabic ? "EN" : "عربي"}</span>
          </button>
          <button className="search-shortcut" onClick={goToProducts} aria-label={isArabic ? "بحث المنتجات" : "Search products"}>
            <Search size={17} />
          </button>
          <a className="header-cta" href="#contact">
            {isArabic ? "تحدث إلى مهندس" : "Talk to an engineer"}
            <ArrowUpRight size={16} />
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={isArabic ? "فتح القائمة" : "Open menu"}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <span>{isArabic ? "انتقل حسب احتياجك" : "Navigate by intent"}</span>
          <a href="#solutions" onClick={() => setMenuOpen(false)}>{isArabic ? "استكشف الحلول" : "Explore solutions"}<ArrowRight /></a>
          <button onClick={goToProducts}>{isArabic ? "ابحث برقم القطعة" : "Find a part number"}<Search /></button>
          <a href="#trust" onClick={() => setMenuOpen(false)}>{isArabic ? "الموافقات والضمان" : "Approvals & warranty"}<BadgeCheck /></a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>{isArabic ? "تواصل معنا" : "Start a specification"}<ArrowUpRight /></a>
        </div>
      )}

      <ScrollFilm locale={locale} onSearchProducts={goToProducts} />

      <section className="proof-ticker" aria-label={isArabic ? "حقائق داتاكوم" : "Datacom facts"}>
        <div className="proof-ticker-label">
          <span className="signal-dot" />
          {isArabic ? "موثوق للأنظمة الحرجة" : "TRUSTED FOR CRITICAL SYSTEMS"}
        </div>
        <div className="proof-ticker-track">
          <span>UL</span><i />
          <span>INTERTEK</span><i />
          <span>FORCE TECHNOLOGY</span><i />
          <span>GHMT</span><i />
          <span>WIMPEY LABS</span>
        </div>
      </section>

      <section className="solutions viewport-chapter section" id="solutions" aria-labelledby="solutions-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{isArabic ? "01 / مسار الحلول" : "01 / SOLUTION PATH"}</span>
            <h2 id="solutions-title">
              {isArabic ? <>ابدأ بالنتيجة.<br /><em>صمّم الحل.</em></> : <>Start with the outcome.<br /><em>Engineer the solution.</em></>}
            </h2>
          </div>
          <p>{isArabic ? "أربع بيئات حرجة. منظومة متكاملة واحدة، مصممة ومختبرة لتعمل معاً." : "Four critical environments. One integrated ecosystem, engineered and verified to perform together."}</p>
        </div>

        <div className="solution-list">
          {solutions.map((solution) => {
            const active = activeSolution === solution.id;
            return (
              <article key={solution.id} className={`solution-item ${active ? "active" : ""}`}>
                <button onClick={() => setActiveSolution(solution.id)} aria-expanded={active}>
                  <span className="solution-number">{solution.number}</span>
                  <span className="solution-title">{solution.title[locale]}</span>
                  <span className="solution-meta">{solution.meta}</span>
                  <span className="solution-icon">{active ? <X size={18} /> : <ArrowUpRight size={18} />}</span>
                </button>
                <div className="solution-detail">
                  <div className={`solution-visual solution-visual-${solution.id}`} aria-hidden="true">
                    <div className="solution-wireframe"><Network /></div>
                    <span>{solution.number}</span>
                  </div>
                  <div className="solution-text">
                    <p>{solution.description[locale]}</p>
                    <div className="solution-tags">
                      {solution.id === "dc" && ["High-density fibre", "Cabinets & racks", "Intelligent PDU"].map((tag) => <span key={tag}>{tag}</span>)}
                      {solution.id === "enterprise" && ["Copper", "Fibre backbone", "PoE"].map((tag) => <span key={tag}>{tag}</span>)}
                      {solution.id === "gpon" && ["ODF", "Splitters", "FTTH cable"].map((tag) => <span key={tag}>{tag}</span>)}
                      {solution.id === "osp" && ["Cabinets", "Closures", "Armoured cable"].map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <a className="text-link" href="#contact">{isArabic ? "استكشف المنظومة" : "Explore the system"}<ArrowUpRight size={16} /></a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dc-spearhead viewport-chapter section" aria-labelledby="dc-title">
        <div className="dc-copy">
          <span className="eyebrow">{isArabic ? "المنظومة الرئيسية / مركز البيانات" : "SPEARHEAD SYSTEM / DATA CENTRE"}</span>
          <h2 id="dc-title">
            {isArabic ? <>الكثافة ترتفع.<br />المخاطر <em>لا يجب أن ترتفع.</em></> : <>Density is rising.<br />Risk <em>doesn’t have to.</em></>}
          </h2>
          <p>{isArabic ? "مسار مادي كامل للبنية الحاسوبية عالية الكثافة — اتصال وخزائن وطاقة، مصمم كمنظومة واحدة قابلة للتوسع." : "A complete physical pathway for high-density compute—connectivity, cabinets and power, designed as one scalable system."}</p>
          <a href="/products?group=Data%20Center%20(DC)%20connectivity%20Products#product-hierarchy" className="primary-button dark-button">{isArabic ? "عرض منتجات مراكز البيانات" : "View data centre products"}<ArrowUpRight size={17} /></a>
        </div>
        <div className="dc-stack" aria-label={isArabic ? "طبقات منظومة مركز البيانات" : "Data centre system layers"}>
          <div className="dc-stack-line" />
          {[
            { icon: Cable, value: "144F", title: isArabic ? "ألياف عالية الكثافة" : "High-density fibre", detail: "MPO / MTP · OM3 / OM4" },
            { icon: Database, value: "42U", title: isArabic ? "الخزائن والرفوف" : "Cabinets & racks", detail: "SX Series · up to 1500 kg" },
            { icon: Zap, value: "16-63A", title: isArabic ? "الطاقة الذكية" : "Intelligent power", detail: "Metered · switched · SNMP" },
          ].map(({ icon: Icon, value, title, detail }, index) => (
            <article className="dc-layer" key={title}>
              <span className="dc-layer-index">0{index + 1}</span>
              <div className="dc-layer-icon"><Icon /></div>
              <div><strong>{title}</strong><span>{detail}</span></div>
              <b>{value}</b>
            </article>
          ))}
        </div>
      </section>

      <HomeProductGroups locale={locale} groups={parentProductGroups} />

      <ProductFinder locale={locale} products={featuredProducts as CatalogProduct[]} previewLimit={4} />

      <section className="projects viewport-chapter" aria-labelledby="projects-title">
        <div className="projects-heading section">
          <span className="eyebrow">{isArabic ? "مصمم هنا. مثبت ميدانياً." : "ENGINEERED HERE. PROVEN IN PLACE."}</span>
          <h2 id="projects-title">{isArabic ? <>البنية الخفية وراء<br /><em>مشاريع بارزة.</em></> : <>The hidden layer behind<br /><em>landmark projects.</em></>}</h2>
          <p>{isArabic ? "من الرعاية الصحية إلى التعليم والمجتمعات السكنية — تعمل أنظمة داتاكوم في المواقع التي لا يمكن أن يتوقف فيها الاتصال." : "From healthcare to education and city-scale communities—Datacom systems work where connection cannot stop."}</p>
        </div>
        <div className="project-track">
          {[
            { type: "HEALTHCARE", name: "Al-Sharq Dibba Hospital", place: "Al Fujairah" },
            { type: "HEALTHCARE", name: "Mediclinic Reem Mall", place: "Abu Dhabi" },
            { type: "RESIDENTIAL", name: "Baniyas North Development", place: "Abu Dhabi" },
            { type: "EDUCATION", name: "Mohammed V University", place: "Ajman" },
            { type: "EXPO 2020", name: "Poland Pavilion", place: "Dubai" },
          ].map((project, index) => (
            <article className="project-card" key={project.name}>
              <div className="project-architecture" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><Building2 /></div>
              <small>{project.type}</small>
              <h3>{project.name}</h3>
              <p>{project.place}</p>
              <ArrowUpRight />
            </article>
          ))}
        </div>
      </section>

      <section className="trust viewport-chapter section" id="trust" aria-labelledby="trust-title">
        <div className="trust-intro">
          <span className="eyebrow">{isArabic ? "03 / دليل موثّق" : "03 / VERIFIED PROOF"}</span>
          <h2 id="trust-title">{isArabic ? <>الثقة ليست شعاراً.<br /><em>إنها مواصفة.</em></> : <>Trust isn’t a claim.<br /><em>It’s a specification.</em></>}</h2>
          <p>{isArabic ? "كل طبقة مدعومة بالاختبار والموافقات والخبرة الهندسية — لأن البنية التحتية الحرجة لا تحتمل التخمين." : "Every layer is backed by testing, approvals and engineering expertise—because critical infrastructure leaves no room for guesswork."}</p>
        </div>
        <div className="trust-grid">
          {trustProof.map((item) => (
            <article key={item.value}>
              <span className="trust-value">{item.value}</span>
              <span className="trust-suffix">{item.suffix[locale]}</span>
              <p>{item.label[locale]}</p>
            </article>
          ))}
        </div>
        <div className="approval-grid">
          <div className="approval-lead">
            <BadgeCheck />
            <span>{isArabic ? "بوابة الموافقات الخليجية" : "GCC APPROVAL GATE"}</span>
            <strong>{isArabic ? "مصمم وفق متطلبات السوق." : "Designed for market access."}</strong>
          </div>
          {["e& / ETISALAT", "du", "TDRA GUIDELINES", "GHMT TYPE APPROVED", "INTERTEK ETL"].map((approval) => (
            <div className="approval-mark" key={approval}><Check size={15} />{approval}</div>
          ))}
        </div>
        <a className="trust-library-link" href="/trust">
          <BadgeCheck />
          <span>
            <small>{isArabic ? "مكتبة أدلة محكومة" : "CONTROLLED EVIDENCE LIBRARY"}</small>
            <strong>{isArabic ? "عرض الشهادات وتقارير المطابقة" : "Open certificates and compliance evidence"}</strong>
          </span>
          <ArrowUpRight />
        </a>
      </section>

      <section className="audiences viewport-chapter section" aria-labelledby="audience-title">
        <div className="section-heading compact-heading">
          <div>
            <span className="eyebrow">{isArabic ? "04 / مصمم لكل قرار" : "04 / BUILT FOR EVERY DECISION"}</span>
            <h2 id="audience-title">{isArabic ? <>نفس النظام.<br /><em>الوضوح المناسب لك.</em></> : <>Same system.<br /><em>Your level of clarity.</em></>}</h2>
          </div>
        </div>
        <div className="audience-cards">
          {[
            { icon: Building2, title: isArabic ? "مالك المشروع" : "Owner / Operator", text: isArabic ? "افهم المخاطر والعمر التشغيلي والقيمة دون الغرق في الرموز." : "Understand risk, lifecycle and value without drowning in part codes.", link: isArabic ? "ابدأ بالنتائج" : "Start with outcomes" },
            { icon: CircleUserRound, title: isArabic ? "العميل والمستشار" : "Customer / Consultant", text: isArabic ? "قارن المنظومات والموافقات ومراجع المشاريع بثقة." : "Compare systems, approvals and project evidence with confidence.", link: isArabic ? "راجع المنظومات" : "Review systems" },
            { icon: GraduationCap, title: isArabic ? "المكامل والمنفذ" : "System Integrator", text: isArabic ? "انتقل من رمز القطعة إلى ورقة البيانات وشهادة المطابقة بخطوة واحدة." : "Go from part code to datasheet and compliance evidence in one move.", link: isArabic ? "افتح الأدوات الفنية" : "Open technical tools" },
          ].map(({ icon: Icon, title, text, link }, index) => (
            <article key={title}>
              <div className="audience-top"><span>0{index + 1}</span><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href={index === 2 ? "/products" : index === 1 ? "/trust" : "#solutions"}>{link}<ArrowUpRight size={16} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="resource-section viewport-chapter section" id="resources" aria-labelledby="resource-title">
        <div className="resource-copy">
          <span className="eyebrow">{isArabic ? "05 / معرفة جاهزة للمواصفات" : "05 / SPECIFICATION-READY KNOWLEDGE"}</span>
          <h2 id="resource-title">{isArabic ? <>إجابات مفهومة.<br /><em>ومستندات قابلة للتحقق.</em></> : <>Answers that read clearly.<br /><em>Documents that verify.</em></>}</h2>
          <p>{isArabic ? "بنية معرفة موحدة تساعد المهندسين ومحركات البحث وأنظمة الذكاء الاصطناعي على الوصول إلى الإجابة والمصدر الصحيحين." : "A structured knowledge layer helps engineers, search engines and AI answer systems reach the right answer—and its source."}</p>
          <div className="aeo-pill"><Sparkles size={15} /> AI / AEO READY</div>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.q.en} open={index === 0}>
              <summary><span>0{index + 1}</span>{faq.q[locale]}<ChevronDown /></summary>
              <p>{faq.a[locale]}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact viewport-chapter section" id="contact" aria-labelledby="contact-title">
        <div className="contact-copy">
          <span className="eyebrow">{isArabic ? "ابدأ المواصفة" : "START A SPECIFICATION"}</span>
          <h2 id="contact-title">{isArabic ? <>ابنِ الطبقة<br /><em>التي تدوم.</em></> : <>Build the layer<br /><em>that lasts.</em></>}</h2>
          <p>{isArabic ? "شاركنا نوع المشروع ومرحلة التصميم. سيرد عليك مهندس بنظام مناسب، وليس عرضاً عاماً." : "Tell us the project type and design stage. An engineer will respond with a system path—not a generic sales deck."}</p>
          <div className="contact-meta"><span>DUBAI · UAE</span><span>RIYADH · KSA</span><span>GLOBAL DELIVERY</span></div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="form-success"><Check /><strong>{isArabic ? "تم استلام تفاصيل المشروع." : "Project brief received."}</strong><p>{isArabic ? "سيتواصل معك فريق المواصفات قريباً." : "The specification team will be in touch shortly."}</p></div>
          ) : (
            <>
              <div className="form-grid">
                <label>{isArabic ? "الاسم" : "Name"}<input required name="name" placeholder={isArabic ? "اسمك الكامل" : "Your full name"} /></label>
                <label>{isArabic ? "البريد المهني" : "Work email"}<input required type="email" name="email" placeholder="name@company.com" /></label>
                <label>{isArabic ? "نوع المشروع" : "Project type"}<select name="project"><option>Enterprise Data Centre</option><option>Enterprise Network</option><option>GPON / FTTx</option><option>Outside Plant</option></select></label>
                <label>{isArabic ? "مرحلة المشروع" : "Project stage"}<select name="stage"><option>Concept / Design</option><option>Tender / Specification</option><option>Procurement</option><option>Installation</option></select></label>
              </div>
              <label className="message-field">{isArabic ? "ما الذي نبنيه؟" : "What are we building?"}<textarea required name="message" rows={3} placeholder={isArabic ? "أخبرنا عن الحجم والموقع والمتطلبات..." : "Tell us the size, location and performance target…"} /></label>
              <button className="primary-button" type="submit">{isArabic ? "إرسال إلى مهندس" : "Send to an engineer"}<ArrowUpRight size={17} /></button>
            </>
          )}
        </form>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <BrandMark />
          <p>{isArabic ? "البنية التحتية المادية للعالم المتصل." : "The physical infrastructure for the connected world."}</p>
          <a href="#top">{isArabic ? "إلى الأعلى" : "BACK TO TOP"}<ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-grid">
          <div><strong>{isArabic ? "الحلول" : "SOLUTIONS"}</strong><a href="#solutions">Data Centre</a><a href="#solutions">Enterprise</a><a href="#solutions">GPON / FTTx</a><a href="#solutions">Outside Plant</a></div>
          <div><strong>{isArabic ? "التقني" : "TECHNICAL"}</strong><a href="/products">Product finder</a><a href="/products">Datasheets</a><a href="/trust">Approvals</a><a href="#contact">Warranty</a></div>
          <div><strong>{isArabic ? "الشركة" : "COMPANY"}</strong><a href="#trust">About Datacom</a><a href="#trust">Quality</a><a href="#contact">Partners</a><a href="#contact">Contact</a></div>
          <div className="footer-location"><strong>{isArabic ? "المقر الرئيسي" : "HEADQUARTERS"}</strong><p>Al Jaddaf Waterfront<br />Dubai, United Arab Emirates</p><a href="tel:+97142858448">+971 4 285 8448</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 DATACOM. ALL SYSTEMS CONNECTED.</span><span>EN / AR · RTL READY</span><span>PRIVACY · TERMS</span></div>
      </footer>
    </main>
  );
}
