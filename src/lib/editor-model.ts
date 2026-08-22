import { DEFAULT_OUTPUTS } from "./devices";

export type LayoutKind =
  | "blank"
  | "device-only"
  | "text-above"
  | "text-below";

export type BackgroundStyle = "none" | "solid" | "gradient";

export type Screen = {
  id: string;
  layout: LayoutKind;
  panoramic: boolean;
  background: {
    style: BackgroundStyle;
    color: string;
    color2: string;
    angle: number;
    image?: string;
  };
  title: {
    text: string;
    subtitle: string;
    showSubtitle: boolean;
    position: "top" | "middle" | "bottom";
    font: string;
    size: number;
    weight: number;
    color: string;
    align: "left" | "center" | "right";
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  device: {
    frame: "auto" | "none";
    screenshot?: string;
    scale: number;
    offsetY: number;
    shadow: boolean;
  };
};

export type Project = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  referenceShots: string[];
  outputs: string[];
  activeOutput: string;
  language: string;
  screens: Screen[];
};

export const FONT_OPTIONS = [
  "Geist Sans",
  "Inter",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Trebuchet MS",
  "Verdana",
];

export const LAYOUTS: { id: LayoutKind; label: string }[] = [
  { id: "blank", label: "Blank" },
  { id: "device-only", label: "Device only" },
  { id: "text-above", label: "Text above device" },
  { id: "text-below", label: "Text below device" },
];

let seq = 0;
export function newId(prefix = "s") {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq}`;
}

export function createScreen(layout: LayoutKind = "text-above"): Screen {
  return {
    id: newId(),
    layout,
    panoramic: false,
    background: {
      style: "gradient",
      color: "#7c5cff",
      color2: "#4c2fd6",
      angle: 160,
    },
    title: {
      text: "Create App Screenshots",
      subtitle: "Add a supporting line of copy",
      showSubtitle: false,
      position: "top",
      font: "Geist Sans",
      size: 64,
      weight: 700,
      color: "#ffffff",
      align: "center",
      bold: true,
      italic: false,
      underline: false,
    },
    device: { frame: "auto", scale: 0.78, offsetY: 0, shadow: true },
  };
}

export function createProject(partial?: Partial<Project>): Project {
  return {
    id: newId("p"),
    name: "Sandbox project",
    referenceShots: [],
    outputs: [...DEFAULT_OUTPUTS],
    activeOutput: DEFAULT_OUTPUTS[0],
    language: "en-GB",
    screens: [],
    ...partial,
  };
}
