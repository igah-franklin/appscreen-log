import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Project } from "../models/project.js";
import { Template } from "../models/template.js";
import { buildScreensFromTemplate } from "../lib/from-template.js";
import { mapTargets } from "../lib/targets.js";

export const projectsRouter = Router();

const SANDBOX_TTL_DAYS = 7;

const copySchema = z.object({
  kind: z.enum(["sandbox", "account"]).default("sandbox"),
  ownerKey: z.string().min(1).max(128).optional(),
  outputs: z.array(z.string()).optional(),
});

/**
 * POST /api/projects/from-template/:templateId
 * Mirrors "Copy Template to Sandbox" / "Copy Template to Account": deep-copies
 * the template's design into a new, independently editable project.
 */
projectsRouter.post("/from-template/:templateId", async (req, res) => {
  const parsed = copySchema.safeParse(req.body ?? {});
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { kind, ownerKey, outputs } = parsed.data;

  const template = await Template.findOne({
    templateId: req.params.templateId,
  }).lean();
  if (!template) return res.status(404).json({ error: "Template not found" });

  const screens = buildScreensFromTemplate(template);
  const chosenOutputs = outputs?.length ? outputs : mapTargets(template.targets);

  const project = await Project.create({
    projectId: nanoid(12),
    name: `${template.name} copy`,
    kind,
    ownerKey,
    templateId: template.templateId,
    templateName: template.name,
    outputs: chosenOutputs,
    activeOutput: chosenOutputs[0],
    background: template.background,
    primaryColor: template.primaryColor,
    titleFont: template.titleFont,
    subtitleFont: template.subtitleFont,
    screens,
    expiresAt:
      kind === "sandbox"
        ? new Date(Date.now() + SANDBOX_TTL_DAYS * 864e5)
        : undefined,
  });

  res.status(201).json(project.toObject());
});

/** POST /api/projects — blank project. */
projectsRouter.post("/", async (req, res) => {
  const body = z
    .object({
      name: z.string().max(120).default("Sandbox project"),
      kind: z.enum(["sandbox", "account"]).default("sandbox"),
      ownerKey: z.string().max(128).optional(),
      outputs: z.array(z.string()).default([]),
      screens: z.array(z.any()).default([]),
    })
    .parse(req.body ?? {});

  const project = await Project.create({
    projectId: nanoid(12),
    ...body,
    activeOutput: body.outputs[0],
    expiresAt:
      body.kind === "sandbox"
        ? new Date(Date.now() + SANDBOX_TTL_DAYS * 864e5)
        : undefined,
  });
  res.status(201).json(project.toObject());
});

projectsRouter.get("/:projectId", async (req, res) => {
  const doc = await Project.findOne({ projectId: req.params.projectId }).lean();
  if (!doc) return res.status(404).json({ error: "Project not found" });
  res.json(doc);
});

/** PATCH /api/projects/:projectId — autosave from the editor. */
projectsRouter.patch("/:projectId", async (req, res) => {
  const allowed = [
    "name",
    "outputs",
    "activeOutput",
    "language",
    "background",
    "primaryColor",
    "titleFont",
    "subtitleFont",
    "screens",
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in (req.body ?? {})) update[key] = req.body[key];
  }
  const doc = await Project.findOneAndUpdate(
    { projectId: req.params.projectId },
    { $set: update },
    { new: true },
  ).lean();
  if (!doc) return res.status(404).json({ error: "Project not found" });
  res.json(doc);
});

projectsRouter.delete("/:projectId", async (req, res) => {
  const r = await Project.deleteOne({ projectId: req.params.projectId });
  if (!r.deletedCount)
    return res.status(404).json({ error: "Project not found" });
  res.status(204).end();
});

/** GET /api/projects?ownerKey=… — the account project list. */
projectsRouter.get("/", async (req, res) => {
  const ownerKey = String(req.query.ownerKey ?? "");
  if (!ownerKey) return res.status(400).json({ error: "ownerKey required" });
  const items = await Project.find({ ownerKey }, { screens: 0 })
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ items });
});
