"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type ApiElement, type ApiProject, type ApiScreen } from "@/lib/api";
import { OUTPUT_BY_ID, OUTPUT_SIZES, type OutputSize } from "@/lib/devices";
import { drawLayeredScreen } from "@/lib/render-layers";
import { loadImage } from "@/lib/render";
import { hitTest, elementKey, type ElementRef } from "@/lib/hit-test";
import { createZip, type ZipEntry } from "@/lib/zip";
import { screenAssetUrls } from "@/lib/assets";
import { ensureFonts, screenFonts } from "@/lib/fonts";
import { frameUrl, warmFrame } from "@/lib/frames";
import { LayeredCanvas } from "./layered-canvas";
import { OutputSizeMenu } from "./output-size-menu";
import { OutputSizesDialog } from "./output-sizes-dialog";
import { GlobalsDialog } from "./globals-dialog";
import { SceneEditPanel } from "./scene-edit-panel";
import { SceneToolbar } from "./scene-toolbar";
import { SmallScreenNotice } from "./small-screen-notice";
import {
  CheckIcon,
  EditIcon,
  KeyboardIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./editor-icons";

/** Editor for projects copied from a template. */
export function LayeredEditor({
  initial,
  onExit,
}: {
  initial: ApiProject;
  onExit: () => void;
}) {
  const [project, setProject] = useState<ApiProject>(initial);
  const [selected, setSelected] = useState<number | null>(0);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hover, setHover] = useState<{ screen: number; ref: ElementRef } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [status, setStatus] = useState<string | null>(null);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [showGlobals, setShowGlobals] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const dirty = useRef(false);

  const output: OutputSize =
    OUTPUT_BY_ID.get(project.activeOutput) ??
    OUTPUT_SIZES.find((o) => project.outputs.includes(o.id)) ??
    OUTPUT_SIZES[0];

  /* debounce autosave to the API */
  useEffect(() => {
    if (!dirty.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await api.saveProject(project.projectId, {
          name: project.name,
          outputs: project.outputs,
          activeOutput: project.activeOutput,
          background: project.background,
          primaryColor: project.primaryColor,
          titleFont: project.titleFont,
          subtitleFont: project.subtitleFont,
          screens: project.screens,
        });
        setStatus("Saved");
        window.setTimeout(() => setStatus(null), 1200);
      } catch {
        setStatus("Offline — changes kept in this tab");
      }
    }, 900);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [project]);

  const flash = useCallback((msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  }, []);

  const mutate = useCallback((fn: (p: ApiProject) => ApiProject) => {
    dirty.current = true;
    setProject(fn);
  }, []);

  const patchScreen = useCallback(
    (index: number, fn: (s: ApiScreen) => ApiScreen) =>
      mutate((p) => ({
        ...p,
        screens: p.screens.map((s, i) => (i === index ? fn(s) : s)),
      })),
    [mutate],
  );

  const patchElement = useCallback(
    (
      screenIndex: number,
      groupIndex: number,
      elementIndex: number,
      fn: (el: ApiElement) => ApiElement,
    ) =>
      patchScreen(screenIndex, (s) => ({
        ...s,
        groups: s.groups.map((g, gi) =>
          gi === groupIndex
            ? g.map((el, ei) => (ei === elementIndex ? fn(el) : el))
            : g,
        ),
      })),
    [patchScreen],
  );

  const removeScreen = (index: number) =>
    mutate((p) => ({ ...p, screens: p.screens.filter((_, i) => i !== index) }));

  const duplicateScreen = (index: number) =>
    mutate((p) => {
      const copy = structuredClone(p.screens[index]);
      const screens = [...p.screens];
      screens.splice(index + 1, 0, copy);
      return { ...p, screens: screens.map((s, i) => ({ ...s, order: i })) };
    });

  /** Renders every screen at every selected size and downloads one .zip. */
  const exportAll = async (everySize: boolean) => {
    const sizes = everySize
      ? project.outputs
          .map((id) => OUTPUT_BY_ID.get(id))
          .filter((o): o is OutputSize => Boolean(o))
      : [output];
    if (!project.screens.length) {
      flash("Add a screenshot first");
      return;
    }

    const total = sizes.length * project.screens.length;
    let done = 0;
    setStatus(`Rendering 0 / ${total}…`);

    const cache = new Map<string, HTMLImageElement>();
    const entries: ZipEntry[] = [];

    for (const size of sizes) {
      for (let i = 0; i < project.screens.length; i += 1) {
        const screen = project.screens[i];
        await ensureFonts(
          screenFonts(screen, project.titleFont, project.subtitleFont),
        );
        for (const group of screen.groups) {
          for (const el of group) {
            if (el.type !== "device") continue;
            const variant = el.device?.variant ?? "full";
            if (variant === "none" || variant === "dynamic") continue;
            await warmFrame(frameUrl(size.id, variant, el.device?.colour ?? "black"));
          }
        }
        for (const src of screenAssetUrls(screen)) {
          if (!cache.has(src)) {
            try {
              cache.set(src, await loadImage(src));
            } catch {
              /* a missing asset falls back to the placeholder shape */
            }
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await drawLayeredScreen(ctx, screen, project, size, cache);

        const blob: Blob | null = await new Promise((r) =>
          canvas.toBlob(r, "image/png"),
        );
        if (blob) {
          entries.push({
            name: `${size.id}/${String(i + 1).padStart(2, "0")}.png`,
            data: new Uint8Array(await blob.arrayBuffer()),
          });
        }

        done += 1;
        setStatus(`Rendering ${done} / ${total}…`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setStatus("Packaging zip…");
    const zip = createZip(entries);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zip);
    a.download = `${slug(project.name)}-screenshots.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    setStatus(`Exported ${entries.length} screenshots as a zip`);
    window.setTimeout(() => setStatus(null), 2800);
  };

  const previewWidth = Math.round((350 * zoom) / 100);
  const previewHeight = Math.round((previewWidth * output.height) / output.width);
  return (
    <>
      <SmallScreenNotice />
      <div className="hidden min-h-[calc(100vh-64px)] flex-col bg-white md:flex">
        <SceneToolbar
          projectName={project.name}
          outputLabel={output.label}
          language={project.language}
          canUndo={false}
          onBack={onExit}
          onSave={() => flash("Project saved")}
          onUndo={() => undefined}
          onClear={() => mutate((p) => ({ ...p, screens: [] }))}
          onRestyle={() => flash("Restyle is not available in this build")}
          onOpenSizes={() => setShowSizes(true)}
          onOpenGlobals={() => setShowGlobals(true)}
          onOpenBackground={() => setSelected(0)}
          onOpenLocalize={() => flash(`Language: ${project.language}`)}
          onOpenScreens={() => setSelected(0)}
          onToggleSizeMenu={() => setShowSizeMenu((v) => !v)}
          sizeMenuOpen={showSizeMenu}
          onExport={() => exportAll(false)}
          onRefresh={() => flash("Re-rendered")}
        >
          {showSizeMenu && (
            <OutputSizeMenu
              outputs={project.outputs}
              activeOutput={project.activeOutput}
              onSelect={(id) => {
                mutate((p) => ({ ...p, activeOutput: id }));
                setShowSizeMenu(false);
              }}
              onAddMore={() => {
                setShowSizeMenu(false);
                setShowSizes(true);
              }}
              onDismiss={() => setShowSizeMenu(false)}
            />
          )}
        </SceneToolbar>

        {status && (
          <div
            role="status"
            className="pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-black/20 backdrop-blur-sm ring-1 ring-white/10"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {status}
          </div>
        )}

        <div className="screenshots min-h-0 flex-1">
          {project.screens.map((screen, i) => {
            const active = selected === i;
            return (
              <div key={i} className="screenshot group flex">
                <div
                  className="relative"
                  style={{ width: previewWidth }}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const found = hitTest(
                      screen,
                      (e.clientX - r.left) / r.width,
                      (e.clientY - r.top) / r.height,
                    );
                    setHover(found ? { screen: i, ref: found } : null);
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const found = hitTest(
                      screen,
                      (e.clientX - r.left) / r.width,
                      (e.clientY - r.top) / r.height,
                    );
                    setSelected(i);
                    setOpenKey(found ? elementKey(found.g, found.i) : "bg");
                  }}
                >
                  <LayeredCanvas
                    screen={screen}
                    project={project}
                    output={output}
                    displayWidth={previewWidth}
                    className="block"
                  />
                  {hover?.screen === i && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute border border-dashed border-zinc-700/80"
                      style={{
                        left: `${hover.ref.el.loc.x * 100}%`,
                        top: `${hover.ref.el.loc.y * 100}%`,
                        width: `${hover.ref.el.loc.w * 100}%`,
                        height: `${hover.ref.el.loc.h * 100}%`,
                      }}
                    />
                  )}
                  {active && openKey && openKey !== "bg" && openKey !== "layers" && (() => {
                    const [g, ei] = openKey.split("-").map(Number);
                    const el = screen.groups[g]?.[ei];
                    if (!el) return null;
                    return (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute border border-dashed border-indigo-600"
                        style={{
                          left: `${el.loc.x * 100}%`,
                          top: `${el.loc.y * 100}%`,
                          width: `${el.loc.w * 100}%`,
                          height: `${el.loc.h * 100}%`,
                        }}
                      />
                    );
                  })()}
                  <button
                    type="button"
                    aria-label={
                      active ? `Close editor for screenshot ${i + 1}` : `Edit screenshot ${i + 1}`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(active ? null : i);
                      if (!active) setOpenKey(null);
                    }}
                    style={{ position: "absolute", top: 10, right: 10 }}
                    className={`fab btn transition-opacity ${
                      active
                        ? "bg-indigo-300 text-indigo-700 opacity-100"
                        : "btn-secondary opacity-0 group-hover:opacity-100 focus:opacity-100"
                    }`}
                  >
                    {active ? (
                      <CheckIcon className="h-6 w-6" />
                    ) : (
                      <EditIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>

                {active && (
                  <SceneEditPanel
                    height={previewHeight}
                    openKey={openKey}
                    onOpenKeyChange={setOpenKey}
                    screen={screen}
                    project={project}
                    onClose={() => setSelected(null)}
                    onDuplicate={() => duplicateScreen(i)}
                    onDelete={() => removeScreen(i)}
                    onExportOne={() => exportAll(false)}
                    patchScreen={(fn) => patchScreen(i, fn)}
                    patchElement={(g, ei, fn) => patchElement(i, g, ei, fn)}
                    patchProject={mutate}
                  />
                )}
              </div>
            );
          })}
          <div className="screenshot w-1 shrink-0" />
        </div>

        <div className="scene-floating-toolbar">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(40, z - 20))}
            className="scene-floating-toolbar-button"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={() => setZoom(100)}
            className="scene-floating-toolbar-button"
          >
            {zoom}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(200, z + 20))}
            className="scene-floating-toolbar-button"
          >
            <ZoomInIcon className="h-4 w-4" />
          </button>
          <span className="scene-floating-toolbar-divider" />
          <button
            type="button"
            aria-label="Keyboard shortcuts"
            className="scene-floating-toolbar-button"
          >
            <KeyboardIcon className="h-4 w-4" />
          </button>
        </div>

        {showGlobals && (
          <GlobalsDialog
            project={project}
            onClose={() => setShowGlobals(false)}
            onChange={(part) => mutate((p) => ({ ...p, ...part }))}
          />
        )}

        {showSizes && (
          <OutputSizesDialog
            selected={project.outputs}
            onClose={() => setShowSizes(false)}
            onSave={(ids) =>
              mutate((p) => ({
                ...p,
                outputs: ids,
                activeOutput: ids.includes(p.activeOutput)
                  ? p.activeOutput
                  : ids[0],
              }))
            }
          />
        )}
      </div>
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
