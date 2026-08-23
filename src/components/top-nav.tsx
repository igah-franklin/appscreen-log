"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import {
  AccountCircleIcon,
  ChevronDownIcon,
  MenuGlyph,
} from "./icons";
import { ACCOUNT_MENU, HELP_MENU, type MenuItem } from "@/lib/site";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Sandbox", href: "/user/sandbox" },
  // { label: "Pricing", href: "/pricing" },
];

function MenuPanel({
  items,
  align = "right",
  className = "",
}: {
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      role="menu"
      className={`absolute z-50 mt-1 min-w-[15rem] overflow-hidden rounded bg-white py-2 text-gray-900 shadow-[0_2px_4px_-1px_rgba(0,0,0,.2),0_4px_5px_0_rgba(0,0,0,.14),0_1px_10px_0_rgba(0,0,0,.12)] ${align === "right" ? "right-0" : "left-0"
        } ${className}`}
    >
      {items.map((item) => {
        const content = (
          <>
            <MenuGlyph name={item.icon} className="h-4 w-4 shrink-0 text-gray-600" />
            <span>{item.label}</span>
          </>
        );
        const cls =
          "flex w-full items-center gap-3 px-4 py-0 h-12 text-left text-sm font-normal text-gray-900 hover:bg-black/[.04]";
        return item.href ? (
          <a
            key={item.label}
            role="menuitem"
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener" : undefined}
            className={cls}
          >
            {content}
          </a>
        ) : (
          <button key={item.label} role="menuitem" type="button" className={cls}>
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<null | "help" | "account" | "mobile">(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      ref={navRef}
      className="toolbar border-b border-violet-200/10 bg-zinc-900"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-stretch justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="logo" aria-label="screenKit home">
                <Logo width="190px" color="#ffffff" />
              </Link>
              <span className="flex-shrink flex-grow select-none text-white">
                &nbsp;
              </span>
            </div>
          </div>

          <div className="flex flex-shrink" />

          <div className="links hidden sm:ml-6 sm:block">
            <div className="flex space-x-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-btn hidden lg:inline-flex ${isActive(l.href) ? "bg-violet-500/15" : "hover:bg-white/[.06]"
                    }`}
                >
                  <span className="text-white">{l.label}</span>
                </Link>
              ))}
              <div className="relative hidden lg:inline-block">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open === "help"}
                  onClick={() => setOpen(open === "help" ? null : "help")}
                  className="nav-btn inline-flex hover:bg-white/[.06]"
                >
                  <span className="text-white">Help</span>
                </button>
                {open === "help" && <MenuPanel items={HELP_MENU} align="left" />}
              </div>
            </div>
          </div>

          <div className="links absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <span className="relative hidden md:inline-block">
              <button
                type="button"
                aria-label="account menu popover"
                aria-haspopup="menu"
                aria-expanded={open === "account"}
                onClick={() => setOpen(open === "account" ? null : "account")}
                className="nav-btn inline-flex items-center justify-center hover:bg-white/[.06]"
              >
                <AccountCircleIcon className="h-6 w-6 text-white" />
                <ChevronDownIcon className="h-6 w-6 text-white" />
              </button>
              {open === "account" && (
                <MenuPanel items={[...HELP_MENU, ...ACCOUNT_MENU]} />
              )}
            </span>
            <span className="relative block md:hidden">
              <button
                type="button"
                aria-label="mobile expand menu"
                aria-haspopup="menu"
                aria-expanded={open === "mobile"}
                onClick={() => setOpen(open === "mobile" ? null : "mobile")}
                className="nav-btn inline-flex items-center justify-center hover:bg-white/[.06]"
              >
                <span className="text-white">Menu</span>
                <ChevronDownIcon className="h-6 w-6 text-white" />
              </button>
              {open === "mobile" && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-1 min-w-[13rem] overflow-hidden rounded bg-white py-2 text-gray-900 shadow-[0_2px_4px_-1px_rgba(0,0,0,.2),0_4px_5px_0_rgba(0,0,0,.14),0_1px_10px_0_rgba(0,0,0,.12)]"
                >
                  {LINKS.map((l) => (
                    <Link
                      key={l.href}
                      role="menuitem"
                      href={l.href}
                      onClick={() => setOpen(null)}
                      className="flex h-12 w-full items-center px-4 text-sm text-gray-900 hover:bg-black/[.04]"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {["Help", "Account"].map((l) => (
                    <button
                      key={l}
                      role="menuitem"
                      type="button"
                      className="flex h-12 w-full items-center justify-between px-4 text-left text-sm text-gray-900 hover:bg-black/[.04]"
                    >
                      {l}
                      <ChevronDownIcon className="h-5 w-5 -rotate-90 text-gray-500" />
                    </button>
                  ))}
                </div>
              )}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
