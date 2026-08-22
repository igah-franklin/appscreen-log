"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DEFAULT_OUTPUTS,
  OUTPUT_BY_ID,
  OUTPUT_SIZES,
  type OutputSize,
} from "@/lib/devices";
import {
  createProject,
  createScreen,
  newId,
  type LayoutKind,
  type Project,
  type Screen,
} from "@/lib/editor-model";
import { drawScreen, loadImage } from "@/lib/render";
import { TEMPLATES } from "@/data/templates";
import { api, type ApiProject } from "@/lib/api";
import { LayeredEditor } from "./layered-editor";
import { previewUrl } from "@/lib/images";
import { ScreenCanvas } from "./screen-canvas";
import { ScreenPanels } from "./panels";

const STORAGE_KEY = "appscreens.sandbox.project";

const THEME_PRESETS: Record<string, [string, string]> = {
  light: ["#f4f2ff", "#dcd6ff"],
  dark: ["#1b1b22", "#2f2b4a"],
  colourful: ["#7c5cff", "#4c2fd6"],
};

function ToolbarButton({
  label,
  onClick,
  tone = "secondary",
  children,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  tone?: "primary" | "secondary" | "light" | "danger" | "success";
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const tones = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    light: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
    success: "bg-green-100 text-green-700 hover:bg-green-200",
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function Editor() {
  const params = useSearchParams();
  const templateId = params.get("template");
  const projectId = params.get("project");

  /* Projects copied from a template live on the API and use the layer editor. */
  const [apiProject, setApiProject] = useState<ApiProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(Boolean(projectId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    api
      .getProject(projectId)
      .then((p) => {
        if (!cancelled) setApiProject(p);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingProject(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const [project, setProject] = useState<Project | null>(() =>
    loadInitialProject(templateId),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showCreate, setShowCreate] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const history = useRef<Project[]>([]);
  const [undoDepth, setUndoDepth] = useState(0);

  /* ---- persistence --------------------------------------------------- */
  useEffect(() => {
    if (!project) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* quota – editing still works in-memory */
    }
  }, [project]);

  /* Drop ?template= once seeded so a reload restores edits instead of the template. */
  useEffect(() => {
    if (project && templateId) {
      window.history.replaceState(null, "", "/user/sandbox");
    }
  }, [project, templateId]);

  const output: OutputSize =
    (project && OUTPUT_BY_ID.get(project.activeOutput)) || OUTPUT_SIZES[0];

  const update = useCallback(
    (fn: (p: Project) => Project, snapshot = true) => {
      setProject((prev) => {
        if (!prev) return prev;
        if (snapshot) {
          history.current.push(prev);
          if (history.current.length > 50) history.current.shift();
          setUndoDepth(history.current.length);
        }
        return fn(prev);
      });
    },
    [],
  );

  const patchScreen = useCallback(
    (id: string, fn: (s: Screen) => Screen) => {
      update(
        (p) => ({
          ...p,
          screens: p.screens.map((s) => (s.id === id ? fn(s) : s)),
        }),
        false,
      );
    },
    [update],
  );

  const selectedScreen = useMemo(
    () => project?.screens.find((s) => s.id === selected) ?? null,
    [project, selected],
  );

  /* ---- actions -------------------------------------------------------- */
  const addScreen = (layout: LayoutKind) => {
    const screen = createScreen(layout);
    const base = project?.screens[project.screens.length - 1];
    if (base) {
      screen.background = { ...base.background };
      screen.title = { ...base.title, text: "New headline" };
      screen.device = { ...base.device, screenshot: undefined };
    }
    update((p) => ({ ...p, screens: [...p.screens, screen] }));
    setSelected(screen.id);
    setShowLayouts(false);
  };

  const duplicateScreen = (id: string) => {
    update((p) => {
      const i = p.screens.findIndex((s) => s.id === id);
      if (i < 0) return p;
      const copy: Screen = {
        ...structuredClone(p.screens[i]),
        id: newId(),
      };
      const screens = [...p.screens];
      screens.splice(i + 1, 0, copy);
      return { ...p, screens };
    });
  };

  const deleteScreen = (id: string) => {
    update((p) => ({ ...p, screens: p.screens.filter((s) => s.id !== id) }));
    setSelected(null);
  };

  const moveScreen = (id: string, dir: -1 | 1) => {
    update((p) => {
      const i = p.screens.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.screens.length) return p;
      const screens = [...p.screens];
      [screens[i], screens[j]] = [screens[j], screens[i]];
      return { ...p, screens };
    });
  };

  const undo = () => {
    const prev = history.current.pop();
    setUndoDepth(history.current.length);
    if (prev) setProject(prev);
  };

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const exportScreens = async (all: boolean) => {
    if (!project) return;
    const targets = all
      ? project.outputs
          .map((id) => OUTPUT_BY_ID.get(id))
          .filter(Boolean as unknown as (o?: OutputSize) => o is OutputSize)
      : [output];
    const screens = selectedScreen && !all ? [selectedScreen] : project.screens;
    if (!screens.length) {
      flash("Add a screenshot first");
      return;
    }
    const total = targets.length * screens.length;
    let done = 0;
    setStatus(`Rendering 0 / ${total}…`);
    const cache = new Map<string, HTMLImageElement>();
    for (const size of targets) {
      for (let i = 0; i < screens.length; i += 1) {
        const screen = screens[i];
        for (const src of [screen.background.image, screen.device.screenshot]) {
          if (src && !cache.has(src)) {
            try {
              cache.set(src, await loadImage(src));
            } catch {
              /* skip unloadable image */
            }
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await drawScreen(ctx, screen, size, cache);
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, "image/png"),
        );
        if (!blob) continue;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${slugify(project.name)}-${size.id}-${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
        done += 1;
        setStatus(`Rendering ${done} / ${total}…`);
        // yield so the progress line repaints between large PNGs
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    flash(
      `Exported ${screens.length * targets.length} PNG${
        screens.length * targets.length === 1 ? "" : "s"
      }`,
    );
  };

  if (projectId) {
    if (loadingProject)
      return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white text-sm text-gray-500">
          Opening project…
        </div>
      );
    if (apiProject)
      return (
        <LayeredEditor
          initial={apiProject}
          onExit={() => {
            window.history.replaceState(null, "", "/user/sandbox");
            setApiProject(null);
          }}
        />
      );
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-gray-900">
            Could not open that project.
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            {loadError ?? "It may have expired."} Make sure the API is running
            on port 4000.
          </p>
          <Link
            href="/templates"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  /* ---- empty state ---------------------------------------------------- */
  if (!project) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-white px-6">
        <div className="max-w-lg text-center">
          <svg
            viewBox="0 0 512 512"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="currentColor"
          >
            <path d="M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2l192 0c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312c0 22.1 17.9 40 40 40l144 0c22.1 0 40-17.9 40-40l0-144c0-22.1-17.9-40-40-40l-144 0c-22.1 0-40 17.9-40 40l0 144zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z" />
          </svg>
          <p className="mt-6 text-sm font-semibold text-gray-900">
            Get started by creating a new temporary project.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-gray-500">
            Copy a template or start blank for App Store and Google Play
            screenshots.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <span aria-hidden="true">+</span> New sandbox project
            </button>
          </div>
        </div>

        {showCreate && (
          <CreateDialog
            onClose={() => setShowCreate(false)}
            onBlank={() => {
              const p = createProject();
              p.screens = [createScreen("text-above")];
              setProject(p);
              setSelected(p.screens[0].id);
              setShowCreate(false);
            }}
          />
        )}
      </div>
    );
  }

  const previewWidth = Math.round((260 * zoom) / 100);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white pb-10">
      {/* toolbar */}
      <nav className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white p-2">
        <Link
          href="/templates"
          title="Back to templates"
          aria-label="Back to templates"
          className="flex h-9 w-9 items-center justify-center rounded-md text-indigo-600 hover:bg-indigo-50"
        >
          ←
        </Link>
        <ToolbarButton
          label="Save project"
          tone="primary"
          onClick={() => flash("Project saved locally")}
        >
          💾
        </ToolbarButton>
        <ToolbarButton
          label="Undo last change"
          tone="light"
          onClick={undo}
          disabled={undoDepth === 0}
        >
          ↺
        </ToolbarButton>
        <ToolbarButton
          label="Clear all screenshots"
          tone="danger"
          onClick={() => update((p) => ({ ...p, screens: [] }))}
        >
          ⌫
        </ToolbarButton>
        <ToolbarButton
          label="Add screenshot"
          tone="success"
          onClick={() => setShowLayouts(true)}
        >
          ✚
        </ToolbarButton>

        <span className="mx-1 h-6 w-px bg-gray-200" />

        <ToolbarButton label="Output sizes" onClick={() => setShowSizes(true)}>
          ⚙
        </ToolbarButton>
        <ToolbarButton label="Language" onClick={() => flash(project.language)}>
          🌐
        </ToolbarButton>

        <span className="flex-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSizeMenu((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={showSizeMenu}
            className="flex h-9 items-center gap-2 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {output.label}
            <span aria-hidden="true">▾</span>
          </button>
          {showSizeMenu && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-md bg-white py-1 shadow-lg ring-1 ring-black/10"
            >
              {project.outputs.map((id) => {
                const o = OUTPUT_BY_ID.get(id);
                if (!o) return null;
                return (
                  <button
                    key={id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      update((p) => ({ ...p, activeOutput: id }), false);
                      setShowSizeMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      id === project.activeOutput
                        ? "bg-indigo-50 font-semibold text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {o.label}
                    <span className="ml-2 text-xs text-gray-400">
                      {o.width}×{o.height}
                    </span>
                  </button>
                );
              })}
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setShowSizeMenu(false);
                  setShowSizes(true);
                }}
                className="block w-full border-t border-gray-100 px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50"
              >
                Add more sizes
              </button>
            </div>
          )}
        </div>
        <ToolbarButton
          label="Export current size"
          tone="primary"
          onClick={() => exportScreens(false)}
        >
          ⤓
        </ToolbarButton>
        <ToolbarButton
          label="Export every output size"
          onClick={() => exportScreens(true)}
        >
          ⇩⇩
        </ToolbarButton>
      </nav>

      {status && (
        <div
          role="status"
          className="border-b border-indigo-100 bg-indigo-50 px-4 py-1.5 text-center text-xs font-medium text-indigo-700"
        >
          {status}
        </div>
      )}

      <div className="flex">
        {/* canvas */}
        <div className="min-w-0 flex-1 overflow-x-auto bg-gray-50 p-4">
          <div className="flex items-start gap-4">
            {project.screens.map((screen, i) => {
              const active = screen.id === selected;
              return (
                <div key={screen.id} className="shrink-0">
                  <div
                    className={`group relative rounded-md ${
                      active
                        ? "outline outline-2 outline-indigo-500"
                        : "outline outline-2 outline-dashed outline-gray-300 hover:outline-gray-400"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Edit screenshot ${i + 1}`}
                      onClick={() => setSelected(active ? null : screen.id)}
                      className="block"
                    >
                      <ScreenCanvas
                        screen={screen}
                        output={output}
                        displayWidth={previewWidth}
                        className="block rounded-md"
                      />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="mr-1 text-xs text-gray-400">{i + 1}</span>
                    <IconPill
                      compact
                      label={`Move screenshot ${i + 1} left`}
                      onClick={() => moveScreen(screen.id, -1)}
                    >
                      ‹
                    </IconPill>
                    <IconPill
                      compact
                      label={`Move screenshot ${i + 1} right`}
                      onClick={() => moveScreen(screen.id, 1)}
                    >
                      ›
                    </IconPill>
                    <IconPill
                      compact
                      label={`Duplicate screenshot ${i + 1}`}
                      onClick={() => duplicateScreen(screen.id)}
                    >
                      ⧉
                    </IconPill>
                    <IconPill
                      compact
                      label={`Delete screenshot ${i + 1}`}
                      onClick={() => deleteScreen(screen.id)}
                    >
                      ✕
                    </IconPill>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setShowLayouts(true)}
              aria-label="Add screenshot"
              style={{
                width: previewWidth,
                height: (previewWidth * output.height) / output.width,
              }}
              className="flex shrink-0 items-center justify-center rounded-md outline outline-2 outline-dashed outline-gray-300 hover:outline-gray-400"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-2xl text-indigo-600">
                +
              </span>
            </button>
          </div>
        </div>

        {/* edit panel */}
        {selectedScreen && (
          <aside className="w-[320px] shrink-0 border-l border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-9 flex-1 items-center justify-center rounded-md bg-green-100 text-sm font-semibold text-green-700 hover:bg-green-200"
              >
                ✓ Done
              </button>
              <IconPill
                label="Duplicate screenshot"
                onClick={() => duplicateScreen(selectedScreen.id)}
              >
                ⧉
              </IconPill>
              <IconPill
                label="Export this screenshot"
                onClick={() => exportScreens(false)}
              >
                ⤓
              </IconPill>
              <IconPill
                label="Delete screenshot"
                onClick={() => deleteScreen(selectedScreen.id)}
              >
                🗑
              </IconPill>
            </div>
            <ScreenPanels
              screen={selectedScreen}
              patch={(fn) => patchScreen(selectedScreen.id, fn)}
            />
          </aside>
        )}
      </div>

      {/* zoom */}
      <div className="fixed bottom-5 left-5 flex items-center gap-2 rounded-full bg-gray-900 px-3 py-2 text-white shadow-lg">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(40, z - 20))}
          className="h-6 w-6 rounded hover:bg-white/10"
        >
          −
        </button>
        <span className="w-12 text-center text-xs">{zoom}%</span>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(200, z + 20))}
          className="h-6 w-6 rounded hover:bg-white/10"
        >
          +
        </button>
      </div>

      {showLayouts && (
        <LayoutDialog
          onClose={() => setShowLayouts(false)}
          onPick={addScreen}
        />
      )}
      {showSizes && (
        <SizesDialog
          selected={project.outputs}
          onClose={() => setShowSizes(false)}
          onSave={(ids) =>
            update((p) => ({
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
  );
}

function IconPill({
  label,
  onClick,
  compact,
  children,
}: {
  label: string;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-white hover:text-gray-900 ${
        compact ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
      }`}
    >
      {children}
    </button>
  );
}

function Dialog({
  title,
  onClose,
  children,
  width = "max-w-xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="m-0 text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

function CreateDialog({
  onClose,
  onBlank,
}: {
  onClose: () => void;
  onBlank: () => void;
}) {
  return (
    <Dialog title="New sandbox project" onClose={onClose} width="max-w-lg">
      <ul className="divide-y divide-gray-100">
        <li>
          <Link
            href="/templates"
            className="group flex cursor-pointer select-none rounded-xl p-3 hover:bg-gray-100"
          >
            <span className="flex h-12 w-12 flex-none items-center justify-center self-center rounded-lg bg-blue-500 text-white ring-4 ring-white">
              ▦
            </span>
            <span className="ml-4 flex-auto">
              <span className="block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Copy a Template
              </span>
              <span className="block text-sm text-gray-500">
                Find and copy a template for App Store success.
              </span>
            </span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={onBlank}
            className="group flex w-full cursor-pointer select-none rounded-xl p-3 text-left hover:bg-gray-100"
          >
            <span className="flex h-12 w-12 flex-none items-center justify-center self-center rounded-lg bg-indigo-500 text-white ring-4 ring-white">
              ✎
            </span>
            <span className="ml-4 flex-auto">
              <span className="block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Blank Project
              </span>
              <span className="block text-sm text-gray-500">
                Start from an empty project and build everything yourself.
              </span>
            </span>
          </button>
        </li>
      </ul>
    </Dialog>
  );
}

function LayoutDialog({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (l: LayoutKind) => void;
}) {
  const previews: { id: LayoutKind; label: string }[] = [
    { id: "blank", label: "Blank" },
    { id: "device-only", label: "Device only" },
    { id: "text-below", label: "Text below device" },
    { id: "text-above", label: "Text above device" },
  ];
  return (
    <Dialog title="Layout selector" onClose={onClose} width="max-w-2xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {previews.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p.id)}
            className="rounded-lg border border-gray-200 p-3 text-left hover:border-indigo-400 hover:shadow"
          >
            <div className="flex h-40 flex-col items-center justify-center gap-1 rounded bg-gray-50">
              {(p.id === "text-above" || p.id === "text-below") &&
              p.id === "text-above" ? (
                <>
                  <span className="h-2 w-16 rounded bg-gray-400" />
                  <span className="mt-1 h-24 w-14 rounded-md border-2 border-gray-400" />
                </>
              ) : p.id === "text-below" ? (
                <>
                  <span className="h-24 w-14 rounded-md border-2 border-gray-400" />
                  <span className="mt-1 h-2 w-16 rounded bg-gray-400" />
                </>
              ) : p.id === "device-only" ? (
                <span className="h-28 w-16 rounded-md border-2 border-gray-400" />
              ) : (
                <span className="h-28 w-16 rounded-md border-2 border-dashed border-gray-300" />
              )}
            </div>
            <p className="mt-2 text-center text-xs font-medium text-gray-700">
              {p.label}
            </p>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function SizesDialog({
  selected,
  onClose,
  onSave,
}: {
  selected: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const [ids, setIds] = useState<string[]>(selected);
  const groups = ["Android", "Apple", "Custom"] as const;
  return (
    <Dialog title="Output Sizes" onClose={onClose}>
      <p className="mb-4 text-sm text-gray-500">
        Select the output sizes that you require for export.
      </p>
      {groups.map((g) => {
        const list = OUTPUT_SIZES.filter((o) => o.store === g);
        if (!list.length) return null;
        return (
          <div key={g} className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              {g}
            </p>
            <div className="space-y-1">
              {list.map((o) => (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={ids.includes(o.id)}
                    onChange={(e) =>
                      setIds((v) =>
                        e.target.checked
                          ? [...v, o.id]
                          : v.filter((x) => x !== o.id),
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                  />
                  <span className="flex-1 text-sm text-gray-800">{o.label}</span>
                  <span className="text-xs text-gray-400">
                    {o.width}×{o.height}px
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!ids.length}
          onClick={() => {
            onSave(ids);
            onClose();
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Update
        </button>
      </div>
    </Dialog>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Runs only in the browser: this component is mounted client-side only. */
function loadInitialProject(templateId: string | null): Project | null {
  if (typeof window === "undefined") return null;
  if (templateId) {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (t) return projectFromTemplate(t.id);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project;
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

export function projectFromTemplate(templateId: string): Project {
  const t = TEMPLATES.find((x) => x.id === templateId);
  const project = createProject({
    name: t ? `${t.name} copy` : "Sandbox project",
    templateId,
    templateName: t?.name,
  });
  if (!t) {
    project.screens = [createScreen("text-above")];
    return project;
  }

  const theme = t.theme[0] ?? "colourful";
  const [c1, c2] = THEME_PRESETS[theme] ?? THEME_PRESETS.colourful;
  const landscape =
    t.orientation.includes("landscape") && !t.orientation.includes("portrait");

  project.outputs = landscape
    ? ["google-feature-graphic", "ipad-13"]
    : [...DEFAULT_OUTPUTS];
  project.activeOutput = project.outputs[0];
  project.referenceShots = Array.from({ length: t.shots }, (_, i) =>
    previewUrl(t.project, i + 1, 480),
  );

  project.screens = Array.from({ length: t.shots }, (_, i) => {
    const s = createScreen(i % 2 === 0 ? "text-above" : "text-below");
    s.background = {
      style: "gradient",
      color: c1,
      color2: c2,
      angle: 160,
    };
    s.title = {
      ...s.title,
      text: `Headline ${i + 1}`,
      color: theme === "light" ? "#1b1b22" : "#ffffff",
    };
    return s;
  });
  return project;
}
