"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Download,
  FileText,
  LayoutTemplate,
  Mic,
  Globe,
  ImageIcon,
  ShieldCheck,
  Languages,
  Layers,
  GitBranch,
  Server,
  MonitorSmartphone,
  Cpu,
  Headphones,
  Boxes,
  CheckCircle,
  Zap,
  Play,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

const SECTIONS = ["features", "pipeline", "scenarios", "architecture"] as const;

export default function AboutPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0]);

  /* -- scroll spy -- */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* -- animated counters -- */
  const { ref: statsRef, visible: statsVisible } = useInView(0.3);
  const fmtCount = useCountUp(10, 1000, statsVisible);
  const tplCount = useCountUp(17, 1200, statsVisible);
  const spdCount = useCountUp(5, 1000, statsVisible);

  /* -- section fade-in hooks -- */
  const featAnim = useInView();
  const pipeAnim = useInView();
  const scenAnim = useInView();
  const archAnim = useInView();
  const startAnim = useInView();

  /* ---- Data ---- */
  const navItems = [
    { id: "features", label: t("about.nav.features") },
    { id: "pipeline", label: t("about.nav.pipeline") },
    { id: "scenarios", label: t("about.nav.scenarios") },
    { id: "architecture", label: t("about.nav.architecture") },
  ];

  const stats = [
    { num: `${fmtCount}+`, label: t("about.statFormats") },
    { num: `${tplCount}`, label: t("about.statTemplates") },
    { num: `${spdCount}-${spdCount + 2}`, label: t("about.statSlidesPerMin") },
  ];

  const coreFeatures = [
    { icon: FileText, title: t("about.coreFeat1Title"), desc: t("about.coreFeat1Desc") },
    { icon: LayoutTemplate, title: t("about.coreFeat2Title"), desc: t("about.coreFeat2Desc") },
    { icon: ImageIcon, title: t("about.coreFeat3Title"), desc: t("about.coreFeat3Desc") },
    { icon: Mic, title: t("about.coreFeat4Title"), desc: t("about.coreFeat4Desc") },
    { icon: ShieldCheck, title: t("about.coreFeat5Title"), desc: t("about.coreFeat5Desc") },
    { icon: Languages, title: t("about.coreFeat6Title"), desc: t("about.coreFeat6Desc") },
    { icon: Layers, title: t("about.coreFeat7Title"), desc: t("about.coreFeat7Desc") },
    { icon: Download, title: t("about.coreFeat8Title"), desc: t("about.coreFeat8Desc") },
  ];

  const pipeline = [
    { icon: Upload, title: t("about.pipe1Title"), desc: t("about.pipe1Desc"), num: "01" },
    { icon: Sparkles, title: t("about.pipe2Title"), desc: t("about.pipe2Desc"), num: "02" },
    { icon: ImageIcon, title: t("about.pipe3Title"), desc: t("about.pipe3Desc"), num: "03" },
    { icon: MonitorSmartphone, title: t("about.pipe4Title"), desc: t("about.pipe4Desc"), num: "04" },
    { icon: Download, title: t("about.pipe5Title"), desc: t("about.pipe5Desc"), num: "05" },
  ];

  const scenarios = [
    { icon: FileText, title: t("about.scenario1Title"), desc: t("about.scenario1Desc"), example: t("about.scenario1Example") },
    { icon: Sparkles, title: t("about.scenario2Title"), desc: t("about.scenario2Desc"), example: t("about.scenario2Example") },
    { icon: Zap, title: t("about.scenario3Title"), desc: t("about.scenario3Desc"), example: t("about.scenario3Example") },
    { icon: Play, title: t("about.scenario4Title"), desc: t("about.scenario4Desc"), example: t("about.scenario4Example") },
  ];

  const architecture = [
    { icon: Server, title: t("about.archItem1Title"), desc: t("about.archItem1Desc") },
    { icon: MonitorSmartphone, title: t("about.archItem2Title"), desc: t("about.archItem2Desc") },
    { icon: Cpu, title: t("about.archItem3Title"), desc: t("about.archItem3Desc") },
    { icon: Layers, title: t("about.archItem4Title"), desc: t("about.archItem4Desc") },
    { icon: Headphones, title: t("about.archItem5Title"), desc: t("about.archItem5Desc") },
    { icon: Boxes, title: t("about.archItem6Title"), desc: t("about.archItem6Desc") },
  ];

  const startSteps = [
    { icon: GitBranch, title: t("about.getStart1Title"), desc: t("about.getStart1Desc") },
    { icon: FileText, title: t("about.getStart2Title"), desc: t("about.getStart2Desc") },
    { icon: Download, title: t("about.getStart3Title"), desc: t("about.getStart3Desc") },
  ];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen">
      {/* ===== Sticky Nav ===== */}
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* brand */}
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              P
            </div>
            <span className="font-semibold text-lg hidden sm:inline">PPT Master</span>
          </button>

          {/* anchor nav — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* right actions */}
          <div className="flex items-center gap-3">
            <Select
              value={locale}
              onValueChange={(v) => setLocale((v ?? "en") as Locale)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <Globe className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => router.push("/projects")}>
              {t("about.start")} <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Hero ===== */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-16 pt-20">
        {/* decorative circle */}
        <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-60 rounded-full bg-primary/3 blur-2xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground mb-8 backdrop-blur">
            <Sparkles className="size-4 text-primary" />
            {t("about.hero")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("about.heroTagline")}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("about.heroTaglineDesc")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" onClick={() => router.push("/projects/new")}>
              <Sparkles className="size-4 mr-2" />
              {t("about.ctaButton")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("features")}
            >
              {t("about.nav.features")}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                  {s.num}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Core Features ===== */}
      <section id="features" className="scroll-mt-14 py-20 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("about.featuresTitle")}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto mb-12 rounded-full" />

          <div
            ref={featAnim.ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {coreFeatures.map((feat, i) => (
              <div
                key={i}
                className={`group rounded-xl border bg-card p-5 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 ${
                  featAnim.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feat.icon className="size-5" />
                </div>
                <h3 className="font-semibold mb-1.5">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pipeline ===== */}
      <section id="pipeline" className="scroll-mt-14 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("about.pipelineTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            {t("about.pipelineDesc")}
          </p>

          <div
            ref={pipeAnim.ref}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {pipeline.map((step, i) => (
              <div
                key={i}
                className={`relative flex flex-col items-center text-center rounded-xl border bg-card p-5 transition-all duration-500 hover:shadow-md hover:border-primary/30 ${
                  pipeAnim.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-[10px] font-bold text-primary/50 mb-2 tracking-widest">
                  {step.num}
                </div>
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <step.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
                {i < pipeline.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 z-10">
                    <ArrowRight className="size-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Scenarios ===== */}
      <section id="scenarios" className="scroll-mt-14 py-20 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("about.scenariosTitle")}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto mb-12 rounded-full" />

          <div
            ref={scenAnim.ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {scenarios.map((s, i) => (
              <div
                key={i}
                className={`group rounded-xl border bg-card overflow-hidden transition-all duration-500 hover:shadow-lg hover:border-primary/20 ${
                  scenAnim.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-muted/60 px-4 py-3 text-sm text-foreground/80 italic border-l-2 border-primary/40">
                    {s.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Architecture ===== */}
      <section id="architecture" className="scroll-mt-14 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("about.archTitle")}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto mb-12 rounded-full" />

          <div
            ref={archAnim.ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {architecture.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 rounded-xl border bg-card p-5 transition-all duration-500 hover:shadow-md hover:border-primary/20 ${
                  archAnim.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Getting Started ===== */}
      <section className="scroll-mt-14 py-20 bg-background">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.getStartTitle")}
          </h2>

          <div ref={startAnim.ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {startSteps.map((s, i) => (
              <div
                key={i}
                className={`relative text-center rounded-xl border bg-card p-6 transition-all duration-500 hover:shadow-md ${
                  startAnim.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
                  <s.icon className="size-6" />
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-wider">
                  STEP {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < startSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 z-10">
                    <ArrowRight className="size-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="text-base"
              onClick={() => router.push("/projects/new")}
            >
              <Sparkles className="size-4 mr-2" />
              {t("about.cta")}
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-muted/40 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  P
                </div>
                <span className="font-semibold text-lg">PPT Master</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("about.footerDesc")}
              </p>
            </div>

            {/* links */}
            <div>
              <h4 className="font-semibold mb-3">{t("about.footerLinks")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => scrollTo("features")}
                    className="hover:text-foreground transition-colors"
                  >
                    {t("about.nav.features")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("pipeline")}
                    className="hover:text-foreground transition-colors"
                  >
                    {t("about.nav.pipeline")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("scenarios")}
                    className="hover:text-foreground transition-colors"
                  >
                    {t("about.nav.scenarios")}
                  </button>
                </li>
              </ul>
            </div>

            {/* resources */}
            <div>
              <h4 className="font-semibold mb-3">{t("about.footerGitHub")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/hugohe3/ppt-master"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/settings")}
                    className="hover:text-foreground transition-colors"
                  >
                    {t("nav.settings")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/projects")}
                    className="hover:text-foreground transition-colors"
                  >
                    {t("nav.projects")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            {t("about.footerCopyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
