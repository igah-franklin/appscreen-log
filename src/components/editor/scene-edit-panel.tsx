"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiElement, ApiProject, ApiScreen } from "@/lib/api";
import {
  BackgroundSection,
  DeviceSection,
  ImageSection,
  ShapeSection,
  TitleSection,
} from "./panel-sections";
import {
  CheckIcon,
  ChevronIcon,
  ContrastIcon,
  CopyIcon,
  DownloadIcon,
  ImageIcon,
  LayersIcon,
  MobileIcon,
  MoveIcon,
  PanoramaIcon,
  PasteGoIcon,
  PinIcon,
  PlusCircleIcon,
  RefreshIcon,
  RotateIcon,
  RulerIcon,
  TextSizeIcon,
  TrashIcon,
} from "./editor-icons";

const ICON = "h-4 w-4";

type Ref = { g: number; i: number; el: ApiElement };

const TYPE_META = {
  title: { label: "Title", Icon: TextSizeIcon },
  image: { label: "Image", Icon: ImageIcon },
  device: { label: "Device", Icon: MobileIcon },
  shape: { label: "Shape", Icon: PanoramaIcon },
  spacer: { label: "Spacer", Icon: LayersIcon },
} as const;

function ActionButton({
  tone,
  label,
  onClick,
  children,
}: {
  tone: "success" | "secondary" | "danger";
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`btn btn-${tone} h-8 px-2.5`}
    >
      {children}
    </button>
  );
}

function Row({
  title,
  subtitle,
  Icon,
  actions,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  actions?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="relative flex h-12 items-center px-6">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center text-left"
        >
          <span className="mr-2 text-gray-600">
            <Icon className={ICON} />
          </span>
          <span className="ml-2 flex min-w-0 flex-col items-start">
            <span className="whitespace-nowrap text-sm font-bold text-gray-900">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] leading-tight text-gray-400">
                {subtitle}
              </span>
            )}
          </span>
        </button>
        {actions && (
          <div className="flex flex-row items-center gap-x-2 pr-6">{actions}</div>
        )}
        <button
          type="button"
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          onClick={onToggle}
          className="absolute right-4 text-gray-500"
        >
          <ChevronIcon
            className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && <div className="px-6 pb-5 pt-1">{children}</div>}
    </div>
  );
}

type MiniTool = "opacity" | "rotate" | "dimensions";

/** Per-element opacity / rotation / exact-geometry toggles. */
function MiniButtons({
  active,
  onToggle,
}: {
  active: MiniTool | null;
  onToggle: (tool: MiniTool) => void;
}) {
  const tools: { id: MiniTool; label: string; Icon: (p: { className?: string }) => React.ReactElement }[] = [
    { id: "opacity", label: "Opacity", Icon: ContrastIcon },
    { id: "rotate", label: "Rotate", Icon: RotateIcon },
    { id: "dimensions", label: "Exact dimensions", Icon: RulerIcon },
  ];
  return (
    <>
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-label={t.label}
          aria-pressed={active === t.id}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(t.id);
          }}
          className={`btn h-7 px-2 ${active === t.id ? "btn-primary" : "btn-secondary"}`}
        >
          <t.Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </>
  );
}

