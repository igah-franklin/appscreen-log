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
  backgroundPattern?: string;
  panoramic?: boolean;
  groups: ApiElement[][];
};

export type Fit = "contain" | "cover" | "fill";
export type VPos = "top" | "center" | "bottom";

export type ApiElement = {
  type: "title" | "image" | "device" | "spacer";
  loc: { w: number; h: number; x: number; y: number; anchor: "middle" | "topLeft" };
  rot?: number;
  title?: ApiText;
  subtitle?: ApiText;
  /** Shape drawn behind the caption (see DECORATIONS). */
  decoration?: string;
  decorationColor?: string;
  /** Caption placement inside its box. */
  position?: VPos;
  matchTextSize?: boolean;
  asset?: string | null;
  assetShape?: "blob" | "sparkle" | "wave" | "generic";
  fit?: Fit;
  vPos?: VPos;
  svgColor?: string;
  device?: {
    variant?: string;
    colour?: string;
    screenshot?: string;
    style?: "real-dark" | "real-light" | "flat-dark" | "flat-light";
    orientation?: "portrait" | "landscape";
  };
};

export type ApiText = {
  text: string;
  color?: string;
  gradient?: string | null;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  font?: string;
  lineHeight?: number;
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
