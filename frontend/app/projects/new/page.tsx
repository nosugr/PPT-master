"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects, formats, type CanvasFormat } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, FileText, Link, Plus } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [canvasFormat, setCanvasFormat] = useState("ppt169");
  const [formatList, setFormatList] = useState<CanvasFormat[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    formats.list().then(setFormatList).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    setUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    toast.success(t("newProject.urlAdded"));
  };

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      /\.(pdf|docx?|pptx|xlsx|md|txt|csv)$/i.test(f.name)
    );
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t("newProject.nameRequired"));
      return;
    }
    setCreating(true);
    try {
      const result = await projects.create(name.trim(), canvasFormat);

      if (files.length > 0) {
        toast.info(t("newProject.uploading"));
        await projects.uploadSources(result.id, files);
      }

      if (urls.length > 0) {
        toast.info(t("newProject.urlImporting"));
        for (const url of urls) {
          try {
            await projects.importUrl(result.id, url);
          } catch (e: any) {
            toast.error(`URL import failed: ${url}`);
          }
        }
      }

      toast.success(t("newProject.created"));
      router.push(`/projects/${result.id}`);
    } catch (e: any) {
      toast.error(e.message || t("newProject.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("newProject.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("newProject.settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("newProject.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("newProject.namePlaceholder")}
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div>
            <Label>{t("newProject.canvasFormat")}</Label>
            <Select value={canvasFormat} onValueChange={(v) => setCanvasFormat(v ?? "ppt169")}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[420px]">
                {formatList.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {f.dimensions} · {f.aspect_ratio}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formatList.find((f) => f.id === canvasFormat)?.use_case && (
              <p className="text-xs text-muted-foreground mt-1.5 pl-0.5">
                {formatList.find((f) => f.id === canvasFormat)!.use_case}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File upload */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("newProject.sources")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg transition-all duration-150 ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center gap-2 cursor-pointer px-4 py-8"
            >
              <Upload
                className={`transition-all duration-150 ${
                  isDragging ? "size-9 text-primary" : "size-6 text-muted-foreground"
                }`}
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isDragging ? t("newProject.dropNow") : t("newProject.dropFiles")}
              </span>
              {!isDragging && (
                <span className="text-xs text-muted-foreground/60">
                  {t("newProject.dropHint")}
                </span>
              )}
            </label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.pptx,.xlsx,.md,.txt,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-sm border rounded px-3 py-1.5">
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="size-3.5 text-muted-foreground" />
                    {f.name}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeFile(i)}>
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL import */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="size-4" />
            {t("newProject.urlsSection")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t("newProject.urlPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              className="flex-1"
            />
            <Button variant="outline" onClick={addUrl} disabled={!urlInput.trim()}>
              <Plus className="size-4 mr-1" /> {t("newProject.addUrl")}
            </Button>
          </div>

          {urls.length > 0 && (
            <div className="space-y-1">
              {urls.map((url, i) => (
                <div key={i} className="flex items-center justify-between text-sm border rounded px-3 py-1.5">
                  <span className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                    <Link className="size-3.5 shrink-0" />
                    {url}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeUrl(i)}>
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleCreate} disabled={creating} className="flex-1">
          {creating ? t("newProject.creating") : t("newProject.create")}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>{t("newProject.cancel")}</Button>
      </div>
    </div>
  );
}
