# AppScreens Templates — clone

A pixel-accurate recreation of **https://appscreens.com/templates** built with
Next.js 16 (App Router) + Tailwind CSS v4.

## Running

The app is a Next.js front end plus an Express/MongoDB API.

```bash
mongod --dbpath .mongo-data --fork --logpath .mongo-data/mongod.log
```

```bash
cd server && npm install && cp .env.example .env && npm run seed && npm run dev
```

```bash
npm run dev
```

The API listens on `:4000`; point the front end elsewhere with
`NEXT_PUBLIC_API_URL`.

## What is reproduced

- **Top toolbar** — logo, Material-style nav buttons (`Home / Templates / Sandbox /
  Pricing / Help`), Help and Account popover menus, and the `md:`-and-below
  "Menu" dropdown.
- **Hero** — breadcrumb, gradient-accent headline, description, and the framed
  template preview with its inner-blur glow, plus the space-waves / spotlight
  backgrounds.
- **Catalog** — sticky filter header with the `175 templates` / `N of 175`
  counter and search, the `lg:`-only 240px sidebar (collapsible *App Store
  Categories*, *Store and device* and *Filters* groups), the horizontal chip nav
  below `lg`, and the template cards with their horizontally scrolling
  screenshot rails, action links, and overflow menu.
- **Filtering** — free / simple checkboxes, single-select orientation and theme
  facets (which collapse to `All` + the chosen value once selected, as on the
  reference), search, `Load more templates (N remaining)` paging at 50 per page,
  and `Clear filters`.
- **Category routes** — all 37 `/templates/<slug>` pages with the reference's
  headings, descriptions, breadcrumbs and membership.
- **Template detail screen** — `/template/app-store-screenshots/<slug>/<id>` for
  all 175 templates: breadcrumb, full-bleed screenshot rail, title and tag
  pills, Specifications, Start with Template / Copy to Account, share row,
  About, Screenshot dimensions, and a related "More templates" grid.
- **Editor** — `/user/sandbox`, described below.
- **FAQ** — nine independently expandable questions.
- **Footer** — closing CTA, arched gradient plate, four link columns, social
  row, and copyright line.

## Backend

`server/` — Node + Express + TypeScript + Mongoose.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | liveness |
| `GET` | `/api/templates` | catalog listing (`category`, `q`, `free`, `simple`, `orientation`, `theme`, `limit`, `skip`) |
| `GET` | `/api/templates/:templateId` | one template incl. its design payload |
| `PUT` | `/api/templates/:templateId/layout` | ingest a captured design (see `tools/`) |
| `POST` | `/api/projects/from-template/:templateId` | **Copy Template to Sandbox / Account** — deep-copies the design into a new project |
| `POST` | `/api/projects` | blank project |
| `GET` | `/api/projects/:projectId` | load a project |
| `PATCH` | `/api/projects/:projectId` | editor autosave |
| `DELETE` | `/api/projects/:projectId` | discard |
| `GET` | `/api/projects?ownerKey=…` | this browser's projects |

Two collections: `templates` (catalog + design payload) and `projects` (copies
being edited). Sandbox projects carry a TTL index and expire after 7 days;
account copies are kept.

`npm run seed` upserts all 175 templates from `data/templates.json` and merges
any captured designs from `data/layouts/*.json`.

## Start with Template

Both the catalog card and the detail screen open the reference's three-option
sheet:

- **AI Screenshot creator** — not implemented; the sheet says so.
- **Copy Template to Account** — copies the design into a kept project.
- **Copy Template to Sandbox** — copies the design into a temporary project.

Either copy `POST`s to the API and opens `/user/sandbox?project=<id>`, where the
template renders with its own captions, colours, decoration slots and device
frames, and every caption / app screen / colour is editable. Edits autosave back
to MongoDB, so reloading the URL restores them.

## The editor

`/user/sandbox` is a working screenshot designer, not a mockup. Its chrome is
rebuilt to the reference's own measurements:

- **Toolbar** — 52px white bar; `.btn` scale (36px tall, 8px radius, 6/10px
  padding, 14px/600, `active:scale-95`) with the reference's exact palette:
  primary `#4F46E5`, secondary `#C7D2FE`/`#4338CA`, success `#86EFAC`/`#166534`,
  danger `#FCA5A5`/`#991B1B`, light `#E5E7EB`/`#1F2937`, and the pink-to-orange
  `PRO` gradient. Same button order, with Globals / Setup / Background /
  Localize / App Screens labels collapsing to icons below `xl`.
- **Canvas strip** — flat 350px screenshot slots, 10px gutters, horizontal
  scroll; no card borders or rounded corners.
