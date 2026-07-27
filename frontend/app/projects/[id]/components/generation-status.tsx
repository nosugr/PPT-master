"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import type { GenerationStatus } from "@/lib/api";
import type { TranslationKeys } from "@/lib/i18n";

interface GenerationProgressProps {
  genStatus: GenerationStatus | null;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export function GenerationProgress({ genStatus, t }: GenerationProgressProps) {
  if (genStatus?.status !== "running") return null;

  return (
    <Card className="mb-4 border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {t("detail.generationInProgress")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {genStatus?.message || t("detail.generationStarting")}
        </p>
        {genStatus?.total_pages != null && genStatus.total_pages > 0 && (
          <>
            <Progress
              value={((genStatus.current_page || 0) / genStatus.total_pages) * 100}
              className="mb-1"
            />
            <p className="text-xs text-muted-foreground">
              {genStatus.current_page || 0} / {genStatus.total_pages} {t("detail.pages")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface PostProcessProgressProps {
  postProcess: {
    running: boolean;
    stepIndex: number;
    stepKey: TranslationKeys | null;
    failed?: boolean;
    failedError?: string;
  } | null;
  totalSteps: number;
  onRetry: (fromIndex: number) => void;
  onDismiss: () => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export function PostProcessProgress({
  postProcess,
  totalSteps,
  onRetry,
  onDismiss,
  t,
}: PostProcessProgressProps) {
  if (!postProcess) return null;

  if (postProcess.failed) {
    return (
      <Card className="mb-4 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            {t("detail.stepFailed", { step: postProcess.stepKey ? t(postProcess.stepKey) : "" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {postProcess.failedError && (
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded p-2 break-all">
              {postProcess.failedError}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onRetry(postProcess.stepIndex)}>
              <RefreshCw className="size-3.5 mr-1.5" /> {t("detail.retryFromStep")}
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss}>
              {t("templateDetail.close")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!postProcess.running) return null;

  return (
    <Card className="mb-4 border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {t("detail.processAndExport")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress
          value={(postProcess.stepIndex / totalSteps) * 100}
          className="mb-2"
        />
        <p className="text-sm text-muted-foreground">
          {postProcess.stepKey ? t(postProcess.stepKey) : "..."}
          <span className="text-xs ml-2">
            ({postProcess.stepIndex + 1}/{totalSteps})
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
