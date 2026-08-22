import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDb } from "./lib/db.js";
import { Template } from "./models/template.js";
import type { ScreenLayout } from "./models/layout.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");
const layoutsDir = join(dataDir, "layouts");

type CatalogRow = {
  templateId: string;
  slug: string;
  name: string;
  projectRef: string;
  shots: number;
  orientation: string[];
  theme: string[];
  simple: boolean;
  free: boolean;
  categories: string[];
};

async function main() {
  await connectDb();

  const catalog = JSON.parse(
    readFileSync(join(dataDir, "templates.json"), "utf8"),
  ) as CatalogRow[];

  const layouts = new Map<string, Record<string, unknown>>();
  if (existsSync(layoutsDir)) {
    for (const file of readdirSync(layoutsDir).filter((f) =>
      f.endsWith(".json"),
    )) {
      const payload = JSON.parse(readFileSync(join(layoutsDir, file), "utf8"));
      layouts.set(file.replace(/\.json$/, ""), payload);
    }
  }

  const ops = catalog.map((row) => {
    const layout = layouts.get(row.templateId) as
      | {
          background?: string;
          primaryColor?: string;
          titleFont?: string;
          subtitleFont?: string;
          targets?: string[];
          screens?: ScreenLayout[];
        }
      | undefined;

    return {
      updateOne: {
        filter: { templateId: row.templateId },
        update: {
          $set: {
            ...row,
            background: layout?.background,
            primaryColor: layout?.primaryColor,
            titleFont: layout?.titleFont,
            subtitleFont: layout?.subtitleFont,
            targets: layout?.targets ?? [],
            screens: layout?.screens ?? [],
            hasLayout: Boolean(layout?.screens?.length),
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Template.bulkWrite(
    ops as Parameters<typeof Template.bulkWrite>[0],
  );
  const withLayout = await Template.countDocuments({ hasLayout: true });
  console.log(
    `[seed] ${catalog.length} templates upserted ` +
      `(${result.upsertedCount} new, ${result.modifiedCount} updated), ` +
      `${withLayout} with a captured layout`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
