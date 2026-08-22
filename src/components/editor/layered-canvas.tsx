"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiProject, ApiScreen } from "@/lib/api";
import type { OutputSize } from "@/lib/devices";
import { drawLayeredScreen } from "@/lib/render-layers";
import { loadImage } from "@/lib/render";

export function LayeredCanvas({
  screen,
  project,
  output,
  displayWidth,
  className,
}: {
  screen: ApiScreen;
  project: ApiProject;
  output: OutputSize;
  displayWidth: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<string, HTMLImageElement>());
  const [, force] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const srcs: string[] = [];
    for (const group of screen.groups)
      for (const el of group)
        if (el.device?.screenshot) srcs.push(el.device.screenshot);

    const paint = () => {
      const canvas = ref.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = output.width;
      canvas.height = output.height;
      void drawLayeredScreen(ctx, screen, project, output, cache.current);
    };

    const missing = srcs.filter((s) => !cache.current.has(s));
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
    void document.fonts.ready.then(() => !cancelled && paint());
    paint();
    return () => {
      cancelled = true;
    };
  }, [screen, project, output]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        width: displayWidth,
        height: (displayWidth * output.height) / output.width,
      }}
    />
  );
}
