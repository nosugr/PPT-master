"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { pipeline, templates, type Template, type GenerationStatus } from "@/lib/api";
import { useTranslation, type TranslationKeys } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Upload,
  LayoutTemplate,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function GeneratePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [templateThumbnails, setTemplateThumbnails] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [tmplSearch, setTmplSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showOptions, setShowOptions] = useState(false);
  const [pageCount, setPageCount] = useState("");
  const [imageMode, setImageMode] = useState("filtered");
  const [styleHint, setStyleHint] = useState("");

  // Restore last-used options from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pptmaster.generate.options");
      if (saved) {
        const opts = JSON.parse(saved);
        if (opts.pageCount) setPageCount(String(opts.pageCount));
        if (opts.imageMode) setImageMode(opts.imageMode);
        if (opts.styleHint) setStyleHint(opts.styleHint);
        if (opts.pageCount || opts.styleHint) setShowOptions(true);
      }
    } catch {}
  }, []);

  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<GenerationStatus | null>(null);
  const [logHistory, setLogHistory] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    templates
      .list()
      .then((list) => {
        setTemplateList(list);
        list.forEach((item) => {
          if (item.cover_svg) {
            templates
              .getSvg(item.id, item.cover_svg)
              .then((data) =>
                setTemplateThumbnails((prev) => ({ ...prev, [item.id]: data.svg }))
              )
              .catch(() => {});
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    pipeline.generationStatus(id).then((s) => {
      if (s.status === "running") {
        setGenerating(true);
        setGenStatus(s);
        startPolling();
      }
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (genStatus?.status === "running" && genStatus.message) {
      setLogHistory((prev) => {
        if (prev[prev.length - 1] === genStatus.message) return prev;
        return [...prev.slice(-49), genStatus.message!];
      });
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [genStatus?.status, genStatus?.message]);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const s = await pipeline.generationStatus(id);
        setGenStatus(s);
        if (s.status === "completed" || s.status === "error") {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          setGenerating(false);
          if (s.status === "completed") {
            toast.success(t("detail.generationCompleted"));
          }
        }
      } catch { /* ignore */ }
    }, 3000);
  }, [id, t]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setLogHistory([]);
    setGenStatus({ status: "running", message: t("generate.starting") });
    try {
      localStorage.setItem("pptmaster.generate.options", JSON.stringify({ pageCount, imageMode, styleHint }));
    } catch {}

    try {
      await pipeline.generate(id, {
        template_id: selectedTemplateId || undefined,
        page_count: pageCount ? parseInt(pageCount, 10) : undefined,
        image_mode: imageMode || undefined,
        style: styleHint.trim() || undefined,
      });
      startPolling();
    } catch (e: any) {
      toast.error(e.message || t("detail.generationFailed", { error: "" }));
      setGenerating(false);
      setGenStatus(null);
    }
  }, [id, selectedTemplateId, startPolling, t]);

  const handleUploadTemplate = useCallback(async (file: File) => {
    try {
      const result = await templates.upload(file);
      await templates.register(result.staging_id || result.id);
      toast.success(t("templates.uploadSuccess"));
      const list = await templates.list();
      setTemplateList(list);
    } catch (e: any) {
      toast.error(e.message || t("upload.uploadFailed"));
    }
  }, [t]);

  const filtered = templateList.filter(
    (item) =>
      !tmplSearch ||
      item.id.toLowerCase().includes(tmplSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(tmplSearch.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(tmplSearch.toLowerCase()))
  );

  const stageLabels: Record<string, TranslationKeys> = {
    strategist:      "generate.stage.strategist",
    images:          "generate.stage.images",
    executing:       "generate.stage.executing",
    quality_check:   "generate.stage.quality_check",
    post_processing: "generate.stage.post_processing",
  };

  if (generating || (genStatus && genStatus.status !== "idle")) {
    const stageKey = genStatus?.stage ? stageLabels[genStatus.stage] : null;

    return (
      <div>
        <div className="flex items-center border-b -mx-6 -mt-6 px-4 py-2 mb-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/projects" className="hover:text-foreground transition-colors">{t("nav.projects")}</Link>
            <span>/</span>
            <Link href={`/projects/${id}`} className="hover:text-foreground transition-colors capitalize">
              {id.split("_").slice(0, -2).join(" ")}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{t("detail.selectTemplate")}</span>
          </nav>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {genStatus?.status === "completed" ? (
                  <CheckCircle className="size-5 text-green-500" />
                ) : genStatus?.status === "error" ? (
                  <XCircle className="size-5 text-red-500" />
                ) : (
                  <Loader2 className="size-5 animate-spin" />
                )}
                {genStatus?.status === "completed"
                  ? t("detail.generationCompleted")
                  : genStatus?.status === "error"
                  ? t("detail.generationFailed", { error: "" })
                  : t("detail.generationInProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {genStatus?.status === "running" && stageKey && (
                <div className="text-sm font-medium text-primary">{t(stageKey)}</div>
              )}

              <p className="text-sm text-muted-foreground">
                {genStatus?.message || t("generate.starting")}
              </p>

              {logHistory.length > 1 && (
                <div className="rounded-md border bg-muted/30 p-2.5 max-h-28 overflow-y-auto space-y-0.5">
                  {logHistory.slice(0, -1).map((msg, i) => (
                    <p key={i} className="text-xs text-muted-foreground/50 leading-relaxed">{msg}</p>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}

              {genStatus?.total_pages != null && genStatus.total_pages > 0 && (
                <div>
                  <Progress
                    value={((genStatus.current_page || 0) / genStatus.total_pages) * 100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {t("generate.pagesProgress", {
                        current: String(genStatus.current_page || 0),
                        total: String(genStatus.total_pages),
                      })}
                    </span>
                    {genStatus.started_at && (
                      <span>
                        {t("generate.elapsed", {
                          seconds: String(Math.round((Date.now() - new Date(genStatus.started_at).getTime()) / 1000)),
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {genStatus?.status === "error" && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{genStatus.error}</p>
                </div>
              )}

              {genStatus?.status === "completed" && (
                <Button onClick={() => router.push(`/projects/${id}`)} className="w-full">
                  {t("generate.viewProject")}
                </Button>
              )}

              {genStatus?.status === "error" && (
                <div className="flex gap-2">
                  <Button onClick={handleGenerate} className="flex-1">
                    <Sparkles className="size-4 mr-1" /> {t("generate.retry")}
                  </Button>
                  <Button variant="outline" onClick={() => router.back()}>
                    {t("templateDetail.back")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center border-b -mx-6 -mt-6 px-4 py-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-1" /> {t("templateDetail.back")}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("detail.selectTemplate")}</h1>
        <p className="text-sm text-muted-foreground">{t("detail.noTemplateDesc")}</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t("templates.search")}
          value={tmplSearch}
          onChange={(e) => setTmplSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* No template option */}
      <button
        type="button"
        className={`w-full rounded-lg border-2 p-4 text-left text-sm transition-all cursor-pointer hover:bg-accent/50 mb-4 ${
          selectedTemplateId === null ? "border-primary bg-primary/5" : "border-muted"
        }`}
        onClick={() => setSelectedTemplateId(null)}
      >
        <span className="font-medium">{t("detail.noTemplate")}</span>
        <p className="text-xs text-muted-foreground mt-1">{t("detail.noTemplateDesc")}</p>
      </button>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">{t("templates.loading")}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`relative rounded-lg border-2 p-2 text-left text-sm transition-all cursor-pointer hover:bg-accent/50 ${
                selectedTemplateId === item.id ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => setSelectedTemplateId(item.id)}
            >
              {templateThumbnails[item.id] ? (
                <div
                  className="aspect-video bg-muted rounded mb-1.5 overflow-hidden [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: templateThumbnails[item.id] }}
                />
              ) : (
                <div className="aspect-video bg-muted rounded mb-1.5 flex items-center justify-center text-xs text-muted-foreground">
                  <LayoutTemplate className="size-6" />
                </div>
              )}
              <p className="text-xs font-medium truncate">
                {item.summary ? item.summary.split(/[。.]/)[0].slice(0, 30) : item.id.replace(/_/g, " ")}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {item.keywords.slice(0, 2).map((k) => (
                  <Badge key={k} variant="secondary" className="text-[10px] px-1 py-0">{k}</Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload custom template */}
      <div className="border-t pt-3 mb-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <Upload className="size-4" />
          <span>{t("detail.uploadTemplate")}</span>
          <input
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadTemplate(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Advanced generation options */}
      <div className="border rounded-lg mb-4">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-lg"
        >
          <span>{t("generate.advancedOptions")}</span>
          {showOptions ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {showOptions && (
          <div className="border-t px-4 pb-4 pt-3 space-y-4">
            <div>
              <Label className="text-sm">{t("generate.pageCount")}</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder={t("generate.pageCountPlaceholder")}
                className="mt-1.5"
              />
            </div>
            <Separator />
            <div>
              <Label className="text-sm">{t("generate.imageMode")}</Label>
              <Select value={imageMode} onValueChange={(v) => { if (v) setImageMode(v); }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("generate.imageModeAll")}</SelectItem>
                  <SelectItem value="filtered">{t("generate.imageModeFiltered")}</SelectItem>
                  <SelectItem value="none">{t("generate.imageModeNone")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div>
              <Label className="text-sm">{t("generate.styleHint")}</Label>
              <Input
                value={styleHint}
                onChange={(e) => setStyleHint(e.target.value)}
                placeholder={t("generate.styleHintPlaceholder")}
                className="mt-1.5"
              />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t py-4 flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          {t("newProject.cancel")}
        </Button>
        <Button onClick={handleGenerate} className="flex-1">
          <Sparkles className="size-4 mr-1.5" />
          {t("action.generate")}
        </Button>
      </div>
    </div>
  );
}
