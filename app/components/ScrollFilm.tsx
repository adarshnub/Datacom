"use client";

import { ArrowDown, ArrowUpRight, FileCheck2, Search, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "../content";

type ScrollFilmProps = {
  locale: Locale;
  onSearchProducts: () => void;
};

const chapters = [
  {
    kicker: {
      en: "THE INFRASTRUCTURE YOU DON'T SEE. THE PERFORMANCE YOU DEPEND ON.",
      ar: "البنية التحتية التي لا تراها. الأداء الذي تعتمد عليه.",
    },
    title: {
      en: <>The <em>hidden layer</em><br />inside every building.</>,
      ar: <>الطبقة <em>الخفية</em><br />داخل كل مبنى.</>,
    },
    body: {
      en: "We engineer and manufacture the physical infrastructure that carries the connected world—from the building pathway to the final port.",
      ar: "نصمم ونصنّع البنية المادية التي تحمل العالم المتصل — من مسار المبنى إلى المنفذ الأخير.",
    },
    meta: ["HOSPITAL CAMPUS", "PHYSICAL LAYER", "SYSTEM / 01"],
  },
  {
    kicker: { en: "01 / ARCHITECTURAL X-RAY", ar: "01 / الأشعة المعمارية" },
    title: {
      en: <>See the layer<br /><em>behind the walls.</em></>,
      ar: <>شاهد الطبقة<br /><em>خلف الجدران.</em></>,
    },
    body: {
      en: "Copper, fibre, power and pathways become one engineered system—specified before the first ceiling closes.",
      ar: "يتكامل النحاس والألياف والطاقة والمسارات في نظام هندسي واحد قبل إغلاق أول سقف.",
    },
    meta: ["COPPER + FIBRE", "DUAL PATHWAY", "LAYER / 02"],
  },
  {
    kicker: { en: "02 / ENTERPRISE DATA CENTRE", ar: "02 / مركز بيانات المؤسسات" },
    title: {
      en: <>From pathway to<br /><em>protected data hall.</em></>,
      ar: <>من المسار إلى<br /><em>قاعة البيانات المحمية.</em></>,
    },
    body: {
      en: "High-density connectivity, intelligent power and controlled rack infrastructure—engineered as a complete ecosystem.",
      ar: "اتصال عالي الكثافة وطاقة ذكية وبنية رفوف محكومة — منظومة متكاملة مصممة هندسياً.",
    },
    meta: ["42U RACKS", "HIGH DENSITY", "ROOM / 03"],
  },
  {
    kicker: { en: "03 / THE FINAL CONNECTION", ar: "03 / الاتصال الأخير" },
    title: {
      en: <>Engineered down to<br /><em>the final port.</em></>,
      ar: <>هندسة دقيقة حتى<br /><em>المنفذ الأخير.</em></>,
    },
    body: {
      en: "Every component is tested as part of the link. Every system is backed for 25 years. No weak layer. No guesswork.",
      ar: "يُختبر كل مكوّن كجزء من الرابط، ويُدعم كل نظام لمدة 25 عاماً. بلا طبقة ضعيفة أو تخمين.",
    },
    meta: ["PORT 24", "LINK VERIFIED", "SYSTEM / 04"],
  },
] as const;

export default function ScrollFilm({ locale, onSearchProducts }: ScrollFilmProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(32);
  const frameRef = useRef<number | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setReady(true), 4500);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const video = videoRef.current;
    if (!section || !sticky || !video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      frameRef.current = null;
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / scrollDistance));
      const nextChapter = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
      const timelineProgress = reduceMotion ? nextChapter / (chapters.length - 1) : progress;
      const targetTime = timelineProgress * Math.max(durationRef.current - 0.06, 0);

      sticky.style.setProperty("--film-progress", progress.toFixed(4));
      setActiveChapter((current) => (current === nextChapter ? current : nextChapter));

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA && Math.abs(video.currentTime - targetTime) > 0.025) {
        video.currentTime = targetTime;
      }
    };

    const requestUpdate = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(update);
    };

    window.requestAnimationFrame(update);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const goToChapter = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(0.99, index / chapters.length + 0.025);
    window.scrollTo({ top: sectionTop + scrollDistance * progress, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="twin" className="scroll-film" aria-labelledby="hero-title">
      <div ref={stickyRef} className="scroll-film-sticky">
        <video
          ref={videoRef}
          className={`scroll-film-video ${ready ? "ready" : ""}`}
          poster="/media/datacom-scroll-film/01-hospital-exterior.png"
          preload="auto"
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          onLoadedMetadata={(event) => {
            durationRef.current = event.currentTarget.duration || 32;
            event.currentTarget.pause();
            setReady(true);
            window.requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
          }}
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onError={() => setReady(true)}
        >
          <source src="/media/datacom-scroll-film/datacom-scroll-master-mobile.mp4?v=20260718-synced-bridge" type="video/mp4" media="(max-width: 900px)" />
          <source src="/media/datacom-scroll-film/datacom-scroll-master.mp4?v=20260718-synced-bridge" type="video/mp4" />
        </video>

        <div className="scroll-film-shade" aria-hidden="true" />
        <div className="scroll-film-grid" aria-hidden="true" />

        {!ready && (
          <div className="scroll-film-loader" aria-live="polite">
            <i />
            <span>{locale === "en" ? "LOADING INFRASTRUCTURE FILM" : "جارٍ تحميل فيلم البنية التحتية"}</span>
          </div>
        )}

        <div className="film-chapter-stack">
          {chapters.map((chapter, index) => (
            <article key={chapter.meta[2]} className={`film-copy ${activeChapter === index ? "active" : ""}`} aria-hidden={activeChapter !== index}>
              <div className="hero-kicker"><span className="signal-dot" />{chapter.kicker[locale]}</div>
              {index === 0 ? <h1 id="hero-title">{chapter.title[locale]}</h1> : <h2>{chapter.title[locale]}</h2>}
              <p>{chapter.body[locale]}</p>
              <div className="film-meta" aria-label={locale === "en" ? "Current system layer" : "طبقة النظام الحالية"}>
                {chapter.meta.map((item) => <span key={item}>{item}</span>)}
              </div>

              {index === 0 && (
                <>
                  <div className="hero-actions">
                    <button className="primary-button" onClick={() => goToChapter(1)} tabIndex={activeChapter === index ? 0 : -1}>
                      <ArrowDown size={17} />
                      {locale === "en" ? "Scroll to reveal" : "مرّر للكشف"}
                    </button>
                    <button className="secondary-button" onClick={onSearchProducts} tabIndex={activeChapter === index ? 0 : -1}>
                      <Search size={17} />
                      {locale === "en" ? "Search a part number" : "البحث برقم القطعة"}
                    </button>
                  </div>
                  <div className="hero-proof">
                    <span><ShieldCheck /> {locale === "en" ? "25-year system warranty" : "ضمان نظام 25 عاماً"}</span>
                    <span><FileCheck2 /> {locale === "en" ? "Independently verified" : "مختبرات تحقق مستقلة"}</span>
                  </div>
                </>
              )}

              {index === chapters.length - 1 && (
                <a className="film-continue" href="#solutions" tabIndex={activeChapter === index ? 0 : -1}>
                  {locale === "en" ? "Explore data-centre systems" : "استكشف أنظمة مراكز البيانات"}
                  <ArrowUpRight size={17} />
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="film-rail" aria-label={locale === "en" ? "Film chapters" : "فصول الفيلم"}>
          {chapters.map((chapter, index) => (
            <button key={chapter.meta[2]} className={activeChapter === index ? "active" : ""} onClick={() => goToChapter(index)} aria-label={chapter.kicker[locale]}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </button>
          ))}
        </div>

        <div className="film-scroll-cue">
          <span>{locale === "en" ? "SCROLL TO MOVE THROUGH THE SYSTEM" : "مرّر للتنقل عبر النظام"}</span>
          <i><b /></i>
        </div>

        <div className="film-frame-label" aria-hidden="true">
          <span>DATACOM / PHYSICAL LAYER</span>
          <span>{String(activeChapter + 1).padStart(2, "0")} / 04</span>
        </div>
      </div>
    </section>
  );
}
