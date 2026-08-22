import Link from "next/link";
import { Logo } from "./logo";
import {
  BlogIcon,
  FacebookIcon,
  FooterAppIcon,
  FooterLegalIcon,
  FooterProductIcon,
  FooterResourcesIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";
import { FOOTER_COLUMNS } from "@/lib/site";

const COLUMN_ICONS = {
  app: FooterAppIcon,
  product: FooterProductIcon,
  resources: FooterResourcesIcon,
  legal: FooterLegalIcon,
};

export function SiteFooter({
  ctaLead = "Start with",
  ctaAccent = "this",
  ctaTail = "template library",
  ctaBody = "Choose a responsive AppScreens template, add your app screens, and export store-ready App Store and Google Play screenshots from one design.",
}: {
  ctaLead?: string;
  ctaAccent?: string;
  ctaTail?: string;
  ctaBody?: string;
} = {}) {
  return (
    <section className="isolate overflow-hidden bg-zinc-900">
      <div className="mx-auto h-[0.75px] w-full max-w-screen-lg bg-gradient-to-r from-transparent via-violet-100/15 to-transparent" />

      {/* Closing call to action */}
      <div className="relative">
        <div className="mx-auto w-full max-w-screen-xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="leading-extratight max-w-5xl text-center text-4xl font-bold text-violet-100 sm:text-5xl sm:leading-tight">
              {ctaLead}{" "}
              <span className="relative inline-block text-nowrap">
                <span className="relative z-10 bg-gradient-to-b from-violet-400 via-violet-400 to-violet-500 bg-clip-text text-transparent">
                  {" "}
                  {ctaAccent}{" "}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-px left-0 -z-10 select-none text-violet-300"
                >
                  {" "}
                  {ctaAccent}{" "}
                </span>
              </span>{" "}
              {ctaTail}
            </h2>
            <p className="mt-5 max-w-xl whitespace-pre-line text-center text-[17px] leading-8 text-zinc-200 sm:text-lg sm:leading-8">
              {ctaBody}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-3 sm:space-x-5">
              <button
                type="button"
                className="bg-btn-primary shadow-btn-primary group relative inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-violet-50 antialiased outline-hidden after:absolute after:inset-0 after:h-full after:w-full after:rounded-lg after:opacity-0 after:transition-all after:duration-200 after:content-[''] after:[background-image:var(--background-image-btn-primary-hover)] after:[box-shadow:var(--shadow-btn-primary-hover)] hover:after:opacity-100 sm:px-4 sm:py-2.5 sm:text-[15px]"
              >
                <div className="relative z-10 flex w-full items-center justify-center space-x-2 text-nowrap">
                  Create screenshots in 5 mins
                </div>
              </button>
              <button
                type="button"
                className="group inline-flex cursor-pointer items-center overflow-hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-violet-50 antialiased outline-hidden hover:text-white sm:px-4 sm:py-2.5 sm:text-[15px]"
              >
                <div className="relative z-10 flex w-full items-center justify-center space-x-2 text-nowrap">
                  <span>Request a template</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[.07] transition duration-200 ease-in-out group-hover:bg-white/10">
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/home/space-spotlight-1200w.webp"
          width={1200}
          height={1093}
          loading="lazy"
          decoding="async"
          alt=""
          className="absolute -bottom-3/4 left-1/2 h-auto max-w-3xl -translate-x-1/2 object-contain opacity-90 sm:max-w-4xl md:-bottom-full lg:-bottom-[135%] lg:max-w-7xl"
        />
      </div>

      {/* Arched footer plate */}
      <div className="relative left-1/2 top-2 w-[350%] -translate-x-1/2 rounded-t-[100%] bg-gradient-to-r from-transparent via-violet-100/15 to-transparent p-[0.5px] sm:w-[250%] md:top-4 md:w-[200%] lg:top-10 lg:w-[150%] xl:w-[125%]">
        <div className="h-full w-full rounded-t-[100%] bg-[linear-gradient(rgba(24,24,27,0.9),rgba(24,24,27,0.9)),linear-gradient(#2E1065,#2E1065)] pb-16 pt-24 sm:pt-28 md:pt-32 lg:pt-40">
          <div className="mx-auto w-screen">
            <div className="mx-auto max-w-lg px-5 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-screen-xl lg:px-8">
              <div className="grid grid-cols-2 gap-12 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 lg:gap-8">
                {FOOTER_COLUMNS.map((col) => {
                  const Icon = COLUMN_ICONS[col.icon];
                  return (
                    <div key={col.title} className="flex lg:justify-center">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5" />
                          <span className="mb-0 ml-4 block text-sm font-semibold text-zinc-400">
                            {col.title}
                          </span>
                        </div>
                        <div className="mt-6 flex items-start">
                          <div className="relative flex h-full w-5 justify-center">
                            <div className="absolute -inset-y-2 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-violet-200/[0.12] to-violet-200/[0.04]" />
                          </div>
                          <ul className="ml-4 space-y-5">
                            {col.links.map((link) => (
                              <li
                                key={link.label}
                                className="group relative flex items-center"
                              >
                                <Link
                                  href={link.href}
                                  target={link.external ? "_blank" : undefined}
                                  rel={link.external ? "noopener" : undefined}
                                  className="text-sm font-semibold leading-none text-violet-50 hover:text-violet-400/95"
                                >
                                  {link.label}
                                  {link.badge && (
                                    <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                                <span className="absolute -inset-y-1.5 -left-[26.5px] w-px bg-gradient-to-b from-violet-400/0 via-violet-400/90 to-violet-400/0 opacity-0 duration-200 ease-in-out group-hover:opacity-100" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="shadow-inner-blur mt-16 block w-full rounded-2xl bg-zinc-950/[.01] sm:mt-24">
                <div className="flex w-full flex-col items-center justify-between gap-6 rounded-2xl border border-violet-200/[.06] px-6 py-4 sm:flex-row sm:gap-8 sm:px-8 sm:py-6">
                  <Link href="/" className="logo" aria-label="AppScreens home">
                    <Logo width="190px" color="#ffffff" />
                  </Link>
                  <div className="flex items-center space-x-10">
                    <Link
                      href="/blog"
                      target="_blank"
                      rel="noopener"
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <BlogIcon className="h-6 w-6" />
                    </Link>
                    <a
                      href="https://www.facebook.com/AppScreens"
                      target="_blank"
                      rel="noopener"
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <FacebookIcon className="h-6 w-6" />
                    </a>
                    <a
                      href="https://x.com/AppScreens"
                      target="_blank"
                      rel="noopener"
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <XIcon className="h-6 w-6" />
                    </a>
                    <a
                      href="https://www.youtube.com/@appscreens"
                      target="_blank"
                      rel="noopener"
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <YouTubeIcon className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>

              <p className="mt-10 text-center text-[15px] text-zinc-400/90 sm:mt-12">
                © 2026 AppScreens, a registered business name of{" "}
                <a
                  href="https://saltybytes.com.au"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-zinc-200"
                >
                  Salty Bytes Pty Ltd
                </a>
                . All rights reserved | v1.1.237
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
