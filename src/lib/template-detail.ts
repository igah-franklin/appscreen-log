import { CATEGORIES } from "@/data/categories";
import { TEMPLATES, type Template } from "@/data/templates";
import { OUTPUT_BY_ID, DEFAULT_OUTPUTS } from "./devices";

/**
 * The reference tags a template with its skill level, theme, and every App
 * Store category it appears under. We rebuild that list from the same data.
 */
export function templateTags(t: Template): string[] {
  const style = [t.simple ? "simple" : "advanced", ...t.theme];
  const categories = CATEGORIES.filter(
    (c) => c.group === "App Store Categories" && c.members.includes(t.id),
  ).map((c) => c.label.toLowerCase());
  return [...style, ...categories];
}

export function templateOutputs(t: Template) {
  const landscapeOnly =
    t.orientation.includes("landscape") && !t.orientation.includes("portrait");
  const ids = landscapeOnly
    ? ["google-feature-graphic", "ipad-13", "macos"]
    : DEFAULT_OUTPUTS;
  return ids
    .map((id) => OUTPUT_BY_ID.get(id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));
}

export function orientationLabel(t: Template) {
  if (t.orientation.includes("portrait") && t.orientation.includes("landscape"))
    return "Portrait and landscape orientation";
  if (t.orientation.includes("landscape")) return "Landscape orientation";
  return "Portrait orientation";
}

export function templateDescription(t: Template) {
  const tags = templateTags(t).slice(0, 4);
  const orientation = t.orientation.includes("landscape")
    ? "landscape"
    : "portrait";
  const outputs = templateOutputs(t).length;
  const list =
    tags.length > 1
      ? `${tags.slice(0, -1).join(", ")}, and ${tags[tags.length - 1]}`
      : tags[0];
  return `${t.name} is a ${orientation} app screenshot template built for iOS and Android tablet and phone devices. ${t.shots} screenshots are included, with responsive exports for ${outputs} device outputs. The layout is suited to ${list} apps and screenshot styles, using the template tags and visual structure as guidance for the page. It is configured with 1 language and can be adapted for App Store Connect and Google Play Console exports.`;
}

export function relatedTemplates(t: Template, count = 9) {
  const tags = new Set(templateTags(t));
  return TEMPLATES.filter((o) => o.id !== t.id)
    .map((o) => ({
      t: o,
      score: templateTags(o).filter((x) => tags.has(x)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.t);
}

export const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));
