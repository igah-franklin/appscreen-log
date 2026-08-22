import { Schema, model, type InferSchemaType } from "mongoose";
import { screenSchema } from "./layout.js";

const projectSchema = new Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    /** "sandbox" projects are anonymous and expire; "account" projects are kept. */
    kind: {
      type: String,
      enum: ["sandbox", "account"],
      default: "sandbox",
      index: true,
    },
    ownerKey: { type: String, index: true },
    templateId: String,
    templateName: String,

    outputs: { type: [String], default: [] },
    activeOutput: String,
    language: { type: String, default: "en-GB" },

    background: String,
    primaryColor: String,
    titleFont: String,
    subtitleFont: String,
    screens: { type: [screenSchema], default: [] },

    expiresAt: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof projectSchema>;
export const Project = model("Project", projectSchema);
