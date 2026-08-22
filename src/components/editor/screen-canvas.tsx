"use client";

import { useEffect, useRef, useState } from "react";
import type { OutputSize } from "@/lib/devices";
import type { Screen } from "@/lib/editor-model";
import { drawScreen, loadImage } from "@/lib/render";

/**
 * Renders a single screen with the shared canvas renderer, so the preview is
 * byte-for-byte what the export produces (just scaled down).
 */
export function ScreenCanvas({
  screen,
  output,
  displayWidth,
  className,
}: {
  screen: Screen;
  output: OutputSize;
  displayWidth: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [, force] = useState(0);
  const cache = useRef(new Map<string, HTMLImageElement>());

  useEffect(() => {
    let cancelled = false;
    const srcs = [screen.background.image, screen.device.screenshot].filter(
      Boolean,
    ) as string[];
    const missing = srcs.filter((s) => !cache.current.has(s));

    const paint = () => {
      const canvas = ref.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = output.width;
      canvas.height = output.height;
      void drawScreen(ctx, screen, output, cache.current);
    };

    if (missing.length) {
      Promise.all(
        missing.map((s) =>
          loadImage(s)
            .then((img) => cache.current.set(s, img))
            .catch(() => undefined),
        ),
      ).then(() => {
        if (!cancelled) {
          force((n) => n + 1);
          paint();
        }
      });
    }
    paint();
    return () => {
      cancelled = true;
    };
  }, [screen, output]);

  const displayHeight = (displayWidth * output.height) / output.width;

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: displayWidth, height: displayHeight }}
    />
  );
}
