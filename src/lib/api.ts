export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiScreen = {
  order: number;
  layout: string;
  orientation: "portrait" | "landscape";
  background?: string;
  backgroundStyle?: "none" | "solid" | "gradient";
  backgroundColor2?: string;
  backgroundAngle?: number;
  backgroundImage?: string;
  backgroundFit?: "contain" | "cover";
  backgroundPattern?: string;
  panoramic?: boolean;
  groups: ApiElement[][];
};

export type Fit = "contain" | "cover" | "fill";
export type VPos = "top" | "center" | "bottom";

export type ApiShadow = { x: number; y: number; blur: number; color: string };

/** A drawn shape layer — rectangles, ellipses and rules. */
export type ApiShape = {
  kind: string;
  size?: string;
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number;
  cornerRadius?: number;
  lineDirection?: string;
  glassStrength?: number;
  glassFrost?: number;
  glassColor?: string | null;
};

export type ApiElement = {
  type: "title" | "image" | "device" | "shape" | "spacer";
  loc: { w: number; h: number; x: number; y: number; anchor: "middle" | "topLeft" };
  rot?: number;
  /** 0–1; multiplies whatever the element paints. */
  opacity?: number;
  shadow?: ApiShadow;
  title?: ApiText;
  subtitle?: ApiText;
  /** Shape drawn behind the caption (see DECORATIONS). */
  decoration?: string;
  decorationColor?: string;
  decorationStrokeWidth?: number;
  decorationStrokeColor?: string;
  padding?: number;
  shape?: ApiShape;
  /** Caption placement inside its box. */
  position?: VPos;
  matchTextSize?: boolean;
  asset?: string | null;
  assetShape?: "blob" | "sparkle" | "wave" | "arrow" | "laurel" | "generic";
  fit?: Fit;
  vPos?: VPos;
  /** Overlay applied to SVG artwork — a colour or a whole CSS gradient. */
  svgColor?: string;
  svgStrokeWidth?: number;
  svgStrokeColor?: string;
  device?: {
    variant?: string;
    colour?: string;
    screenshot?: string;
    screenshotWidth?: number;
    screenshotHeight?: number;
    style?: "real-dark" | "real-light" | "flat-dark" | "flat-light";
    orientation?: "portrait" | "landscape";
    frameColor?: string;
    frameSize?: number;
    padding?: number;
    paddingColor?: string;
    infill?: string;
  };
};

/** One styled span within a caption line. */
export type ApiTextRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  gradient?: string | null;
};

export type ApiTextLine = {
  runs: ApiTextRun[];
  align?: "left" | "center" | "right" | null;
};

export type ApiText = {
  text: string;
  /** Authored line/run styling; `text` is the plain-text fallback. */
  lines?: ApiTextLine[];
  color?: string;
  gradient?: string | null;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  font?: string;
  lineHeight?: number;
  charSpacing?: number;
  /** Cap on rendered size, as a fraction of the screen height. */
  maxFontSize?: number;
  /** Highlight drawn behind the text run. */
  background?: string | null;
};

export type ApiProject = {
  projectId: string;
  name: string;
  kind: "sandbox" | "account";
  templateId?: string;
  templateName?: string;
  outputs: string[];
  activeOutput: string;
  language: string;
  background?: string;
  primaryColor?: string;
  titleFont?: string;
  subtitleFont?: string;
  screens: ApiScreen[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${body}`.trim());
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  copyTemplate: (templateId: string, kind: "sandbox" | "account") =>
    request<ApiProject>(`/api/projects/from-template/${templateId}`, {
      method: "POST",
      body: JSON.stringify({ kind, ownerKey: ownerKey() }),
    }),
  createBlank: (outputs: string[]) =>
    request<ApiProject>(`/api/projects`, {
      method: "POST",
      body: JSON.stringify({
        name: "Sandbox project",
        kind: "sandbox",
        ownerKey: ownerKey(),
        outputs,
      }),
    }),
  getProject: (projectId: string) =>
    request<ApiProject>(`/api/projects/${projectId}`),
  saveProject: (projectId: string, patch: Partial<ApiProject>) =>
    request<ApiProject>(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};

const ACTIVE_KEY = "appscreens.activeProject";

/** The project the sandbox opens. Kept in storage so the URL stays clean. */
export function setActiveProject(projectId: string) {
  if (typeof window !== "undefined")
    window.localStorage.setItem(ACTIVE_KEY, projectId);
}

export function getActiveProject(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function clearActiveProject() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE_KEY);
}

/** Stable per-browser key so sandbox projects can be listed again later. */
export function ownerKey() {
  if (typeof window === "undefined") return undefined;
  let key = localStorage.getItem("appscreens.ownerKey");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("appscreens.ownerKey", key);
  }
  return key;
}
