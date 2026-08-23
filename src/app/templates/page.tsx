import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { TemplateCatalog } from "@/components/template-catalog";
import { FaqSection } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title:
    "screenKit: App Screenshot Templates for App Store & Google Play",
  description:
    "Browse app screenshot templates for App Store and Google Play. 150+ templates, 500+ editable layouts and 2,000+ store-ready output combinations.",
};

export default function TemplatesPage() {
  return (
    <>
      <div className="body-wrap">
        <Hero
          titleLead="App Screenshot"
          titleAccent="Templates"
          description="Browse app screenshot templates for App Store and Google Play. Start with a professionally designed layout, customize the text, images, colors, and device frames, then export store-ready screenshots for iPhone, iPad, and Android. 150+ templates. 500+ editable layouts. 2,000+ store-ready output combinations."
          crumbs={[{ label: "Screenshot Templates" }]}
        />
        <div className="site-content bg-white">
          <TemplateCatalog activeHref="/templates" />
        </div>
      </div>
      <FaqSection />
      <SiteFooter />
    </>
  );
}
