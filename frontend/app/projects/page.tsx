"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { projects, settings, type Project } from "@/lib/api";
import { useTranslation, type TranslationKeys } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, Download, Trash2, AlertTriangle, Settings, Search, FolderOpen, Copy, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useSoftDelete } from "@/hooks/use-soft-delete";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function rewriteSvgPaths(svg: string, projectId: string): string {
  const base = `${API_BASE}/api/projects/${projectId}/files/images/`;
  return svg
    .replace(/href="(?:\.\.\/)*images\//g, `href="${base}`)
    .replace(/xlink:href="(?:\.\.\/)*images\//g, `xlink:href="${base}`);
}

const STAGE_BADGE: Record<string, { key: TranslationKeys; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  initialized:   { key: "projects.status.initialized",  variant: "secondary" },
  spec_ready:    { key: "projects.status.spec_ready",   variant: "secondary" },
  svg_generated: { key: "projects.status.svg_generated", variant: "default" },
  finalized:     { key: "projects.status.finalized",    variant: "default" },
  exported:      { key: "projects.status.exported",     variant: "outline" },
};

function formatDate(ts: number) {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString();
}

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { t } = useTranslation();

  const STAGE_ORDER = ["exported", "finalized", "svg_generated", "spec_ready", "initialized"];

  // Soft delete for projects
  const { softDelete: softDeleteProject } = useSoftDelete<string>({
    onDelete: async (projectId) => {
      await projects.delete(projectId);
      load();
    },
    onUndo: () => {
      setHiddenProjects(new Set());
    },
    delay: 5000,
    undoLabel: t("softDelete.undo"),
    successLabel: t("softDelete.undoProject"),
  });

  const filteredProjects = useMemo(() => {
    let list = [...projectList].filter((p) => !hiddenProjects.has(p.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || p.id.split("_").slice(0, -2).join("_")).toLowerCase();
        return name.includes(q) || p.id.toLowerCase().includes(q);
      });
    }
    if (stageFilter.length > 0) list = list.filter((p) => stageFilter.includes(p.stage));
    if (sortBy === "newest") list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    else if (sortBy === "oldest") list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    else if (sortBy === "status") list.sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
    return list;
  }, [projectList, searchQuery, sortBy, stageFilter, hiddenProjects]);

  const load = async () => {
    try {
      const data = await projects.list();
      setProjectList(data);
      setHiddenProjects(new Set());
      // Load first slide thumbnail for each project with batched approach
      const projectsWithSlides = data.filter((p) => p.svg_count > 0);
      for (let i = 0; i < projectsWithSlides.length; i += 4) {
        const batch = projectsWithSlides.slice(i, i + 4);
        await Promise.all(
          batch.map(async (p) => {
            try {
              const slideList = await projects.listSlides(p.id);
              if (slideList[0]) {
                const slide = await projects.getSlide(p.id, slideList[0].name);
                if (slide.svg) setThumbnails((prev) => ({ ...prev, [p.id]: rewriteSvgPaths(slide.svg, p.id) }));
              }
            } catch { /* ignore thumbnail errors */ }
          }),
        );
      }
    } catch {
      toast.error(t("projects.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Check if LLM is configured
  useEffect(() => {
    settings.get().then(data => {
      const hasKey = !!(data.llm_provider ||
        Object.entries(data.values || {}).some(([k, v]) => k.startsWith("LLM") && v));
      setApiKeyMissing(!hasKey);
    }).catch(() => {});
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenProjects((prev) => new Set(prev).add(id));
    softDeleteProject(id, id);
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await projects.duplicate(id);
      toast.success(t("projects.duplicated"));
      load();
    } catch {
      toast.error(t("projects.duplicateFailed"));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let count = 0;
    for (const id of selected) {
      try { await projects.delete(id); count++; } catch { /* continue */ }
    }
    toast.success(t("projects.bulkDeleted", { count: String(count) }));
    setSelected(new Set());
    setSelectMode(false);
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("projects.title")}</h1>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selected.size === filteredProjects.length) {
                    setSelected(new Set());
                  } else {
                    setSelected(new Set(filteredProjects.map((p) => p.id)));
                  }
                }}
              >
                {selected.size === filteredProjects.length ? t("projects.deselectAll") : t("projects.selectAll")}
              </Button>
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 className="size-3.5 mr-1" />
                  {t("projects.bulkDelete", { count: String(selected.size) })}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); setSelected(new Set()); }}>
                {t("projects.cancelSelect")}
              </Button>
            </>
          ) : (
            <>
              {projectList.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                  {t("projects.selecting")}
                </Button>
              )}
              <Button onClick={() => router.push("/projects/new")}>
                <Plus className="size-4 mr-1" /> {t("nav.newProject")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search, sort and stage filter — only show when there are projects */}
      {!loading && projectList.length > 0 && (
        <>
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t("projects.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("projects.sortNewest")}</SelectItem>
                <SelectItem value="oldest">{t("projects.sortOldest")}</SelectItem>
                <SelectItem value="status">{t("projects.sortByStatus")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {Object.entries(STAGE_BADGE).map(([stage, meta]) => {
              const isActive = stageFilter.includes(stage);
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() =>
                    setStageFilter((prev) =>
                      isActive ? prev.filter((s) => s !== stage) : [...prev, stage]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {t(meta.key)}
                </button>
              );
            })}
            {stageFilter.length > 0 && (
              <button
                type="button"
                onClick={() => setStageFilter([])}
                className="px-2.5 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                × {t("projects.clearFilter")}
              </button>
            )}
          </div>
        </>
      )}

      {/* API key warning banner */}
      {apiKeyMissing && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 text-sm">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-200 flex-1">
            {t("projects.noApiKey")}
          </span>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">
              <Settings className="size-3 mr-1" /> {t("nav.settings")}
            </Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : projectList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="size-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{t("projects.empty")}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">{t("projects.emptyHint")}</p>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="size-4 mr-2" /> {t("nav.newProject")}
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {t("projects.noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const stageMeta = STAGE_BADGE[p.stage] ?? STAGE_BADGE.initialized;
            const displayName = (p.name || p.id.split("_").slice(0, -2).join("_") || p.id)
              .replace(/_/g, " ");
            return (
              <Card
                key={p.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectMode && selected.has(p.id) ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  if (selectMode) {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                      return next;
                    });
                  } else {
                    router.push(`/projects/${p.id}`);
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {selectMode && (
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                            return next;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                    )}
                    <CardTitle className="text-base font-medium truncate capitalize">{displayName}</CardTitle>
                  </div>
                  {!selectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.id}`); }}>
                          <FolderOpen className="size-3.5 mr-2" /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicate(p.id, e)}>
                          <Copy className="size-3.5 mr-2" /> {t("projects.duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDelete(p.id, e)}
                        >
                          <Trash2 className="size-3.5 mr-2" /> {t("templates.deleteTemplate")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent>
                  {thumbnails[p.id] && (
                    <div
                      className="aspect-video bg-muted rounded mb-3 overflow-hidden [&>svg]:w-full [&>svg]:h-full pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: thumbnails[p.id] }}
                    />
                  )}
                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-2">
                    <Badge variant="secondary" className="text-xs">{p.canvas_format}</Badge>
                    <Badge variant={stageMeta.variant} className="text-xs">
                      {t(stageMeta.key)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {p.svg_count > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" /> {t("projects.slides", { count: p.svg_count })}
                      </span>
                    )}
                    {p.export_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Download className="size-3" /> {t("projects.exports", { count: p.export_count })}
                      </span>
                    )}
                    {p.created_at ? (
                      <span className="ml-auto">{formatDate(p.created_at)}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("projects.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("projects.deleteConfirmNew", {
                name: (() => {
                  const p = projectList.find((x) => x.id === deleteTarget);
                  return p ? (p.name || p.id.split("_").slice(0, -2).join(" ")) : (deleteTarget ?? "");
                })(),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("newProject.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteTarget(null)}>
              {t("templates.deleteTemplate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={(open) => { if (!open) setBulkDeleteOpen(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("projects.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("projects.bulkDeleteConfirm", { count: String(selected.size) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
              {t("newProject.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? "..." : t("projects.bulkDelete", { count: String(selected.size) })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
