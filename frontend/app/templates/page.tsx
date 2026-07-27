"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { templates, type Template } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, LayoutTemplate, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function TemplateGrid({
  items,
  thumbnails,
  search,
  router,
  t,
  onDelete,
  showDelete,
}: {
  items: Template[];
  thumbnails: Record<string, string>;
  search: string;
  router: ReturnType<typeof useRouter>;
  t: (key: any, params?: any) => string;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}) {
  const filtered = items.filter(
    (item) =>
      !search ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <LayoutTemplate className="size-12 mx-auto mb-2 opacity-50" />
        <p>{t("templates.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((item) => {
        const displayName = item.summary
          ? item.summary.split(/[。.]/)[0].slice(0, 40)
          : item.id.replace(/_/g, " ");

        return (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => router.push(`/templates/${item.id}`)}
            title={t("templates.clickToOpen")}
          >
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium truncate">{displayName}</CardTitle>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.id}</p>
              </div>
              {showDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(t("templates.deleteConfirm", { id: item.id }))) {
                      onDelete(item.id);
                    }
                  }}
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {thumbnails[item.id] ? (
                <div
                  className="aspect-video bg-muted rounded mb-2 overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: thumbnails[item.id] }}
                />
              ) : (
                <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center text-xs text-muted-foreground">
                  {item.cover_svg ? t("templates.loading") : t("templates.noPreview")}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {t("templates.pages", { count: item.svg_count })}
                </Badge>
                {item.keywords.slice(0, 3).map((k) => (
                  <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function TemplatesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    templates
      .list()
      .then((list) => {
        setTemplateList(list);
        list.forEach((item) => {
          if (item.cover_svg) {
            templates
              .getSvg(item.id, item.cover_svg)
              .then((data) =>
                setThumbnails((prev) => ({ ...prev, [item.id]: data.svg }))
              )
              .catch(() => {});
          }
        });
      })
      .catch(() => toast.error(t("templates.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await templates.delete(id);
      toast.success(t("templates.deleted"));
      load();
    } catch (e: any) {
      toast.error(e.message || t("templates.deleteFailed"));
    }
  };

  const officialTemplates = templateList.filter((t) => t.source === "official");
  const userTemplates = templateList.filter((t) => t.source === "user");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("templates.title")}</h1>
        <Link href="/templates/upload">
          <Button>
            <Upload className="size-4 mr-1" /> {t("templates.upload")}
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t("templates.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
      ) : (
        <Tabs defaultValue="official">
          <TabsList className="mb-4">
            <TabsTrigger value="official" className="gap-1.5">
              <LayoutTemplate className="size-3.5" />
              {t("templates.official")} ({officialTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="user" className="gap-1.5">
              <FolderOpen className="size-3.5" />
              {t("templates.myTemplates")} ({userTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="official">
            <TemplateGrid
              items={officialTemplates}
              thumbnails={thumbnails}
              search={search}
              router={router}
              t={t}
            />
          </TabsContent>

          <TabsContent value="user">
            {userTemplates.length === 0 && !search ? (
              <div className="text-center py-16 text-muted-foreground">
                <Upload className="size-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">{t("templates.noUserTemplates")}</p>
                <Link href="/templates/upload">
                  <Button variant="outline" size="sm">
                    <Upload className="size-4 mr-1" /> {t("templates.upload")}
                  </Button>
                </Link>
              </div>
            ) : (
              <TemplateGrid
                items={userTemplates}
                thumbnails={thumbnails}
                search={search}
                router={router}
                t={t}
                showDelete
                onDelete={handleDelete}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
