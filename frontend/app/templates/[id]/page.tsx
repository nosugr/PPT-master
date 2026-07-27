"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { templates, type TemplateDetail } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, FileText, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [detail, setDetail] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [svgContents, setSvgContents] = useState<Record<string, string>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    templates
      .get(id)
      .then((data) => {
        setDetail(data);
        data.svgs.forEach((svg) => {
          templates
            .getSvg(id, svg.filename)
            .then((res) =>
              setSvgContents((prev) => ({ ...prev, [svg.filename]: res.svg }))
            )
            .catch(() => {});
        });
      })
      .catch(() => toast.error(t("templateDetail.notFound")))
      .finally(() => setLoading(false));
  }, [id]);

  const navigatePage = useCallback(
    (direction: -1 | 1) => {
      if (selectedIndex === null || !detail) return;
      const next = selectedIndex + direction;
      if (next >= 0 && next < detail.svgs.length) setSelectedIndex(next);
    },
    [selectedIndex, detail]
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigatePage(-1);
      else if (e.key === "ArrowRight") navigatePage(1);
      else if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, navigatePage]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>{t("templateDetail.notFound")}</p>
        <Button variant="link" onClick={() => router.push("/templates")}>
          {t("templateDetail.backToTemplates")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center border-b -mx-6 -mt-6 px-4 py-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
          <ArrowLeft className="size-4 mr-1" /> {t("templateDetail.back")}
        </Button>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">{decodeURIComponent(id)}</h1>
        {detail.summary && (
          <p className="text-sm text-muted-foreground">{detail.summary}</p>
        )}
      </div>

      {detail.keywords.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {detail.keywords.map((k) => (
            <Badge key={k} variant="outline">{k}</Badge>
          ))}
        </div>
      )}

      {/* SVG Pages */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="size-4" /> {t("templateDetail.pages", { count: detail.svgs.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {detail.svgs.map((svg, i) => (
              <div
                key={svg.filename}
                className="border rounded-md p-2 cursor-pointer hover:border-primary transition-colors"
                onDoubleClick={() => setSelectedIndex(i)}
              >
                {svgContents[svg.filename] ? (
                  <div
                    className="aspect-video bg-muted rounded mb-1 overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: svgContents[svg.filename] }}
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded mb-1 flex items-center justify-center text-xs text-muted-foreground">
                    {t("templateDetail.loading")}
                  </div>
                )}
                <p className="text-xs truncate">{svg.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      {detail.assets.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4" /> {t("templateDetail.assets", { count: detail.assets.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {detail.assets.map((a) => (
                <div key={a.name} className="text-xs flex items-center gap-2">
                  <FileText className="size-3 text-muted-foreground" />
                  <span>{a.name}</span>
                  <span className="text-muted-foreground ml-auto">
                    {(a.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design Spec */}
      {detail.design_spec && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("templateDetail.designSpec")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded max-h-[400px] overflow-auto">
              {detail.design_spec}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Full-size SVG overlay */}
      {selectedIndex !== null && detail.svgs[selectedIndex] && svgContents[detail.svgs[selectedIndex].filename] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="w-[75vw] h-[75vh] bg-white rounded-lg overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                onClick={() => navigatePage(-1)}
              >
                <ChevronLeft className="size-6" />
              </Button>
            )}
            {selectedIndex < detail.svgs.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                onClick={() => navigatePage(1)}
              >
                <ChevronRight className="size-6" />
              </Button>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {detail.svgs[selectedIndex].name}
                  <span className="text-muted-foreground ml-2">
                    {selectedIndex + 1} / {detail.svgs.length}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)}>
                  {t("templateDetail.close")}
                </Button>
              </div>
              <div
                className="[&>svg]:w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: svgContents[detail.svgs[selectedIndex].filename] }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
