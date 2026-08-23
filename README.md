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

### Device frames

The reference composites a photographic device PNG per output size, served from
`appscreens.com/assets/frames/<variant>/<device>/<colour>.png` — the frame has a
transparent screen cutout, so the app screen is drawn into the cutout and the
frame laid over it. Those responses carry no CORS header, so the API proxies
them (`/api/frames/...`), caching each to `server/data/frames/` and re-serving
it with `access-control-allow-origin` — without which drawing one would taint
the canvas and break PNG export.

`src/lib/frames.ts` maps each output size to the frame the reference itself
loads for it (`iPhones - 6.9"` → `iosphone67island`, `Android Phones - 16:9` →
`andgals25`, `iPad - 13"` → `iostabx`, `Android 10" Tablets` → `andgaltabs8`,
…), and picks the colour from the layer's own `deviceType`.

Finding the cutout takes some care, because the frame is a device on a
*transparent background* — the pixels outside the body look exactly like the
screen, so scanning inward from the edges finds nothing, and the cutout's
bounding-box corners land outside the body where the image is transparent too.
So the cutout is traced instead: each row is measured outward from two
reference columns a quarter of the way in from each side (clear of the side
buttons and of a notch or Dynamic Island, which are opaque and sit *within* the
screen), and the resulting outline is kept as a `Path2D`. The app screen is
drawn in the frame image's own coordinates clipped to that path, so it lands
exactly inside the glass at any scale, with the frame over the top. `dynamic`
and frameless devices are still drawn on the canvas, as they are upstream.

## Backend

`server/` — Node + Express + TypeScript + Mongoose.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | liveness |
| `GET` | `/api/frames/:variant/:device/:colour.png` | device frame proxy (see below) |
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
the captured designs from `data/layouts/*.json`.

## Start with Template

Both the catalog card and the detail screen open the reference's three-option
sheet:

- **AI Screenshot creator** — not implemented; the sheet says so.
- **Copy Template to Account** — copies the design into a kept project.
- **Copy Template to Sandbox** — copies the design into a temporary project.

Either copy `POST`s to the API, stores the new project id as the active project
and opens plain **`/user/sandbox`** — the id never appears in the URL. The
template renders with its own captions, colours, decoration slots and device
frames, and every caption / app screen / colour is editable. Edits autosave back
to MongoDB, so reloading `/user/sandbox` restores them.

A `?project=<id>` link still works as a deep link: it is adopted once, stored,
and stripped from the address bar.

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
  Watch 410×502). The toolbar pill drops the project's sizes in the reference's
  order — Apple phones, iPads, then Android — with the active one in bold and an
  *Add more sizes* row opening the Output Sizes sheet. Picking one re-renders
  every screen at that aspect ratio with the matching device frame, and the
  choice autosaves. The menu is portalled out of the toolbar, which scrolls
  horizontally and would otherwise clip it.
- **Direct selection** — hovering any element on a screenshot outlines it with a
  dashed rectangle; clicking it selects the screenshot, opens the panel and
  expands that element's own section (the selected element keeps an indigo
  dashed outline). Opening a section scrolls only the panel: `scrollIntoView`
  walks every scrollable ancestor, which used to drag the horizontal strip
  sideways and make the canvas jump.
- **Edits repaint one screen.** Every change produces a new project object, but
  a repaint is a full store-resolution draw, so the canvas keys off its own
  screen plus the project-wide styling that reaches it rather than the whole
  project.
- **Per-element panels** carry the reference's controls, and every property a
  captured design stores is reachable from them:
  - *Title* — Include Subtitle, Floating position, the bold/italic/underline/
    colour/gradient/align/line-spacing/text-background toolbar, Font Family,
    Decoration (all 20 shapes), letter spacing and max size, plus the
    subtitle's own font, colour, style and alignment.
  - *Device* — Device type (real / flat / dynamic frame / none), Device style,
    frame colour, orientation, Fit, Vertical position, Add screenshots, and the
    dynamic frame's own colour, width, padding and padding colour.
  - *Image* — a transparency-checkered preview of the artwork, Fit, Vertical
    position, and the reference's SVG style split into an independent **colour
    overlay** and **border / stroke**, each none / solid / gradient.
  - *Shape* — shape kind, corner radius or line direction, and fill and border
    as colour or gradient.
  - *Background* — Panoramic, the none/solid/gradient styles with colours and
    angle, Select Background with its fit, and Pattern.
  - Every element also has working opacity, rotation and exact-dimension
    controls in its row.
- **Globals** — the toolbar's Globals sheet sets the project-wide title and
  subtitle fonts, background and accent colour; captions authored with the
  "Global" font follow them.
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

All 175 designs are captured from the reference, so a copied template opens as
the design it actually is — its own captions, fonts, colours, per-screen
backgrounds, decoration artwork, device placement and rotation.

`server/tools/capture-all.mjs` drives the reference's own *Start with Template →
Copy Template to Sandbox* flow in a headless Chrome and reads back the
`scenes/<ref>` document the app loads to perform the copy. That document arrives
over Firestore's streaming Listen channel, so it is picked up by hooking
`JSON.parse` in the page — response hooks never fire on a channel that stays
open. Each screenshot's layers travel as a deflate-compressed base64 blob
(`layersc`) which is inflated in Node.

```bash
node tools/capture-all.mjs              # every template still missing
node tools/capture-all.mjs --force      # re-capture everything
node tools/capture-all.mjs tRiGP Er5lI  # just these
```

Artwork is not copied: decoration SVGs and app screens are recorded as the
storage path the reference serves them from, and fetched at draw time (they are
public and CORS-open, so the export canvas stays untainted).

`server/tools/compare-fidelity.mjs` scores the result — it renders every screen
in the local sandbox and compares it against the reference's own preview image
for that screenshot on a coarse colour grid.

```bash
node tools/compare-fidelity.mjs         # a sample of templates
node tools/compare-fidelity.mjs --all
```

Those preview images are rendered when a template is published and can lag the
live design, so a low score is not automatically a rendering bug.
`server/tools/reference-shot.mjs` settles it by screenshotting the reference's
own sandbox for one template:

```bash
node tools/reference-shot.mjs finance gKKu0 /tmp/reference.png
```

Templates whose capture is missing still copy — they fall back to a generated
starter layout that keeps the template's palette, orientation and shot count.

## Known gaps

- **Perspective-warped devices render flat.** `warpleft` / `warpright` (29
  elements across the set) use their own frame photograph but are not skewed.
- Sizes the reference has no frame photograph for — Apple Vision Pro and the
  Google Play feature graphic — stay frameless, as they do upstream.
- **Caption decorations are rebuilt, not copied.** Laurels, badges, bubbles and
  the rest are redrawn to the reference's silhouettes rather than shipped as its
  vector set, so they read the same at a glance but are not identical curves.
- Text rasterises differently from the reference's own renderer, so line breaks
  can fall a word earlier or later on a very tight caption.
- `compare-fidelity.mjs` compares against a fixed grid, so it under-scores
  templates whose output aspect differs from the preview image — the Apple
  Watch ones especially.
- No authentication: "Copy to Account" marks the project as kept and scopes it
  to a per-browser key rather than a real login.
- `/` redirects to `/templates`; the marketing home page, `/pricing`, `/blog`
  and the account area are outside this build.
