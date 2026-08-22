# AppScreens Templates — clone

A pixel-accurate recreation of **https://appscreens.com/templates** built with
Next.js 16 (App Router) + Tailwind CSS v4.

## Running

```bash
npm run dev
```

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

## The editor

`/user/sandbox` is a working screenshot designer, not a mockup.

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
- **Export** — renders each screen to a canvas at full store resolution and
  downloads PNGs, either for the current size or every selected output size,
  with a progress readout.

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

## Known gaps

- The reference stores each template's layout as private project data, so
  *Start with Template* reproduces a template's shot count, orientation, theme
  palette and reference previews — not its exact per-screen artwork.
- Detail-page tags are derived from each template's category membership plus
  its skill and theme facets. The reference also carries a few hand-authored
  style tags ("multi layered", "gradient", "graphics") and a bespoke opening
  paragraph per template, which are not public data.
- `/` redirects to `/templates`; the marketing home page, `/pricing`, `/blog`
  and the account area are outside this build.
