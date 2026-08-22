import { Schema, model, type InferSchemaType } from "mongoose";
import { screenSchema } from "./layout.js";

const templateSchema = new Schema(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    projectRef: { type: String, required: true },
    shots: { type: Number, required: true },
    orientation: { type: [String], default: ["portrait"] },
    theme: { type: [String], default: [] },
    simple: { type: Boolean, default: false },
    free: { type: Boolean, default: false },
    categories: { type: [String], default: [] },

    /** Design payload. Present once a layout has been captured for the template. */
    background: String,
    primaryColor: String,
    titleFont: String,
    subtitleFont: String,
    targets: { type: [String], default: [] },
    screens: { type: [screenSchema], default: [] },
    hasLayout: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type TemplateDoc = InferSchemaType<typeof templateSchema>;
export const Template = model("Template", templateSchema);
