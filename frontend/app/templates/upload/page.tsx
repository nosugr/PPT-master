"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { templates } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, ArrowLeft } from "lucide-react";

interface StagingResult {
  staging_id: string;
  slide_count: number;
  svgs: { name: string; filename: string }[];
  summary: string | null;
}

export default function UploadTemplatePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<StagingResult | null>(null);
  const [registering, setRegistering] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await templates.upload(file);
      setResult(data);
      toast.success(t("upload.extracted", { count: data.slide_count }));
    } catch (e: any) {
      toast.error(e.message || t("upload.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleRegister = async () => {
    if (!result) return;
    setRegistering(true);
    try {
      await templates.register(result.staging_id);
      toast.success(t("upload.registered"));
      router.push("/templates");
    } catch (e: any) {
      toast.error(e.message || t("upload.registerFailed"));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      <div className="flex items-center border-b -mx-6 -mt-6 px-4 py-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-1" /> {t("upload.back")}
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t("upload.title")}</h1>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("upload.pptxFile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("upload.description")}
              <br />
              {t("upload.descriptionHint")}
            </p>

            <div>
              <Label htmlFor="pptx-file">{t("upload.fileLabel")}</Label>
              <Label
                htmlFor="pptx-file"
                className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md px-4 py-6 text-sm text-muted-foreground hover:bg-muted/50 mt-1 justify-center"
              >
                <Upload className="size-5" />
                {file ? file.name : t("upload.fileDrop")}
              </Label>
              <Input
                id="pptx-file"
                type="file"
                accept=".pptx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
              {uploading ? t("upload.extracting") : t("upload.extract")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                {t("upload.complete")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>{t("upload.extracted", { count: result.slide_count })}</Badge>
                <span className="text-sm text-muted-foreground">
                  {t("upload.stagingId")}{result.staging_id}
                </span>
              </div>

              {result.svgs.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("upload.extractedPages")}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {result.svgs.map((s) => (
                      <div key={s.name} className="text-xs flex items-center gap-1 text-muted-foreground">
                        <FileText className="size-3" />
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.summary && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("upload.summary")}</p>
                  <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {result.summary}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleRegister} disabled={registering} className="flex-1">
              {registering ? t("upload.registering") : t("upload.register")}
            </Button>
            <Button variant="outline" onClick={() => setResult(null)}>
              {t("upload.another")}
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
