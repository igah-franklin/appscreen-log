"use client";

import Link from "next/link";
import { useState } from "react";
import { FaqIcon, MinusIcon, PlusIcon } from "./icons";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What are app screenshot templates?",
    a: "150+ templates. 500+ editable layouts. 2,000+ store-ready output combinations. App screenshot templates are editable layouts for App Store and Google Play screenshots. In screenKit, templates include captions, device frames, backgrounds, and responsive sizing so you can customize once and export store-ready files.",
  },
  {
    q: "Do screenKit templates work for iPhone and Android?",
    a: "Yes. You can start from a template, add your app screens and captions, then export iPhone, iPad, Android phone, Android tablet, and Google Play-ready sizes from the same project.",
  },
  {
    q: "Can I customize the captions, devices, and colors?",
    a: "Yes. Templates are starting points. You can edit headline and subtitle copy, swap device frames, update screenshots, change colors, adjust backgrounds, and restyle layouts for different launch or test angles.",
  },
  {
    q: "Are there free app screenshot templates?",
    a: "Yes. screenKit includes free templates for getting started. Premium templates and paid plans are useful when you need more projects, localization, advanced design controls, and automatic store upload workflows.",
  },
  {
    q: "Do templates export App Store and Google Play sizes?",
    a: "Yes. screenKit templates use responsive layouts and export presets for App Store and Google Play screenshots, including common iOS, Android, tablet, and feature graphic assets.",
  },
  {
    q: "Can I localize screenshot templates for different markets?",
    a: "Yes. You can translate captions, adjust copy per locale, handle longer text, and keep the template layout consistent across localized App Store and Google Play screenshot sets.",
  },
  {
    q: "Do I need Figma, Canva, or design skills to use these templates?",
    a: (
      <>
        No. screenKit templates are built for app store screenshot workflows,
        so you can start from a finished layout, customize it in the browser,
        and export store-ready assets without rebuilding sizes manually in a
        general design tool. If you want the full workflow, use the{" "}
        <Link
          href="/"
          className="font-semibold text-violet-200 underline decoration-violet-400/60 underline-offset-4 hover:text-violet-100"
        >
          app screenshot generator
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I upload screenshots directly from a template to App Store Connect or Google Play?",
    a: (
      <>
        Yes. After customizing a template, you can export store-ready files or
        upload directly to App Store Connect and Google Play, including
        localized screenshot sets on supported plans. See{" "}
        <Link
          href="/pricing"
          className="font-semibold text-violet-200 underline decoration-violet-400/60 underline-offset-4 hover:text-violet-100"
        >
          screenKit pricing
        </Link>{" "}
        for plan details.
      </>
    ),
  },
  {
    q: "Do app screenshot templates improve conversion?",
    a: (
      <>
        Templates can help improve conversion by giving your screenshots clearer
        hierarchy, stronger benefit captions, and more consistent visual
        structure. Public ASO sources cite around 90% of users not scrolling
        past the third screenshot and a +11.8% median winning screenshot-test
        lift, so template hierarchy matters most in the first frames. Results
        still depend on your app, message, audience, and testing. For evidence,
        read the{" "}
        <Link
          href="/blog/why-aso-matters-ab-test-downloads"
          className="font-semibold text-violet-200 underline decoration-violet-400/60 underline-offset-4 hover:text-violet-100"
        >
          ASO testing guide
        </Link>
        .
      </>
    ),
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) =>
    setOpen((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]));

  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 py-20 sm:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/home/hero-space-waves.webp"
        width={2592}
        height={1121}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        alt=""
        className="pointer-events-none absolute inset-x-0 -top-80 -z-20 h-full w-full select-none object-cover opacity-60 lg:opacity-90 xl:opacity-100"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/home/space-spotlight-3.png"
        width={1152}
        height={1066}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        alt=""
        className="pointer-events-none absolute left-1/2 top-0 -z-20 h-auto w-full max-w-5xl -translate-x-1/2 select-none object-contain opacity-60 sm:opacity-70"
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="shadow-inner-blur inline-flex w-max rounded-full bg-zinc-950/[.01]">
              <div className="flex h-full w-full items-center space-x-2 rounded-full border border-violet-200/[.06] px-4 py-1.5">
                <FaqIcon className="h-3.5 w-3.5 text-violet-200" />
                <span className="text-sm font-medium text-violet-100 drop-shadow-[-12px_-4px_6px_rgba(237,233,254,0.2)]">
                  FAQs
                </span>
              </div>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-violet-100 sm:text-4xl lg:text-5xl">
              <span className="relative z-10">Frequently asked questions</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-200">
              Can&rsquo;t find the answer you&rsquo;re looking for? Reach out to
              our{" "}
              <Link
                href="/help"
                className="font-semibold text-violet-300 underline decoration-violet-400/60 underline-offset-4 hover:text-violet-200"
              >
                customer support
              </Link>{" "}
              team.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-4">
              {FAQS.map((faq, i) => {
                const isOpen = open.includes(i);
                return (
                  <div
                    key={faq.q}
                    className="shadow-inner-blur rounded-2xl border border-violet-200/[.08] bg-zinc-950/[.01] px-6 py-5"
                  >
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={`template-faq-question-${i}`}
                        aria-controls={`template-faq-answer-${i}`}
                        aria-expanded={isOpen}
                        onClick={() => toggle(i)}
                        className="flex w-full items-center justify-between gap-4 text-left text-violet-50"
                      >
                        <span className="text-base font-semibold leading-7 text-violet-100">
                          {faq.q}
                        </span>
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-200/20 bg-zinc-900/60 text-violet-200">
                          {isOpen ? (
                            <MinusIcon className="h-4 w-4" />
                          ) : (
                            <PlusIcon className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                    </h3>
                    <div
                      role="region"
                      id={`template-faq-answer-${i}`}
                      aria-labelledby={`template-faq-question-${i}`}
                      style={{ maxHeight: isOpen ? 1024 : 0 }}
                      className={`overflow-hidden pr-6 text-sm leading-7 text-zinc-300 transition-all duration-300 ease-in-out ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="pt-2 text-base">{faq.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
