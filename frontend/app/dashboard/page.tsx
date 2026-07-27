"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects, type Project } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, CheckCircle, Loader2, Plus, ArrowRight, FileText, Download } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function rewriteSvgPaths(svg: string, projectId: string): string {
  const base = `${API_BASE}/api/projects/${projectId}/files/images/`;
  return svg
    .replace(/href="(?:\.\.\/)*images\//g, `href="${base}`)
    .replace(/xlink:href="(?:\.\.\/)*images\//g, `xlink:href="${base}`);
}

function formatDate(ts: number) {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString();
}

function isThisWeek(ts: number): boolean {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return ts * 1000 >= weekAgo;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    projects.list().then(async (data) => {
      setProjectList(data);
      // Load thumbnails for recent projects in batches of 4
      const withSlides = data.slice(0, 6).filter((p) => p.svg_count > 0);
      for (let i = 0; i < withSlides.length; i += 4) {
        const batch = withSlides.slice(i, i + 4);
        await Promise.all(
          batch.map(async (p) => {
            try {
              const slides = await projects.listSlides(p.id);
              if (slides[0]) {
                const slide = await projects.getSlide(p.id, slides[0].name);
                if (slide.svg) setThumbnails((prev) => ({ ...prev, [p.id]: rewriteSvgPaths(slide.svg, p.id) }));
              }
            } catch { /* ignore */ }
          }),
        );
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalProjects = projectList.length;
  const completedThisWeek = projectList.filter(
    (p) => p.stage === "exported" && isThisWeek(p.created_at)
  ).length;
  const inProgress = projectList.filter(
    (p) => p.stage !== "exported" && p.stage !== "initialized"
  ).length;
  const recentProjects = [...projectList]
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    .slice(0, 6);

  const STAGE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    initialized:   { label: t("projects.status.initialized"),  variant: "secondary" },
    spec_ready:    { label: t("projects.status.spec_ready"),   variant: "secondary" },
    svg_generated: { label: t("projects.status.svg_generated"), variant: "default" },
    finalized:     { label: t("projects.status.finalized"),    variant: "default" },
    exported:      { label: t("projects.status.exported"),     variant: "outline" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <Button onClick={() => router.push("/projects/new")}>
          <Plus className="size-4 mr-1" /> {t("nav.newProject")}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderOpen className="size-4" /> {t("dashboard.totalProjects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{totalProjects}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" /> {t("dashboard.completedThisWeek")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedThisWeek}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-4 text-blue-500" /> {t("dashboard.inProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgress}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent projects */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">{t("dashboard.recentProjects")}</h2>
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          {t("dashboard.viewAll")} <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : recentProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="size-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("dashboard.noRecent")}</p>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="size-4 mr-2" /> {t("nav.newProject")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((p) => {
            const stageMeta = STAGE_BADGE[p.stage] ?? STAGE_BADGE.initialized;
            const displayName = (p.name || p.id.split("_").slice(0, -2).join("_") || p.id).replace(/_/g, " ");
            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/projects/${p.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium truncate capitalize">{displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {thumbnails[p.id] && (
                    <div
                      className="aspect-video bg-muted rounded mb-3 overflow-hidden [&>svg]:w-full [&>svg]:h-full pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: thumbnails[p.id] }}
                    />
                  )}
                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-1">
                    <Badge variant="secondary" className="text-xs">{p.canvas_format}</Badge>
                    <Badge variant={stageMeta.variant} className="text-xs">{stageMeta.label}</Badge>
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
    </div>
  );
}
