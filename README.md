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
- **FAQ** — nine independently expandable questions.
- **Footer** — closing CTA, arched gradient plate, four link columns, social
  row, and copyright line.

## Data

`src/data/templates.ts` holds all 175 templates (name, slug, project id,
screenshot count, orientation / theme / skill / free facets) and
`src/data/categories.ts` holds the per-category membership — all captured from
the live site.

Screenshot previews are loaded from the reference site's own image proxy
(`appscreens.com/img?src=…`), exactly as the original page does; the fonts
(`Geist Sans` / `Geist Mono`) and background art are self-hosted under
`public/assets`.

## Not in scope

`/template/app-store-screenshots/<slug>/<id>` detail pages are linked but not
implemented — the reference for this build was the templates listing page.
