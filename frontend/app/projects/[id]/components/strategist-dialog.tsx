"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Play } from "lucide-react";
import type { StrategistResult } from "@/lib/api";
import type { TranslationKeys } from "@/lib/i18n";

interface StrategistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategistResult: StrategistResult | null;
  editConfirmations: string;
  onEditConfirmations: (value: string) => void;
  editPageStructure: string;
  onEditPageStructure: (value: string) => void;
  onConfirmAndGenerate: () => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export function StrategistDialog({
  open,
  onOpenChange,
  strategistResult,
  editConfirmations,
  onEditConfirmations,
  editPageStructure,
  onEditPageStructure,
  onConfirmAndGenerate,
  t,
}: StrategistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" /> {t("detail.strategist.dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("detail.strategist.dialogDesc")}
          </DialogDescription>
        </DialogHeader>

        {strategistResult?.analysis_meta && (
          <div className="flex flex-wrap gap-2 text-xs">
            {strategistResult.analysis_meta.inferred_style && (
              <Badge variant="outline">
                {t("detail.strategist.style")} {strategistResult.analysis_meta.inferred_style}
              </Badge>
            )}
            {strategistResult.analysis_meta.inferred_page_count && (
              <Badge variant="outline">
                {t("detail.strategist.pages")} {strategistResult.analysis_meta.inferred_page_count}
              </Badge>
            )}
            {strategistResult.analysis_meta.industry && (
              <Badge variant="outline">
                {t("detail.strategist.industry")} {strategistResult.analysis_meta.industry}
              </Badge>
            )}
            {strategistResult.analysis_meta.language && (
              <Badge variant="outline">
                {t("detail.strategist.language")} {strategistResult.analysis_meta.language}
              </Badge>
            )}
          </div>
        )}

        <Tabs defaultValue="confirmations" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="confirmations">{t("detail.strategist.confirmations")}</TabsTrigger>
            <TabsTrigger value="page-structure">{t("detail.strategist.pageStructure")}</TabsTrigger>
            <TabsTrigger value="design-spec">Design Spec</TabsTrigger>
            <TabsTrigger value="spec-lock">Spec Lock</TabsTrigger>
          </TabsList>

          <TabsContent value="confirmations" className="flex-1 overflow-hidden">
            <Textarea
              value={editConfirmations}
              onChange={(e) => onEditConfirmations(e.target.value)}
              className="h-[400px] font-mono text-xs resize-none"
              placeholder={`${t("detail.strategist.confirmations")}...`}
            />
          </TabsContent>

          <TabsContent value="page-structure" className="flex-1 overflow-hidden">
            <Textarea
              value={editPageStructure}
              onChange={(e) => onEditPageStructure(e.target.value)}
              className="h-[400px] font-mono text-xs resize-none"
              placeholder={`${t("detail.strategist.pageStructure")}...`}
            />
          </TabsContent>

          <TabsContent value="design-spec" className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto rounded-md bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
              {strategistResult?.design_spec || t("detail.strategist.noContent")}
            </div>
          </TabsContent>

          <TabsContent value="spec-lock" className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto rounded-md bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
              {strategistResult?.spec_lock || t("detail.strategist.noContent")}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("detail.strategist.cancel")}
          </Button>
          <Button onClick={onConfirmAndGenerate}>
            <Play className="size-4 mr-2" /> {t("detail.strategist.confirmAndGenerate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
