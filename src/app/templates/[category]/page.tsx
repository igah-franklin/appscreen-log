import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { TemplateCatalog } from "@/components/template-catalog";
import { FaqSection } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/data/categories";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/templates/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG.get(category);
  if (!cat) return {};
  return {
    title: `AppScreens: ${cat.heading} for App Store & Google Play`,
    description: cat.description,
  };
}

/** Splits "Books App Screenshot Templates" into lead + violet accent word. */
function splitHeading(heading: string) {
  const marker = " Templates";
  if (heading.endsWith(marker)) {
    return {
      lead: heading.slice(0, -marker.length),
      accent: "Templates",
    };
  }
  return { lead: heading, accent: "" };
}

export default async function CategoryPage({
  params,
}: PageProps<"/templates/[category]">) {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG.get(category);
  if (!cat) notFound();

  const { lead, accent } = splitHeading(cat.heading);
  const href = `/templates/${cat.slug}`;

  return (
    <>
      <div className="body-wrap">
        <Hero
          titleLead={lead}
          titleAccent={accent}
          description={cat.description}
          crumbs={[
            { label: "Screenshot Templates", href: "/templates" },
            { label: cat.group },
            { label: cat.label },
          ]}
        />
        <div className="site-content bg-white">
          <TemplateCatalog activeHref={href} members={cat.members} />
        </div>
      </div>
      <FaqSection />
      <SiteFooter />
    </>
  );
}