- **Edit affordance** — a round FAB at `top:10 right:10` of each screenshot:
  indigo-200 pencil on hover, indigo-300 check when open.
- **Edit panel** — opens *inline beside* the selected screenshot (not as a
  sidebar): 450px wide, `rounded-2xl border border-gray-200`, matching the
  canvas height. A 7-button action row (close / refresh / duplicate / download /
  copy settings / pin / delete) sits above an accordion of **Layouts &
  Elements**, **Background**, and one row per layer element — labelled by type
  with its `layer N (top|bottom)` position and per-element opacity / rotate /
  dimension buttons, listed top layer group first.
- **Zoom pill** — fixed bottom-left, `rgba(24,24,27,.9)` at 999px radius, with
  zoom out / reset / zoom in / keyboard.
- **Below `md`** the designer is replaced by the reference's "Screen Size Too
  Small" notice.

- **Projects** — blank, or seeded from a template via *Start with Template*
  (which carries over the shot count, orientation, theme palette and reference
  previews). Autosaves to `localStorage`.
- **Screens** — add via the layout selector (blank / device only / text above /
  text below), reorder, duplicate, delete, undo.
- **Editing panels** — Layouts & Elements, Background (none / solid / gradient
  with colour + angle, or an uploaded image), Title (text, subtitle, floating
  position, bold / italic / underline, alignment, colour, font family, size),
  and Device (upload your app screen, size, vertical offset, drop shadow).
- **Output sizes** — the reference's Android and Apple presets at their real
  store dimensions (e.g. iPhone 6.9" 1320×2868, Android 16:9 2160×3840, Apple
  Watch 410×502). Switching output re-renders every screen with the matching
  device frame.
- **Direct selection** — hovering any element on a screenshot outlines it with a
  dashed rectangle; clicking it selects the screenshot, opens the panel and
  expands that element's own section (the selected element keeps an indigo
  dashed outline).
- **Per-element panels** carry the reference's controls: *Title* has Include
  Subtitle, Floating position, the bold/italic/underline/colour/gradient/align/
  line-spacing/text-background toolbar, Font Family, Decoration (all 20 shapes)
  and Match text size; *Device* has Device type, Device style, Device
  orientation, Fit, Vertical position and Add screenshots; *Image* has Fit,
  Vertical position, SVG style and Select Image; *Background* has Panoramic,
  the none/solid/gradient styles with colours and angle, Select Background and
  Pattern.
- **Export** — renders every screen at every selected output size and downloads
  a single `.zip`, foldered by size (`iphone-6-9/01.png`), with a progress
  readout. The archive is written by a small built-in ZIP writer
  (`src/lib/zip.ts`) — no dependency, verified against system `unzip`.

Preview and export share one renderer (`src/lib/render.ts`), so the canvas in
the editor is exactly what the exported file contains.

## Data

`src/data/templates.ts` holds all 175 templates (name, slug, project id,
screenshot count, orientation / theme / skill / free facets) and
`src/data/categories.ts` holds the per-category membership — all captured from
the live site.

Screenshot previews are loaded from the reference site's own image proxy
(`appscreens.com/img?src=…`), exactly as the original page does; the fonts
(`Geist Sans` / `Geist Mono`) and background art are self-hosted under
`public/assets`.

## Capturing template designs

`server/tools/capture-layout.js` runs the reference's own copy flow in a browser
tab, decodes the resulting project, and normalises it into the layout shape the
API stores. `server/tools/ingest-b64.py` writes a captured payload into
`data/layouts/<templateId>.json` ready for `npm run seed`.

Templates without a captured design still copy — they fall back to a generated
starter layout that keeps the template's palette, orientation and shot count.

## Known gaps

- **One template (`tRiGP`, Kova) ships with a captured design.** The rest use the
  generated fallback until more are captured with the tool above.
- **Decoration slots render as tinted placeholder shapes.** The reference's
  artwork lives in its own asset library behind an export-protected canvas, so
  only the slot's position, size and shape family are reproduced; drop your own
  artwork in from the panel.
- Captions authored as translucent white (e.g. `#ffffffbf`) were designed
  against that artwork, so they read faint over the placeholder background —
  recolour them in the Caption panel.
- Detail-page tags are derived from each template's category membership plus
  its skill and theme facets. The reference also carries a few hand-authored
  style tags ("multi layered", "gradient", "graphics") and a bespoke opening
  paragraph per template, which are not public data.
- No authentication: "Copy to Account" marks the project as kept and scopes it
  to a per-browser key rather than a real login.
- `/` redirects to `/templates`; the marketing home page, `/pricing`, `/blog`
  and the account area are outside this build.
