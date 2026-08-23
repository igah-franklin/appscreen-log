"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiProject, ApiScreen } from "@/lib/api";
import type { OutputSize } from "@/lib/devices";
import { drawLayeredScreen } from "@/lib/render-layers";
import { loadImage } from "@/lib/render";
import { screenAssetUrls } from "@/lib/assets";
import { ensureFonts, screenFonts } from "@/lib/fonts";
import { frameUrl, warmFrame } from "@/lib/frames";

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

  /*
   * Every edit produces a new project object, but only the screen that changed
   * needs repainting — and a repaint is a full-resolution draw (1320×2868 and
   * up), so redrawing all of them on each keystroke is what makes typing feel
   * heavy. The effect therefore keys off this screen plus the project-wide
   * styling that actually reaches the canvas, and reads the live project
   * through a ref.
   */
  const live = useRef(project);
  useEffect(() => {
    live.current = project;
  }, [project]);

  const projectKey = [
    project.background,
    project.primaryColor,
    project.titleFont,
    project.subtitleFont,
  ].join("|");

  useEffect(() => {
    let cancelled = false;

    const paint = () => {
      const canvas = ref.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = output.width;
      canvas.height = output.height;
      void drawLayeredScreen(ctx, screen, live.current, output, cache.current);
    };

    /* Paint what is already available, then repaint as fonts and art land. */
    paint();

    const fonts = ensureFonts(
      screenFonts(screen, project.titleFont, project.subtitleFont),
    ).then(() => {
      if (!cancelled) paint();
    });

    /* The photographic device frames this screen needs at this output size. */
    const frames = new Set<string>();
    for (const group of screen.groups) {
      for (const el of group) {
        if (el.type !== "device") continue;
        const variant = el.device?.variant ?? "full";
        if (variant === "none" || variant === "dynamic") continue;
        const url = frameUrl(output.id, variant, el.device?.colour ?? "black");
        if (url) frames.add(url);
      }
    }
    const frameWork = Promise.all([...frames].map(warmFrame)).then(() => {
      if (!cancelled) paint();
    });

    const missing = screenAssetUrls(screen).filter(
      (url) => !cache.current.has(url),
    );
    const art = missing.length
      ? Promise.all(
          missing.map((url) =>
            loadImage(url)
              .then((img) => cache.current.set(url, img))
              .catch(() => undefined),
          ),
        )
      : Promise.resolve();

    void Promise.all([fonts, art, frameWork]).then(() => {
      if (cancelled) return;
      force((n) => n + 1);
      paint();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, projectKey, output]);

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
