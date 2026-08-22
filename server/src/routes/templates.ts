import { Router } from "express";
import { z } from "zod";
import { Template } from "../models/template.js";

export const templatesRouter = Router();

/** GET /api/templates — catalog listing, optionally scoped/filtered. */
templatesRouter.get("/", async (req, res) => {
  const { category, q, free, simple, orientation, theme, limit, skip } =
    req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (category) filter.categories = category;
  if (free === "true") filter.free = true;
  if (simple === "true") filter.simple = true;
  if (orientation) filter.orientation = orientation;
  if (theme) filter.theme = theme;
  if (q) filter.name = { $regex: q, $options: "i" };

  const [items, total] = await Promise.all([
    Template.find(filter, { screens: 0 })
      .skip(Number(skip ?? 0))
      .limit(Math.min(Number(limit ?? 50), 200))
      .lean(),
    Template.countDocuments(filter),
  ]);

  res.json({ total, items });
});

/** GET /api/templates/:templateId — full design payload. */
templatesRouter.get("/:templateId", async (req, res) => {
  const doc = await Template.findOne({
    templateId: req.params.templateId,
  }).lean();
  if (!doc) return res.status(404).json({ error: "Template not found" });
  res.json(doc);
});

const locationSchema = z.object({
  w: z.number(),
  h: z.number(),
  x: z.number(),
  y: z.number(),
  anchor: z.enum(["middle", "topLeft"]).default("middle"),
});

const titleSchema = z.object({
  text: z.string().default(""),
  color: z.string().nullish(),
  gradient: z.string().nullish(),
  bold: z.boolean().default(false),
  align: z.enum(["left", "center", "right"]).default("left"),
  font: z.string().nullish(),
  lineHeight: z.number().default(1),
});

const elementSchema = z.object({
  type: z.enum(["title", "image", "device", "spacer"]),
  loc: locationSchema,
  rot: z.number().default(0),
  title: titleSchema.optional(),
  subtitle: titleSchema.optional(),
  decoration: z.string().nullish(),
  asset: z.string().nullish(),
  assetShape: z.enum(["blob", "sparkle", "wave", "generic"]).default("generic"),
  device: z
    .object({ variant: z.string().nullish(), colour: z.string().nullish() })
    .optional(),
});

const layoutSchema = z.object({
  background: z.string().nullish(),
  primaryColor: z.string().nullish(),
  titleFont: z.string().nullish(),
  subtitleFont: z.string().nullish(),
  targets: z.array(z.string()).default([]),
  screens: z.array(
    z.object({
      order: z.number(),
      layout: z.string().default("Blank"),
      orientation: z.enum(["portrait", "landscape"]).default("portrait"),
      background: z.string().nullish(),
      groups: z.array(z.array(elementSchema)),
    }),
  ),
});

/**
 * PUT /api/templates/:templateId/layout — ingest a captured design payload.
 * Used by tools/capture-layout.js; not part of the public read API.
 */
templatesRouter.put("/:templateId/layout", async (req, res) => {
  const parsed = layoutSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const doc = await Template.findOneAndUpdate(
    { templateId: req.params.templateId },
    { $set: { ...parsed.data, hasLayout: parsed.data.screens.length > 0 } },
    { new: true, projection: { screens: 0 } },
  ).lean();
  if (!doc) return res.status(404).json({ error: "Template not found" });

  res.json({ ok: true, templateId: doc.templateId, screens: parsed.data.screens.length });
});