/** The control revealed by the mini buttons, above the element's own panel. */
function MiniTools({
  tool,
  el,
  patch,
}: {
  tool: MiniTool;
  el: ApiElement;
  patch: (fn: (x: ApiElement) => ApiElement) => void;
}) {
  const num = "w-full rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900";

  if (tool === "opacity") {
    const value = Math.round((el.opacity ?? 1) * 100);
    return (
      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <label className="flex items-center gap-3 text-xs font-medium text-gray-600">
          Opacity
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => patch((x) => ({ ...x, opacity: Number(e.target.value) / 100 }))}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{value}%</span>
        </label>
      </div>
    );
  }

  if (tool === "rotate") {
    const value = Math.round(el.rot ?? 0);
    return (
      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <label className="flex items-center gap-3 text-xs font-medium text-gray-600">
          Rotate
          <input
            type="range"
            min={-180}
            max={180}
            value={value}
            onChange={(e) => patch((x) => ({ ...x, rot: Number(e.target.value) }))}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{value}°</span>
        </label>
      </div>
    );
  }

  const fields: { key: "x" | "y" | "w" | "h"; label: string }[] = [
    { key: "x", label: "X" },
    { key: "y", label: "Y" },
    { key: "w", label: "W" },
    { key: "h", label: "H" },
  ];
  return (
    <div className="mb-3 grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-3">
      {fields.map((f) => (
        <label key={f.key} className="text-[11px] font-medium text-gray-600">
          {f.label} (%)
          <input
            type="number"
            step={0.1}
            className={num}
            value={Number((el.loc[f.key] * 100).toFixed(2))}
            onChange={(e) =>
              patch((x) => ({
                ...x,
                loc: { ...x.loc, [f.key]: Number(e.target.value) / 100 },
              }))
            }
          />
        </label>
      ))}
    </div>
  );
}

/**
 * The edit panel that opens beside the selected screenshot — an action row plus
 * an accordion listing Layouts & Elements, Background, and every layer element.
 */
