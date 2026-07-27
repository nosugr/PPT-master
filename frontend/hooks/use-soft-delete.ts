"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface SoftDeleteOptions<T> {
  onDelete: (item: T) => Promise<void>;
  onUndo?: () => void;
  delay?: number; // default 5000ms
  undoLabel?: string;
  successLabel?: string;
}

/**
 * Soft delete with undo — delays the actual delete API call and shows a toast with an Undo button.
 * If the user clicks Undo within the delay period, the deletion is cancelled.
 */
export function useSoftDelete<T>(options: SoftDeleteOptions<T>) {
  const { onDelete, onUndo, delay = 5000, undoLabel = "Undo", successLabel = "Deleted" } = options;
  const pendingRef = useRef<Map<string, { timer: ReturnType<typeof setTimeout>; cancelled: boolean }>>(new Map());

  const softDelete = useCallback(
    (item: T, key: string) => {
      // If there's already a pending delete for this key, skip
      if (pendingRef.current.has(key)) return;

      const entry = { timer: null as unknown as ReturnType<typeof setTimeout>, cancelled: false };
      pendingRef.current.set(key, entry);

      entry.timer = setTimeout(async () => {
        if (entry.cancelled) {
          pendingRef.current.delete(key);
          return;
        }
        try {
          await onDelete(item);
        } catch {
          // If delete fails, trigger undo to restore UI
          onUndo?.();
        }
        pendingRef.current.delete(key);
      }, delay);

      toast(successLabel, {
        action: {
          label: undoLabel,
          onClick: () => {
            entry.cancelled = true;
            clearTimeout(entry.timer);
            pendingRef.current.delete(key);
            onUndo?.();
          },
        },
        duration: delay,
      });
    },
    [onDelete, onUndo, delay, undoLabel, successLabel],
  );

  const cancelAll = useCallback(() => {
    for (const [key, entry] of pendingRef.current) {
      entry.cancelled = true;
      clearTimeout(entry.timer);
    }
    pendingRef.current.clear();
  }, []);

  return { softDelete, cancelAll };
}
