import Link from "next/link";
import { previewSrcSet, previewUrl } from "@/lib/images";

export type Crumb = { label: string; href?: string };

const HERO_PROJECT = "6qJSTiNolUMvFoUpnbOh";

export function Hero({
  titleLead,
  titleAccent,
  description,
  crumbs,
}: {
  titleLead: string;
  titleAccent: string;
  description: string;
  crumbs: Crumb[];
}) {
  return (
    <main className="site-content relative isolate">
      <div className="isolate bg-zinc-900">
        <section className="relative">
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/home/hero-space-waves.webp"
              width={2592}
              height={1121}
              fetchPriority="low"
              alt=""
              className="pointer-events-none absolute inset-x-0 -top-80 bottom-0 -z-20 h-[calc(100%_+_320px)] w-full select-none object-cover opacity-60 lg:opacity-90 xl:opacity-100"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/home/space-spotlight-3.png"
              width={1152}
              height={1066}
              fetchPriority="low"
              alt=""
              className="pointer-events-none absolute left-1/2 top-0 -z-20 h-auto w-full max-w-5xl -translate-x-1/2 select-none object-contain opacity-60 sm:opacity-70"
            />

            <div className="mx-auto w-full max-w-[1280px] px-5 pb-8 pt-20 sm:px-6 sm:pb-10 lg:px-8 lg:pb-14 lg:pt-28 xl:pb-16">
              <div className="relative z-10 mx-auto max-w-lg sm:max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-12 lg:items-start lg:gap-x-8 xl:grid-cols-2 xl:gap-x-12 2xl:gap-x-20">
                <div className="lg:col-span-7 xl:col-span-1">
                  <nav aria-label="Breadcrumb" className="mb-5 overflow-x-auto">
                    <ol className="flex flex-wrap items-center gap-2 text-sm">
                      {crumbs.map((c, i) => (
                        <li key={`${c.label}-${i}`} className="contents">
                          {i > 0 && (
                            <span className="text-violet-200/30">/</span>
                          )}
                          {c.href ? (
                            <Link
                              href={c.href}
                              className="font-medium text-zinc-300 hover:text-violet-100"
                            >
                              {c.label}
                            </Link>
                          ) : (
                            <span
                              aria-current={
                                i === crumbs.length - 1 ? "page" : undefined
                              }
                              className={
                                i === crumbs.length - 1
                                  ? "font-medium text-violet-100"
                                  : "font-medium text-zinc-300"
                              }
                            >
                              {c.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>

                  <h1 className="leading-extratight relative z-10 text-4xl font-bold text-violet-100 sm:text-[2.75rem] lg:text-5xl">
                    {titleLead}{" "}
                    <span className="relative inline-block text-nowrap">
                      <span className="relative z-10 bg-gradient-to-b from-violet-400 via-violet-400 to-violet-500 bg-clip-text text-transparent">
                        {" "}
                        {titleAccent}{" "}
                      </span>
                    </span>
                  </h1>

                  <p className="text-lg leading-8 text-zinc-300">
                    {" "}
                    {description}{" "}
                  </p>
                </div>

                <div className="mt-5 lg:col-span-5 lg:-mb-56 lg:mt-0 xl:col-span-1 xl:-mb-64">
                  <div className="lg:ml-auto lg:mt-2 lg:max-w-none">
                    <div className="flex justify-center lg:translate-y-10 lg:justify-end">
                      <div className="shadow-inner-blur relative inline-flex max-h-[calc(100svh_-_13rem)] max-w-[calc(100vw_-_2rem)] items-center justify-center overflow-hidden rounded-2xl border border-violet-200/[.08] bg-white/[.01] p-2 transition-transform duration-300 ease-out hover:-translate-y-6 sm:max-h-[30rem] lg:max-h-[calc(100svh_-_14rem)] xl:max-h-[38rem]">
                        <div className="blur-4xl pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-b from-[#575EFF]/20 to-[#E478FF]/20 opacity-70" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          decoding="async"
                          className="relative h-auto max-h-[calc(100svh_-_14rem)] max-w-full rounded-lg object-contain sm:max-h-[29rem] lg:max-h-[calc(100svh_-_15rem)] xl:max-h-[37rem]"
                          alt="App screenshot template preview"
                          sizes="(min-width: 1280px) 44rem, (min-width: 1024px) 34rem, calc(100vw - 2rem)"
                          srcSet={previewSrcSet(
                            HERO_PROJECT,
                            1,
                            [320, 480, 640, 768, 960, 1200, 1440],
                          )}
                          src={previewUrl(HERO_PROJECT, 1, 960)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
