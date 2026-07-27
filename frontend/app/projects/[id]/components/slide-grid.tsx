"use client";

import { Image, MoreVertical, Copy, StickyNote, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TranslationKeys } from "@/lib/i18n";

interface SlideGridProps {
  slides: { name: string; filename: string }[];
  slideThumbnails: Record<string, string>;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
  onPreview: (index: number) => void;
  onCopy: (name: string) => void;
  onViewNotes: (name: string) => void;
  onDelete: (name: string) => void;
  hiddenSlides?: Set<string>;
}

export function SlideGrid({
  slides,
  slideThumbnails,
  t,
  onPreview,
  onCopy,
  onViewNotes,
  onDelete,
  hiddenSlides,
}: SlideGridProps) {
  const visibleSlides = hiddenSlides
    ? slides.filter((s) => !hiddenSlides.has(s.name))
    : slides;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Image className="size-4" /> {t("detail.slides", { count: visibleSlides.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleSlides.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("detail.noSlides")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visibleSlides.map((s) => {
              const idx = slides.indexOf(s);
              return (
                <div
                  key={s.name}
                  className="relative group border rounded-md p-2 hover:border-primary transition-colors"
                >
                  <div className="cursor-pointer" onClick={() => onPreview(idx)}>
                    {slideThumbnails[s.name] ? (
                      <div
                        className="aspect-video bg-muted rounded mb-1 overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: slideThumbnails[s.name] }}
                      />
                    ) : (
                      <div className="aspect-video bg-muted rounded mb-1 flex items-center justify-center text-xs text-muted-foreground">
                        {s.name}
                      </div>
                    )}
                    <p className="text-xs truncate text-muted-foreground">
                      {idx + 1}. {s.name}
                    </p>
                  </div>
                  {/* Slide context menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded bg-background/80 hover:bg-background border border-border/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onPreview(idx)}>
                        <Image className="size-3.5 mr-2" /> {t("slide.menu.preview")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopy(s.name)}>
                        <Copy className="size-3.5 mr-2" /> {t("slide.menu.copysvg")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewNotes(s.name)}>
                        <StickyNote className="size-3.5 mr-2" /> {t("slide.menu.viewNotes")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(s.name)}
                      >
                        <Trash2 className="size-3.5 mr-2" /> {t("slide.menu.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
