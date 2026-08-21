"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Template } from "@/data/templates";
import { previewSrcSet, previewUrl } from "@/lib/images";
import {
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  MenuGlyph,
  ShapesIcon,
} from "./icons";

const CARD_MENU = [
  { label: "See more", icon: "layers" },
  { label: "Edit in Sandbox", icon: "shapes" },
  { label: "Copy to Account", icon: "clone" },
];

export function TemplateCard({ template }: { template: Template }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const href = `/template/app-store-screenshots/${template.slug}/${template.id}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="overflow-hidden rounded-lg bg-gray-50 p-4 shadow ring-1 ring-gray-200">
      <div className="flex flex-col items-center justify-between space-y-2 pb-3 sm:flex-row sm:space-x-2 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <div className="template-title-row flex min-w-0 items-center gap-x-2">
            <Link className="min-w-0" href={href}>
              <h2 className="mb-0 truncate text-xl font-bold text-gray-900">
                &nbsp;{template.name}
              </h2>
            </Link>
          </div>
        </div>
        <div className="flex space-x-5" ref={wrap}>
          <Link className="btn-link btn-success" href={href}>
            <ShapesIcon className="h-3.5 w-3.5 align-middle" />
            Start with Template
          </Link>
          <Link className="btn-link btn-secondary" href={href} target="_blank">
            <ExternalLinkIcon className="h-3.5 w-3.5 align-middle" />
            Preview
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-label={`More options for ${template.name}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="block text-gray-400 hover:text-gray-500"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            {open && (
              <div
                role="menu"
                className="absolute right-0 z-40 mt-1 min-w-[13rem] overflow-hidden rounded bg-white py-2 shadow-[0_2px_4px_-1px_rgba(0,0,0,.2),0_4px_5px_0_rgba(0,0,0,.14),0_1px_10px_0_rgba(0,0,0,.12)]"
              >
                {CARD_MENU.map((m) => (
                  <button
                    key={m.label}
                    role="menuitem"
                    type="button"
                    className="flex h-12 w-full items-center gap-3 px-4 text-left text-sm text-gray-900 hover:bg-black/[.04]"
                  >
                    <MenuGlyph name={m.icon} className="h-4 w-4 text-gray-600" />
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="scrollable-x very-scrollable mb-2 flex flex-row gap-1 overflow-x-scroll">
        {Array.from({ length: template.shots }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            aria-label={`Preview ${template.name} screenshot ${n + 1}`}
            href={href}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              className="inline-block h-[420px] max-w-none rounded-lg shadow"
              alt={`${template.name}: Screenshot ${n + 1}`}
              sizes="240px"
              srcSet={previewSrcSet(template.project, n, [240, 480, 720])}
              src={previewUrl(template.project, n, 480)}
            />
          </Link>
        ))}
      </div>

      <div className="mt-2 flex flex-row flex-wrap">
        <span className="btn-link btn-primary mr-2 mt-1 !text-black">
          Compatible with:
        </span>
      </div>
    </div>
  );
}
