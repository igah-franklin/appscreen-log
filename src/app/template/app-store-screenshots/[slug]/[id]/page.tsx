import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES } from "@/data/templates";
import { previewSrcSet, previewUrl } from "@/lib/images";
import {
  TEMPLATE_BY_ID,
  orientationLabel,
  relatedTemplates,
  templateDescription,
  templateOutputs,
  templateTags,
} from "@/lib/template-detail";
import { StartWithTemplate } from "@/components/start-with-template";
import { ShareRow } from "@/components/share-row";
import { SiteFooter } from "@/components/site-footer";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug, id: t.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/template/app-store-screenshots/[slug]/[id]">): Promise<Metadata> {
  const { id } = await params;
  const t = TEMPLATE_BY_ID.get(id);
  if (!t) return {};
  return {
    title: `screenKit: App Store Template | ${t.name}`,
    description: templateDescription(t),
  };
}

function Chevron({ className }: { className: string }) {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
    </svg>
  );
}

export default async function TemplateDetailPage({
  params,
}: PageProps<"/template/app-store-screenshots/[slug]/[id]">) {
  const { id, slug } = await params;
  const t = TEMPLATE_BY_ID.get(id);
  if (!t || t.slug !== slug) notFound();

  const tags = templateTags(t);
  const outputs = templateOutputs(t);
  const related = relatedTemplates(t);
  const shots = Array.from({ length: t.shots }, (_, i) => i + 1);
  const url = `https://appscreens.com/template/app-store-screenshots/${t.slug}/${t.id}`;

  return (
    <>
    <main className="pt-10 sm:pt-16">
      <nav aria-label="Breadcrumb">
        <ol className="mx-auto flex max-w-2xl flex-col items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:flex-row lg:px-8">
          <li>
            <div className="flex items-center">
              <Link href="/" className="mr-2 text-sm font-medium text-gray-900">
                Home
              </Link>
              <Chevron className="h-5 w-4 text-gray-300" />
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <Link
                href="/templates"
                className="mr-2 text-sm font-medium text-gray-900"
              >
                Templates
              </Link>
              <Chevron className="h-5 w-4 text-gray-300" />
            </div>
          </li>
          <li className="text-sm">
            <div className="flex items-center">
              <span
                aria-current="page"
                className="mr-2 font-medium text-gray-500 hover:text-gray-600"
              >
                {t.name}
              </span>
              <Chevron className="h-5 w-4 text-gray-100" />
            </div>
          </li>
        </ol>
      </nav>

      {/* screenshot rail */}
      <div className="mx-auto mt-6 w-full sm:px-6">
        <div className="scrollable-x very-scrollable overflow-x-scroll pb-1">
          <div className="mx-auto flex w-max gap-1">
            {shots.map((n) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={n}
                loading={n <= 3 ? "eager" : "lazy"}
                className="inline-block h-[520px] w-auto max-w-none rounded-lg shadow"
                alt={`${t.name}: Screenshot ${n}`}
                sizes="300px"
                srcSet={previewSrcSet(t.project, n, [300, 600, 900])}
                src={previewUrl(t.project, n, 600)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pt-16">
        <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <div className="flex min-w-0 items-center gap-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t.name} App Store Screenshot Template
            </h1>
          </div>
          <div className="mt-4 flex flex-row flex-wrap space-x-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="mx-1 my-1 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10"
              >
                {" "}
                {tag}{" "}
              </div>
            ))}
          </div>
        </div>

        {/* right rail */}
        <div className="mt-4 lg:row-span-3 lg:mt-0">
          <h2 className="sr-only">Template information</h2>
          <div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Specifications
                </h3>
              </div>
              <fieldset className="mt-2">
                <ul className="list-disc space-y-2 pl-4 text-sm">
                  {[
                    "Fully customisable",
                    `${t.shots} screenshots`,
                    `${outputs.length}+ device outputs`,
                    orientationLabel(t),
                    "1 language configured",
                    "Last updated 8 Jun 2026",
                  ].map((spec) => (
                    <li key={spec} className="text-gray-400">
                      <h4 className="m-0 font-normal text-gray-600">{spec}</h4>
                    </li>
                  ))}
                </ul>
              </fieldset>
            </div>
            <div className="mt-10">
              <StartWithTemplate templateId={t.id} />
            </div>
          </div>

          <section className="mt-10 border-t border-gray-200 pt-5">
            <h2 className="text-sm font-medium text-gray-900">
              Share template
            </h2>
            <ShareRow name={t.name} url={url} />
          </section>
        </div>

        {/* about */}
        <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pr-8 lg:pt-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              About this template
            </h2>
            <div className="space-y-6">
              <p className="text-base text-gray-900">
                {templateDescription(t)}
              </p>
              <p className="text-sm text-gray-600">
                Customize this template with your own app screens, captions,
                colors, and device frames. screenKit keeps the layout
                responsive, so you can create store-ready screenshots for iOS
                and Android tablet and phone devices without maintaining
                duplicate design files.
              </p>
              <p className="text-sm text-gray-600">
                Browse{" "}
                <Link
                  href="/templates"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  all screenshot templates
                </Link>{" "}
                or{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  see all plans
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-start">
              <h3 className="text-sm font-medium text-gray-900">
                Screenshot dimensions
              </h3>
              <span className="w-20" />
              <a
                href="https://help.appscreens.com/getting-started/what-app-stores-can-i-create-screenshots-for"
                target="_blank"
                rel="noopener"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Which do I need?
              </a>
            </div>
            <div className="mt-4">
              <ul className="list-disc space-y-2 pl-4 text-sm">
                {outputs.map((o) => (
                  <li key={o.id} className="text-gray-400">
                    <h4 className="m-0 inline font-normal text-gray-600">
                      {" "}
                      {o.label} ({o.width}x{o.height}px){" "}
                    </h4>
                  </li>
                ))}
                <li className="text-gray-400">
                  <Link
                    href="/user/sandbox"
                    className="cursor-pointer text-indigo-700 underline decoration-dotted"
                  >
                    {" "}
                    Add any size or device{" "}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2
            id="related-products-heading"
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            More templates
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/template/app-store-screenshots/${r.slug}/${r.id}`}
                className="group relative block transform cursor-pointer transition-transform duration-500 ease-in-out hover:-translate-y-2"
              >
                <div className="aspect-[2/1] w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full"
                    alt={`${r.name} App Store Screenshot Template`}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    srcSet={previewSrcSet(r.project, 0, [320, 640, 960])}
                    src={previewUrl(r.project, 0, 640)}
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <div className="flex items-center gap-x-2">
                      <h3 className="text-sm text-gray-700">{r.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
    <SiteFooter
      ctaLead="Start from"
      ctaAccent="this"
      ctaTail="template"
      ctaBody="Use this template as a shortcut: add your app screens, update the captions, then export store-ready sizes for App Store and Google Play."
    />
    </>
  );
}