export function SceneEditPanel({
  screen,
  project,
  height,
  openKey,
  onOpenKeyChange,
  onClose,
  onDuplicate,
  onDelete,
  onExportOne,
  patchElement,
  patchScreen,
  patchProject,
}: {
  screen: ApiScreen;
  project: ApiProject;
  height: number;
  openKey: string | null;
  onOpenKeyChange: (key: string | null) => void;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportOne: () => void;
  patchElement: (g: number, i: number, fn: (el: ApiElement) => ApiElement) => void;
  patchScreen: (fn: (s: ApiScreen) => ApiScreen) => void;
  patchProject: (fn: (p: ApiProject) => ApiProject) => void;
}) {
  const open = openKey;
  const toggle = (k: string) => onOpenKeyChange(open === k ? null : k);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scroller = useRef<HTMLDivElement | null>(null);
  const [miniTool, setMiniTool] = useState<{ key: string; tool: MiniTool } | null>(null);

  /*
   * Keep the section chosen on the canvas in view.
   *
   * Deliberately not `scrollIntoView`: that walks every scrollable ancestor,
   * so it also drags the horizontal screenshot strip sideways and the canvas
   * appears to jump. Only this panel's own scroller moves.
   */
  useEffect(() => {
    if (!open) return;
    const row = rowRefs.current[open];
    const box = scroller.current;
    if (!row || !box) return;
    const r = row.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    if (r.top < b.top) box.scrollTop -= b.top - r.top;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
  }, [open]);

  // Elements are listed top layer group first, spacers omitted.
  const refs: Ref[] = [];
  for (let g = screen.groups.length - 1; g >= 0; g -= 1) {
    screen.groups[g].forEach((el, i) => {
      if (el.type !== "spacer") refs.push({ g, i, el });
    });
  }
  const layerName = (g: number) =>
    `layer ${g + 1} (${g === screen.groups.length - 1 ? "top" : "bottom"})`;

  return (
    <div
      style={{ height }}
      className="ml-2 flex w-[450px] shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <div className="flex flex-nowrap justify-between px-5 pb-2 pt-3">
        <ActionButton tone="success" label="Close" onClick={onClose}>
          <CheckIcon className={ICON} />
        </ActionButton>
        <ActionButton tone="secondary" label="Refresh">
          <RefreshIcon className={ICON} />
        </ActionButton>
        <ActionButton tone="secondary" label="Duplicate" onClick={onDuplicate}>
          <CopyIcon className={ICON} />
        </ActionButton>
        <ActionButton
          tone="secondary"
          label="Download this screenshot"
          onClick={onExportOne}
        >
          <DownloadIcon className={ICON} />
        </ActionButton>
        <ActionButton tone="secondary" label="Copy settings">
          <PasteGoIcon className={ICON} />
        </ActionButton>
        <ActionButton tone="secondary" label="Pin panel">
          <PinIcon className={ICON} />
        </ActionButton>
        <ActionButton tone="danger" label="Delete" onClick={onDelete}>
          <TrashIcon className={ICON} />
        </ActionButton>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-2">
        <div ref={(n) => { rowRefs.current["layers"] = n; }}>
        <Row
          title="Layouts & Elements"
          Icon={LayersIcon}
          open={open === "layers"}
          onToggle={() => toggle("layers")}
          actions={
            <>
              <button
                type="button"
                aria-label="Add element"
                className="btn btn-secondary h-7 px-2"
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Move elements"
                className="btn btn-secondary h-7 px-2"
              >
                <MoveIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Exact dimensions"
                className="btn btn-secondary h-7 px-2"
              >
                <RulerIcon className="h-3.5 w-3.5" />
              </button>
            </>
          }
        >
          <div className="-mt-2 mb-2">
            {[...screen.groups].map((group, gi) => {
              const g = screen.groups.length - 1 - gi;
              const items = screen.groups[g]
                .map((el, i) => ({ el, i }))
                .filter((x) => x.el.type !== "spacer");
              if (!items.length) return null;
              return (
                <div key={g}>
                  <div className="py-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Layer {g + 1} ({g === screen.groups.length - 1 ? "top" : "bottom"})
                  </div>
                  {items.map(({ el, i }, n) => {
                    const meta = TYPE_META[el.type];
                    return (
                      <div
                        key={`${g}-${i}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                      >
                        <span className="text-gray-500">
                          <meta.Icon className={ICON} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-800">
                            {meta.label} {n + 1}
                          </span>
                          <span className="flex gap-3 text-[11px] text-gray-400">
                            <span>X {Math.round(el.loc.x * 1320)}px</span>
                            <span>Y {Math.round(el.loc.y * 2868)}px</span>
                            <span>W {Math.round(el.loc.w * 1320)}px</span>
                            <span>H {Math.round(el.loc.h * 2868)}px</span>
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Row>
        </div>

        <div ref={(n) => { rowRefs.current["bg"] = n; }}>
          <Row
            title="Background"
            Icon={PanoramaIcon}
            open={open === "bg"}
            onToggle={() => toggle("bg")}
          >
            <BackgroundSection
              screen={screen}
              project={project}
              patchScreen={patchScreen}
              patchProject={patchProject}
            />
          </Row>
        </div>

        {refs.map(({ g, i, el }) => {
          const meta = TYPE_META[el.type];
          const key = `${g}-${i}`;
          const patch = (fn: (x: ApiElement) => ApiElement) => patchElement(g, i, fn);
          return (
            <div key={key} ref={(n) => { rowRefs.current[key] = n; }}>
              <Row
                title={meta.label}
                subtitle={layerName(g)}
                Icon={meta.Icon}
                actions={
                  <MiniButtons
                    active={miniTool?.key === key ? miniTool.tool : null}
                    onToggle={(tool) => {
                      setMiniTool((prev) =>
                        prev?.key === key && prev.tool === tool ? null : { key, tool },
                      );
                      if (open !== key) toggle(key);
                    }}
                  />
                }
                open={open === key}
                onToggle={() => toggle(key)}
              >
                {miniTool?.key === key && (
                  <MiniTools tool={miniTool.tool} el={el} patch={patch} />
                )}
                {el.type === "title" && <TitleSection el={el} patch={patch} />}
                {el.type === "device" && <DeviceSection el={el} patch={patch} />}
                {el.type === "image" && <ImageSection el={el} patch={patch} />}
                {el.type === "shape" && <ShapeSection el={el} patch={patch} />}
              </Row>
            </div>
          );
        })}
      </div>
    </div>
  );
}

