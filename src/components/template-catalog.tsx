"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TEMPLATES, type Template } from "@/data/templates";
import { APP_STORE_CATEGORIES, STORE_AND_DEVICE } from "@/lib/site";
import { TemplateCard } from "./template-card";
import {
  ArrowDownIcon,
  CalendarViewWeekIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  XMarkIcon,
} from "./icons";

const PAGE_SIZE = 50;

type Orientation = "portrait" | "landscape";
type Theme = "light" | "dark" | "colourful";

const ORIENTATIONS: { label: string; value: Orientation }[] = [
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" },
];

const THEMES: { label: string; value: Theme }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Colourful", value: "colourful" },
];

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold duration-200 ease-in-out hover:text-white ${
        active
          ? "shadow-inner-blur-light bg-violet-400/40 text-white"
          : "bg-white/10 text-violet-50 hover:bg-white/[.14]"
      }`}
    >
      {" "}
      {label}{" "}
    </button>
  );
}

function Group({
  title,
  defaultOpen = false,
  maxHeight,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  maxHeight: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="relative z-10 pt-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-xs font-bold uppercase tracking-wider text-violet-100/75 duration-200 ease-in-out hover:text-violet-50 focus:outline-hidden"
      >
        <span>{title}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-violet-100">
          {open ? (
            <MinusIcon className="h-3.5 w-3.5" />
          ) : (
            <PlusIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      <div
        style={{ maxHeight: open ? maxHeight : 0 }}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function TemplateCatalog({
  activeHref = "/templates",
  members,
}: {
  activeHref?: string;
  /** Template ids the current category is scoped to; undefined = all templates. */
  members?: string[];
}) {
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState<Orientation | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [simpleOnly, setSimpleOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const hasFilters =
    !!orientation || !!theme || freeOnly || simpleOnly || query.trim() !== "";

  const pool = useMemo(() => {
    if (!members) return TEMPLATES;
    const allowed = new Set(members);
    return TEMPLATES.filter((t) => allowed.has(t.id));
  }, [members]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((t: Template) => {
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (freeOnly && !t.free) return false;
      if (simpleOnly && !t.simple) return false;
      if (orientation && !t.orientation.includes(orientation)) return false;
      if (theme && !t.theme.includes(theme)) return false;
      return true;
    });
  }, [pool, query, orientation, theme, freeOnly, simpleOnly]);

  /*
   * The reference collapses a facet group to just "All" + the chosen value once
   * something is selected; otherwise it lists every value with matches left.
   */
  const availableOrientations = useMemo(() => {
    if (orientation) return ORIENTATIONS.filter((o) => o.value === orientation);
    const scoped = pool.filter((t) => {
      const q = query.trim().toLowerCase();
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (freeOnly && !t.free) return false;
      if (simpleOnly && !t.simple) return false;
      if (theme && !t.theme.includes(theme)) return false;
      return true;
    });
    return ORIENTATIONS.filter((o) =>
      scoped.some((t) => t.orientation.includes(o.value)),
    );
  }, [pool, query, freeOnly, simpleOnly, theme, orientation]);

  const availableThemes = useMemo(() => {
    if (theme) return THEMES.filter((o) => o.value === theme);
    const scoped = pool.filter((t) => {
      const q = query.trim().toLowerCase();
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (freeOnly && !t.free) return false;
      if (simpleOnly && !t.simple) return false;
      if (orientation && !t.orientation.includes(orientation)) return false;
      return true;
    });
    return THEMES.filter((o) => scoped.some((t) => t.theme.includes(o.value)));
  }, [pool, query, freeOnly, simpleOnly, orientation, theme]);

  const reset = () => {
    setOrientation(null);
    setTheme(null);
    setFreeOnly(false);
    setSimpleOnly(false);
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  const shown = results.slice(0, visible);
  const remaining = results.length - shown.length;

  const groupLinkClass = (href: string) =>
    `group relative z-10 block text-nowrap rounded-lg px-3 py-2 text-sm font-medium duration-200 ease-in-out hover:shadow-inner-blur-light hover:bg-white/[.04] hover:text-white ${
      activeHref === href ? "bg-violet-400/10 text-violet-300" : "text-violet-50"
    }`;

  const counterLabel =
    hasFilters || members
      ? `${results.length} of ${TEMPLATES.length}`
      : `${TEMPLATES.length} templates`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div>
        {/* Horizontal group nav (below lg) */}
        <nav className="-mx-4 flex items-center gap-2 overflow-x-auto bg-shell px-4 pb-4 pt-3 sm:-mx-6 sm:px-6 lg:hidden">
          <Link
            href="/templates"
            className={`inline-flex shrink-0 rounded-full border duration-200 ease-in-out ${
              activeHref === "/templates"
                ? "shadow-inner-blur-light border-violet-300/20 bg-violet-400/20"
                : "border-violet-200/[.08] bg-white/[.08] hover:bg-white/[.12]"
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-violet-50">
              <span>All templates</span>
            </span>
          </Link>
          {[...APP_STORE_CATEGORIES, ...STORE_AND_DEVICE].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`inline-flex shrink-0 rounded-full border duration-200 ease-in-out ${
                activeHref === c.href
                  ? "shadow-inner-blur-light border-violet-300/20 bg-violet-400/20"
                  : "border-violet-200/[.08] bg-white/[.08] hover:bg-white/[.12]"
              }`}
            >
              <span className="rounded-full px-4 py-1.5 text-sm font-medium text-violet-50">
                {c.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-0 lg:bg-shell">
          {/* Sidebar */}
          <aside className="-ml-8 -mt-px hidden bg-shell pl-8 lg:block">
            <div className="sticky top-0 max-h-screen overflow-y-auto pb-6">
              <nav
                aria-label="Template groups"
                className="relative z-20 space-y-0.5 px-5 pb-3 pt-6 backdrop-blur-lg"
              >
                <Link
                  href="/templates"
                  className={`group relative z-10 mt-12 block text-nowrap rounded-lg px-3 py-2 text-sm font-medium duration-200 ease-in-out hover:shadow-inner-blur-light hover:bg-white/[.04] hover:text-white ${
                    activeHref === "/templates"
                      ? "bg-violet-400/10 text-violet-300"
                      : "text-violet-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>All templates</span>
                  </span>
                </Link>

                <Group title="App Store Categories" maxHeight={960}>
                  {APP_STORE_CATEGORIES.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={groupLinkClass(c.href)}
                    >
                      {" "}
                      {c.label}{" "}
                    </Link>
                  ))}
                </Group>

                <Group title="Store and device" maxHeight={960}>
                  {STORE_AND_DEVICE.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={groupLinkClass(c.href)}
                    >
                      {" "}
                      {c.label}{" "}
                    </Link>
                  ))}
                </Group>

                <Group title="Filters" defaultOpen maxHeight={460}>
                  <label className="group mt-2 flex cursor-pointer items-center gap-3 py-2 text-sm font-medium text-violet-50 duration-200 ease-in-out hover:text-white">
                    <input
                      type="checkbox"
                      checked={freeOnly}
                      onChange={(e) => {
                        setFreeOnly(e.target.checked);
                        setVisible(PAGE_SIZE);
                      }}
                      className="h-4 w-4 rounded border-violet-200/[.18] bg-white/10 text-violet-400 focus:ring-violet-300"
                    />
                    <span>Free templates</span>
                  </label>

                  <p className="mb-2.5 mt-4 text-xs font-bold uppercase tracking-wider text-violet-100/75">
                    Skill
                  </p>
                  <label className="group flex cursor-pointer items-center gap-3 py-2 text-sm font-medium text-violet-50 duration-200 ease-in-out hover:text-white">
                    <input
                      type="checkbox"
                      checked={simpleOnly}
                      onChange={(e) => {
                        setSimpleOnly(e.target.checked);
                        setVisible(PAGE_SIZE);
                      }}
                      className="h-4 w-4 rounded border-violet-200/[.18] bg-white/10 text-violet-400 focus:ring-violet-300"
                    />
                    <span>Simple only</span>
                  </label>

                  <p className="mb-2.5 mt-4 text-xs font-bold uppercase tracking-wider text-violet-100/75">
                    Orientation
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orientation && (
                      <FilterPill
                        label="All"
                        active={false}
                        onClick={() => {
                          setOrientation(null);
                          setVisible(PAGE_SIZE);
                        }}
                      />
                    )}
                    {availableOrientations.map((o) => (
                      <FilterPill
                        key={o.value}
                        label={o.label}
                        active={orientation === o.value}
                        onClick={() => {
                          setOrientation(o.value);
                          setVisible(PAGE_SIZE);
                        }}
                      />
                    ))}
                  </div>

                  <p className="mb-2.5 mt-4 text-xs font-bold uppercase tracking-wider text-violet-100/75">
                    Theme
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {theme && (
                      <FilterPill
                        label="All"
                        active={false}
                        onClick={() => {
                          setTheme(null);
                          setVisible(PAGE_SIZE);
                        }}
                      />
                    )}
                    {availableThemes.map((o) => (
                      <FilterPill
                        key={o.value}
                        label={o.label}
                        active={theme === o.value}
                        onClick={() => {
                          setTheme(o.value);
                          setVisible(PAGE_SIZE);
                        }}
                      />
                    ))}
                  </div>
                </Group>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={reset}
                    className="relative z-10 mt-6 inline-flex items-center gap-2 py-2 text-sm font-medium text-violet-300 duration-200 ease-in-out hover:text-violet-100 focus:outline-hidden"
                  >
                    <XMarkIcon className="h-3 w-3 leading-none" />
                    <span>Clear filters</span>
                  </button>
                )}
              </nav>
            </div>
          </aside>

          {/* Catalog */}
          <section className="min-w-0 bg-white">
            <h2 className="sr-only">Template catalog</h2>
            <header
              id="sticky-header"
              className="sticky top-0 z-40 -mx-4 mb-6 bg-shell px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-ml-px lg:-mr-8 lg:-mt-px lg:px-5 lg:pr-8"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <nav
                  aria-label="Template filters"
                  className="flex gap-2 overflow-x-auto pb-1 xl:pb-0"
                >
                  <button
                    type="button"
                    className="flex flex-shrink-0 items-center rounded-full bg-white/0 px-3 py-2 text-sm font-medium !text-violet-50 hover:bg-white/10"
                  >
                    <CalendarViewWeekIcon className="h-6 w-6 !text-violet-100" />
                    <span>&nbsp;{counterLabel}</span>
                  </button>
                </nav>
                <div className="w-full xl:max-w-xs">
                  <div className="group relative flex w-full rounded-full bg-white/20 text-violet-100 duration-200 ease-in-out focus-within:bg-white focus-within:text-gray-500">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <SearchIcon className="h-5 w-5" />
                    </div>
                    <input
                      placeholder="Search"
                      id="search"
                      type="search"
                      name="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setVisible(PAGE_SIZE);
                      }}
                      className="block w-full rounded-full bg-transparent py-2 pl-11 pr-12 text-sm text-white placeholder:text-violet-50 focus:text-gray-900 focus:outline-hidden focus:placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </header>

            <div className="scroll-mt-24 pb-6 lg:pl-5">
              <div className="grid grid-cols-1 gap-5 3xl:grid-cols-2">
                {shown.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>

              {remaining > 0 && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="btn-link btn-secondary inline-flex items-center gap-2"
                  >
                    <ArrowDownIcon className="h-3 w-3 leading-none" />
                    <span>Load more templates</span>
                    <span>({remaining} remaining)</span>
                  </button>
                </div>
              )}

              {results.length === 0 && (
                <p className="py-16 text-center text-sm font-medium text-gray-500">
                  No templates match your search.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
