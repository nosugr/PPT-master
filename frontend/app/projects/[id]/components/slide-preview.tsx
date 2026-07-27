"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TranslationKeys } from "@/lib/i18n";

interface SlidePreviewProps {
  slides: { name: string; filename: string }[];
  slideRawSvgs: Record<string, string>;
  previewIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export function SlidePreview({
  slides,
  slideRawSvgs,
  previewIndex,
  onClose,
  onNavigate,
  t,
}: SlidePreviewProps) {
  const navigateSlide = useCallback(
    (direction: -1 | 1) => {
      if (previewIndex === null) return;
      const next = previewIndex + direction;
      if (next >= 0 && next < slides.length) onNavigate(next);
    },
    [previewIndex, slides.length, onNavigate],
  );

  useEffect(() => {
    if (previewIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateSlide(-1);
      else if (e.key === "ArrowRight") navigateSlide(1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previewIndex, navigateSlide, onClose]);

  if (previewIndex === null || !slides[previewIndex] || !slideRawSvgs[slides[previewIndex].name]) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="w-[75vw] h-[75vh] bg-white dark:bg-neutral-900 rounded-lg overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {previewIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-neutral-800/80 hover:bg-white"
            onClick={() => navigateSlide(-1)}
          >
            <ChevronLeft className="size-6" />
          </Button>
        )}
        {previewIndex < slides.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-neutral-800/80 hover:bg-white"
            onClick={() => navigateSlide(1)}
          >
            <ChevronRight className="size-6" />
          </Button>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {slides[previewIndex].name}
              <span className="text-muted-foreground ml-2 text-xs">
                {previewIndex + 1} / {slides.length}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("templateDetail.close")}
            </Button>
          </div>
          <div
            className="[&>svg]:w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: slideRawSvgs[slides[previewIndex].name] }}
          />
        </div>
      </div>
    </div>
  );
}
