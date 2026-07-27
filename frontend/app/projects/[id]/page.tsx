"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { projects, pipeline, settings, type ProjectStatus, type GenerationStatus, type StrategistResult } from "@/lib/api";
import { useTranslation, type TranslationKeys } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Download,
  Play,
  CheckCircle,
  FileText,
  Wrench,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  AlertTriangle,
  Settings,
  Image,
  Upload,
  Pencil,
  StickyNote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SlideGrid } from "./components/slide-grid";
import { SlidePreview } from "./components/slide-preview";
import { StrategistDialog } from "./components/strategist-dialog";
import { GenerationProgress, PostProcessProgress } from "./components/generation-status";
import { loadSlidesBatched } from "@/lib/load-slides-batched";
import { useSoftDelete } from "@/hooks/use-soft-delete";

const STAGE_KEYS: Record<string, TranslationKeys> = {
  initialized:   "stages.initialized",
  spec_ready:    "stages.spec_ready",
  svg_generated: "stages.svg_generated",
  finalized:     "stages.finalized",
  exported:      "stages.exported",
};

const PROGRESS_KEYS: TranslationKeys[] = [
  "progress.initialized",
  "progress.spec",
  "progress.svg",
  "progress.final",
  "progress.exported",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function rewriteSvgPaths(svg: string, projectId: string): string {
  const base = `${API_BASE}/api/projects/${projectId}/files/images/`;
  return svg
    .replace(/href="(?:\.\.\/)*images\//g, `href="${base}`)
    .replace(/xlink:href="(?:\.\.\/)*images\//g, `xlink:href="${base}`);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ExportPathPicker({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  t: (key: any, params?: any) => string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{t("detail.exportPath")}</Label>
      <div className="flex gap-1.5 mt-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("detail.exportPathPlaceholder")}
          className="flex-1 h-8 text-xs font-mono"
          spellCheck={false}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onChange("")}
            title="Clear"
          >
            ×
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{t("detail.exportPathHint")}</p>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString();
}

const POST_STEPS: Array<{ key: TranslationKeys; run: (id: string) => Promise<any> }> = [
  { key: "action.splitNotes",  run: (id) => pipeline.splitNotes(id) },
  { key: "action.qualityCheck", run: (id) => pipeline.qualityCheck(id) },
  { key: "action.finalize",    run: (id) => pipeline.finalize(id) },
  { key: "action.exportPptx", run: (id) => pipeline.export(id) },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [slides, setSlides] = useState<{ name: string; filename: string }[]>([]);
  const [sources, setSources] = useState<{ name: string; size: number; type: string }[]>([]);
  const [exports, setExports] = useState<{ name: string; size: number; created: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [slideThumbnails, setSlideThumbnails] = useState<Record<string, string>>({});
  const [slideRawSvgs, setSlideRawSvgs] = useState<Record<string, string>>({});
  const [genStatus, setGenStatus] = useState<GenerationStatus | null>(null);
  const genPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [advancedLoading, setAdvancedLoading] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<{ errors: string[]; warnings: string[] } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [exportPath, setExportPath] = useState("");
  const [exportTransition, setExportTransition] = useState("none");

  // Slide operations state
  const [notesSlide, setNotesSlide] = useState<{ name: string; notes: string } | null>(null);
  const [hiddenSlides, setHiddenSlides] = useState<Set<string>>(new Set());

  // Step-by-step generation state
  const [strategistResult, setStrategistResult] = useState<StrategistResult | null>(null);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [showStrategistDialog, setShowStrategistDialog] = useState(false);
  const [editConfirmations, setEditConfirmations] = useState("");
  const [editPageStructure, setEditPageStructure] = useState("");
  const [artifactTab, setArtifactTab] = useState("design-spec");
  const [designSpecContent, setDesignSpecContent] = useState<string | null>(null);
  const [specLockContent, setSpecLockContent] = useState<string | null>(null);

  // Post-process pipeline state
  const [postProcess, setPostProcess] = useState<{
    running: boolean;
    stepIndex: number;
    stepKey: TranslationKeys | null;
    failed?: boolean;
    failedError?: string;
  } | null>(null);

  const projectName = status?.name || id.split("_").slice(0, -2).join("_").replace(/_/g, " ") || id;

  // --- Soft delete for slides ---
  const { softDelete: softDeleteSlide } = useSoftDelete<string>({
    onDelete: async (slideName) => {
      await projects.deleteSlide(id, slideName);
      load();
    },
    onUndo: () => {
      setHiddenSlides(new Set());
    },
    delay: 5000,
    undoLabel: t("softDelete.undo"),
    successLabel: t("softDelete.undoSlide"),
  });

  const startRename = () => {
    setNameInput(projectName);
    setEditingName(true);
  };

  const saveRename = async () => {
    const trimmed = nameInput.trim();
    setEditingName(false);
    if (!trimmed || trimmed === projectName) return;
    try {
      await projects.rename(id, trimmed);
      toast.success(t("detail.renamed"));
      load();
    } catch {
      toast.error(t("detail.renameFailed"));
    }
  };

  const load = useCallback(async () => {
    try {
      const [s, sl, sr, ex] = await Promise.all([
        projects.status(id),
        projects.listSlides(id),
        projects.listSources(id),
        projects.listExports(id),
      ]);
      setStatus(s);
      setSlides(sl);
      setSources(sr);
      setExports(ex);
      setHiddenSlides(new Set());
      // Load slides in batches of 4
      loadSlidesBatched(sl, id, (name, svg) => {
        const rewritten = rewriteSvgPaths(svg, id);
        setSlideThumbnails((prev) => ({ ...prev, [name]: rewritten }));
        setSlideRawSvgs((prev) => ({ ...prev, [name]: rewritten }));
      });
    } catch {
      toast.error(t("detail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    settings.get().then(data => {
      const hasKey = !!(data.llm_provider ||
        Object.entries(data.values || {}).some(([k, v]) => k.startsWith("LLM") && v));
      setApiKeyMissing(!hasKey);
    }).catch(() => {});
    // Load default export path
    settings.systemInfo().then(info => {
      if (info.default_export_path && !exportPath) {
        setExportPath(info.default_export_path);
      }
    }).catch(() => {});
  }, []);

  const startGenPolling = useCallback(() => {
    if (genPollRef.current) clearInterval(genPollRef.current);
    genPollRef.current = setInterval(async () => {
      try {
        const s = await pipeline.generationStatus(id);
        setGenStatus(s);
        if (s.status === "completed" || s.status === "error") {
          if (genPollRef.current) { clearInterval(genPollRef.current); genPollRef.current = null; }
          load();
          if (s.status === "completed") toast.success(t("detail.generationCompleted"));
          else toast.error(t("detail.generationFailed", { error: s.error || "" }));
        }
      } catch { /* ignore */ }
    }, 3000);
  }, [id, load, t]);

  useEffect(() => {
    return () => { if (genPollRef.current) clearInterval(genPollRef.current); };
  }, []);

  useEffect(() => {
    pipeline.generationStatus(id).then((s) => {
      if (s.status === "running") { setGenStatus(s); startGenPolling(); }
    }).catch(() => {});
  }, [id, startGenPolling]);

  const runPostProcess = useCallback(async (fromIndex = 0) => {
    setPostProcess({ running: true, stepIndex: fromIndex, stepKey: null });
    for (let i = fromIndex; i < POST_STEPS.length; i++) {
      const step = POST_STEPS[i];
      setPostProcess({ running: true, stepIndex: i, stepKey: step.key });
      try {
        let result: any;
        if (step.key === "action.exportPptx") {
          result = await pipeline.export(id, {
            export_path: exportPath || undefined,
            transition: exportTransition !== "none" ? exportTransition : undefined,
          });
        } else {
          result = await step.run(id);
        }
        if (step.key === "action.qualityCheck" && result) {
          setQualityResult({ errors: result.errors || [], warnings: result.warnings || [] });
        }
      } catch (e: any) {
        setPostProcess({ running: false, stepIndex: i, stepKey: step.key, failed: true, failedError: e.message });
        return;
      }
    }
    setPostProcess(null);
    toast.success(t("detail.processCompleted"));
    load();
  }, [id, load, t, exportPath, exportTransition]);

  const handleUploadMoreSources = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    try {
      await projects.uploadSources(id, files);
      toast.success(t("detail.sourcesUploaded"));
      load();
    } catch (err: any) {
      toast.error(err.message || t("detail.actionFailed", { name: t("detail.uploadMoreSources"), error: "" }));
    }
  }, [id, load, t]);

  const handleCopySlide = useCallback(async (slideName: string) => {
    const svg = slideRawSvgs[slideName];
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      toast.success(t("slide.copied"));
    } catch {
      toast.error("Copy failed");
    }
  }, [slideRawSvgs, t]);

  const handleViewNotes = useCallback(async (slideName: string) => {
    try {
      const data = await projects.getSlideNotes(id, slideName);
      setNotesSlide({ name: slideName, notes: data.notes });
    } catch {
      setNotesSlide({ name: slideName, notes: "" });
    }
  }, [id]);

  const handleDeleteSlide = useCallback((slideName: string) => {
    setHiddenSlides((prev) => new Set(prev).add(slideName));
    softDeleteSlide(slideName, slideName);
  }, [softDeleteSlide]);

  const handleRunStrategist = useCallback(async () => {
    setStrategistLoading(true);
    try {
      const result = await pipeline.generateStrategist(id);
      setStrategistResult(result);
      setEditConfirmations(result.confirmations || "");
      setEditPageStructure(result.page_structure || "");
      setDesignSpecContent(result.design_spec || null);
      setSpecLockContent(result.spec_lock || null);
      setShowStrategistDialog(true);
      toast.success(t("detail.strategist.analysisComplete"));
    } catch (e: any) {
      toast.error(e.message || t("detail.strategist.analysisFailed"));
    } finally {
      setStrategistLoading(false);
    }
  }, [id, t]);

  const handleConfirmAndGenerate = useCallback(async () => {
    setShowStrategistDialog(false);
    try {
      await pipeline.confirmAndGenerate(id, {
        confirmations: editConfirmations,
        page_structure: editPageStructure,
      });
      toast.success(t("detail.strategist.confirmed"));
      startGenPolling();
    } catch (e: any) {
      toast.error(e.message || t("detail.strategist.confirmFailed"));
    }
  }, [id, editConfirmations, editPageStructure, startGenPolling, t]);

  const handleLoadArtifacts = useCallback(async () => {
    try {
      const [ds, sl] = await Promise.all([
        pipeline.getDesignSpec(id).catch(() => null),
        pipeline.getSpecLock(id).catch(() => null),
      ]);
      if (ds) setDesignSpecContent(ds.content);
      if (sl) setSpecLockContent(sl.content);
    } catch { /* ignore */ }
  }, [id]);

  const runAdvancedStep = async (key: TranslationKeys, fn: () => Promise<any>) => {
    setAdvancedLoading(key);
    try {
      const result = await fn();
      if (key === "action.qualityCheck" && result) {
        setQualityResult({ errors: result.errors || [], warnings: result.warnings || [] });
      }
      toast.success(t("detail.actionCompleted", { name: t(key) }));
      load();
    } catch (e: any) {
      toast.error(t("detail.actionFailed", { name: t(key), error: e.message }));
    } finally {
      setAdvancedLoading(null);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`${API_BASE}/api/projects/${id}/exports/${filename}`, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stage = status?.stage || "initialized";
  const stageIndex = ["initialized", "spec_ready", "svg_generated", "finalized", "exported"].indexOf(stage);
  const stageProgress = (stageIndex + 1) * 20;
  const isPostProcessRunning = !!postProcess?.running;
  const isGenRunning = genStatus?.status === "running";

  return (
    <div>
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between border-b -mx-6 -mt-6 px-4 py-2 mb-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
          <Link href="/projects" className="hover:text-foreground transition-colors shrink-0">{t("nav.projects")}</Link>
          <span className="shrink-0">/</span>
          <span className="text-foreground font-medium capitalize truncate">{projectName}</span>
        </nav>
        <Button variant="outline" size="sm" onClick={() => load()} className="shrink-0 ml-2">
          <RefreshCw className="size-4 mr-1" /> {t("detail.refresh")}
        </Button>
      </div>

      {/* Project title — click pencil to rename */}
      <div className="mb-6">
        {editingName ? (
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") setEditingName(false);
            }}
            className="text-2xl font-bold w-full bg-transparent border-b border-primary outline-none pb-0.5 capitalize"
          />
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-2xl font-bold capitalize">{projectName}</h1>
            <button
              type="button"
              onClick={startRename}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{id}</p>
      </div>

      {/* API key warning */}
      {apiKeyMissing && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 text-sm">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-200 flex-1">{t("detail.noApiKey")}</span>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">
              <Settings className="size-3 mr-1" /> {t("detail.goToSettings")}
            </Button>
          </Link>
        </div>
      )}

      {/* Pipeline progress */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {t("detail.pipelineStatus")}
            <Badge>{t(STAGE_KEYS[stage] || "stages.initialized")}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={stageProgress} className="mb-2" />
          <div className="grid grid-cols-5 text-xs text-muted-foreground">
            {PROGRESS_KEYS.map((key, i) => (
              <span key={key} className={i <= stageIndex ? "text-foreground font-medium" : ""}>
                {t(key)}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation in progress */}
      <GenerationProgress genStatus={genStatus} t={t} />

      {/* Post-processing progress */}
      <PostProcessProgress
        postProcess={postProcess}
        totalSteps={POST_STEPS.length}
        onRetry={runPostProcess}
        onDismiss={() => setPostProcess(null)}
        t={t}
      />

      {/* Intermediate artifact tabs */}
      {(designSpecContent || specLockContent) && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="size-4" /> {t("detail.strategist.artifacts")}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLoadArtifacts}>
                <RefreshCw className="size-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={artifactTab} onValueChange={setArtifactTab}>
              <TabsList className="mb-2">
                {designSpecContent && <TabsTrigger value="design-spec">Design Spec</TabsTrigger>}
                {specLockContent && <TabsTrigger value="spec-lock">Spec Lock</TabsTrigger>}
                <TabsTrigger value="quality-report">Quality Report</TabsTrigger>
              </TabsList>
              {designSpecContent && (
                <TabsContent value="design-spec">
                  <div className="max-h-[400px] overflow-y-auto rounded-md bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
                    {designSpecContent}
                  </div>
                </TabsContent>
              )}
              {specLockContent && (
                <TabsContent value="spec-lock">
                  <div className="max-h-[400px] overflow-y-auto rounded-md bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
                    {specLockContent}
                  </div>
                </TabsContent>
              )}
              <TabsContent value="quality-report">
                {qualityResult ? (
                  <div className="space-y-3">
                    {qualityResult.errors.length === 0 && qualityResult.warnings.length === 0 ? (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="size-4" /> {t("detail.strategist.qualityPassed")}
                      </p>
                    ) : (
                      <>
                        {qualityResult.errors.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-1">Errors ({qualityResult.errors.length})</p>
                            <ul className="space-y-1">
                              {qualityResult.errors.map((e, i) => (
                                <li key={i} className="text-xs font-mono bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded px-2 py-1 break-all">{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {qualityResult.warnings.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-600 mb-1">Warnings ({qualityResult.warnings.length})</p>
                            <ul className="space-y-1">
                              {qualityResult.warnings.map((w, i) => (
                                <li key={i} className="text-xs font-mono bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded px-2 py-1 break-all">{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("detail.strategist.noQualityResult")}</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quality check results */}
      {qualityResult && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PackageCheck className="size-4" />
              {t("detail.qualityResult")}
              {qualityResult.errors.length === 0 && qualityResult.warnings.length === 0 && (
                <Badge variant="default" className="ml-auto text-xs">{t("detail.qualityPassed")}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          {(qualityResult.errors.length > 0 || qualityResult.warnings.length > 0) && (
            <CardContent className="space-y-3">
              {qualityResult.errors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                    {t("detail.qualityErrors", { count: String(qualityResult.errors.length) })}
                  </p>
                  <ul className="space-y-1">
                    {qualityResult.errors.map((e, i) => (
                      <li key={i} className="text-xs font-mono bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded px-2 py-1 break-all">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {qualityResult.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5">
                    {t("detail.qualityWarnings", { count: String(qualityResult.warnings.length) })}
                  </p>
                  <ul className="space-y-1">
                    {qualityResult.warnings.map((w, i) => (
                      <li key={i} className="text-xs font-mono bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded px-2 py-1 break-all">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Slides grid */}
        <div className="lg:col-span-2">
          <SlideGrid
            slides={slides}
            slideThumbnails={slideThumbnails}
            t={t}
            onPreview={setPreviewIndex}
            onCopy={handleCopySlide}
            onViewNotes={handleViewNotes}
            onDelete={handleDeleteSlide}
            hiddenSlides={hiddenSlides}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Primary action card */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              {(stage === "initialized" || stage === "spec_ready") && (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push(`/projects/${id}/generate`)}
                    disabled={isGenRunning || strategistLoading}
                  >
                    <Sparkles className="size-4 mr-2" />
                    {t("action.generate")}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">{t("detail.strategist.or")}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    onClick={handleRunStrategist}
                    disabled={isGenRunning || strategistLoading}
                  >
                    {strategistLoading ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="size-4 mr-2" />
                    )}
                    {strategistLoading ? t("detail.strategist.analyzing") : t("detail.strategist.stepGenerate")}
                  </Button>
                  {sources.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t("detail.uploadFirst")}
                    </p>
                  )}
                </>
              )}

              {stage === "svg_generated" && (
                <>
                  <ExportPathPicker value={exportPath} onChange={setExportPath} t={t} />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("detail.exportTransition")}</Label>
                    <Select value={exportTransition} onValueChange={(v) => { if (v) setExportTransition(v); }}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("detail.transitionNone")}</SelectItem>
                        <SelectItem value="fade">{t("detail.transitionFade")}</SelectItem>
                        <SelectItem value="push">{t("detail.transitionPush")}</SelectItem>
                        <SelectItem value="wipe">{t("detail.transitionWipe")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => runPostProcess()}
                    disabled={isPostProcessRunning}
                  >
                    {isPostProcessRunning ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <PackageCheck className="size-4 mr-2" />
                    )}
                    {isPostProcessRunning
                      ? (postProcess?.stepKey ? t(postProcess.stepKey) : t("detail.processing"))
                      : t("detail.processAndExport")}
                  </Button>
                </>
              )}

              {stage === "finalized" && (
                <>
                  <ExportPathPicker value={exportPath} onChange={setExportPath} t={t} />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("detail.exportTransition")}</Label>
                    <Select value={exportTransition} onValueChange={(v) => { if (v) setExportTransition(v); }}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("detail.transitionNone")}</SelectItem>
                        <SelectItem value="fade">{t("detail.transitionFade")}</SelectItem>
                        <SelectItem value="push">{t("detail.transitionPush")}</SelectItem>
                        <SelectItem value="wipe">{t("detail.transitionWipe")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => runAdvancedStep("action.exportPptx", () => pipeline.export(id, {
                      export_path: exportPath || undefined,
                      transition: exportTransition !== "none" ? exportTransition : undefined,
                    }))}
                    disabled={advancedLoading !== null}
                  >
                    <Play className="size-4 mr-2" />
                    {t("action.exportPptx")}
                  </Button>
                </>
              )}

              {stage === "exported" && (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-950 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle className="size-4 shrink-0" />
                    <span>{t("detail.exportedDone")} — {t("detail.processCompleted")}</span>
                  </div>
                  <ExportPathPicker value={exportPath} onChange={setExportPath} t={t} />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("detail.exportTransition")}</Label>
                    <Select value={exportTransition} onValueChange={(v) => { if (v) setExportTransition(v); }}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("detail.transitionNone")}</SelectItem>
                        <SelectItem value="fade">{t("detail.transitionFade")}</SelectItem>
                        <SelectItem value="push">{t("detail.transitionPush")}</SelectItem>
                        <SelectItem value="wipe">{t("detail.transitionWipe")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => runAdvancedStep("action.exportPptx", () => pipeline.export(id, {
                      export_path: exportPath || undefined,
                      transition: exportTransition !== "none" ? exportTransition : undefined,
                    }))}
                    disabled={advancedLoading !== null}
                  >
                    <Download className="size-4 mr-2" />
                    {t("action.exportPptx")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Exports */}
          {exports.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("detail.exports", { count: exports.length })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exports.map((e) => (
                  <div key={e.name} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(e.size)} · {formatDate(e.created)}
                      </p>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDownload(e.name)}>
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("detail.sources", { count: sources.length })}</CardTitle>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <Upload className="size-3" />
                  {t("detail.uploadMoreSources")}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.pptx,.xlsx,.md,.txt,.csv"
                    className="hidden"
                    onChange={handleUploadMoreSources}
                  />
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("detail.noSources")}</p>
              ) : (
                <div className="space-y-1">
                  {sources.map((s) => (
                    <div key={s.name} className="text-xs flex items-center gap-2">
                      <FileText className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{s.name}</span>
                      <span className="text-muted-foreground shrink-0">{formatFileSize(s.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced actions (collapsible) */}
          <Card>
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-lg"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="flex items-center gap-2">
                <Wrench className="size-3.5" />
                {t("detail.advancedActions")}
              </span>
              {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {showAdvanced && (
              <CardContent className="pt-0 pb-3 space-y-1.5">
                <Separator className="mb-3" />
                <Button
                  className="w-full justify-start" size="sm"
                  onClick={() => router.push(`/projects/${id}/generate`)}
                  disabled={!!advancedLoading}
                >
                  <Sparkles className="size-3.5 mr-2" /> {t("action.generate")}
                </Button>
                {POST_STEPS.map(({ key, run }) => (
                  <Button
                    key={key}
                    className="w-full justify-start" variant="outline" size="sm"
                    onClick={() => runAdvancedStep(key, () => run(id))}
                    disabled={!!advancedLoading}
                  >
                    {advancedLoading === key ? (
                      <Loader2 className="size-3.5 mr-2 animate-spin" />
                    ) : (
                      <Wrench className="size-3.5 mr-2" />
                    )}
                    {t(key)}
                  </Button>
                ))}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Full-screen slide preview */}
      <SlidePreview
        slides={slides}
        slideRawSvgs={slideRawSvgs}
        previewIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNavigate={setPreviewIndex}
        t={t}
      />

      {/* Slide notes dialog */}
      <Dialog open={!!notesSlide} onOpenChange={(open) => { if (!open) setNotesSlide(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="size-4" /> {t("slide.notes")}
              {notesSlide && <span className="text-sm font-normal text-muted-foreground ml-1">— {notesSlide.name}</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[80px] max-h-[300px] overflow-y-auto rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">
            {notesSlide?.notes?.trim() || <span className="text-muted-foreground">{t("slide.noNotes")}</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesSlide(null)}>{t("templateDetail.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Strategist preview & confirmation dialog */}
      <StrategistDialog
        open={showStrategistDialog}
        onOpenChange={setShowStrategistDialog}
        strategistResult={strategistResult}
        editConfirmations={editConfirmations}
        onEditConfirmations={setEditConfirmations}
        editPageStructure={editPageStructure}
        onEditPageStructure={setEditPageStructure}
        onConfirmAndGenerate={handleConfirmAndGenerate}
        t={t}
      />
    </div>
  );
}
