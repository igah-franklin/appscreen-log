import { Schema } from "mongoose";

/**
 * Layout model mirroring the shape the designer works with: every screen is a
 * stack of layer groups, and every element is positioned as a fraction of the
 * screen so one layout renders at any store size.
 */

export type Anchor = "middle" | "topLeft";

export type ElementLocation = {
  w: number;
  h: number;
  x: number;
  y: number;
  anchor: Anchor;
};

export type TitleStyle = {
  text: string;
  color?: string;
  gradient?: string | null;
  bold?: boolean;
  align?: "left" | "center" | "right";
  font?: string;
  lineHeight?: number;
};

export type LayerElement = {
  type: "title" | "image" | "device" | "spacer";
  loc: ElementLocation;
  rot?: number;
  title?: TitleStyle;
  subtitle?: TitleStyle;
  decoration?: string;
  /** Decorative asset slot. Placeholder shapes render until artwork is supplied. */
  asset?: string | null;
  assetShape?: "blob" | "sparkle" | "wave" | "generic";
  device?: { variant?: string; colour?: string; screenshot?: string };
};

export type ScreenLayout = {
  order: number;
  layout: string;
  orientation: "portrait" | "landscape";
  background?: string;
  backgroundImage?: string;
  groups: LayerElement[][];
};

const locationSchema = new Schema<ElementLocation>(
  {
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    anchor: { type: String, enum: ["middle", "topLeft"], default: "middle" },
  },
  { _id: false },
);

const titleSchema = new Schema<TitleStyle>(
  {
    text: { type: String, default: "" },
    color: String,
    gradient: { type: String, default: null },
    bold: { type: Boolean, default: false },
    align: { type: String, enum: ["left", "center", "right"], default: "left" },
    font: String,
    lineHeight: { type: Number, default: 1 },
  },
  { _id: false },
);

export const elementSchema = new Schema<LayerElement>(
  {
    type: {
      type: String,
      enum: ["title", "image", "device", "spacer"],
      required: true,
    },
    loc: { type: locationSchema, required: true },
    rot: { type: Number, default: 0 },
    title: titleSchema,
    subtitle: titleSchema,
    decoration: String,
    asset: { type: String, default: null },
    assetShape: {
      type: String,
      enum: ["blob", "sparkle", "wave", "generic"],
      default: "generic",
    },
    device: new Schema(
      { variant: String, colour: String, screenshot: String },
      { _id: false },
    ),
  },
  { _id: false },
);

export const screenSchema = new Schema<ScreenLayout>(
  {
    order: { type: Number, required: true },
    layout: { type: String, default: "Blank" },
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      default: "portrait",
    },
    background: String,
    backgroundImage: String,
    groups: { type: [[elementSchema]], default: [] },
  },
  { _id: false },
);
