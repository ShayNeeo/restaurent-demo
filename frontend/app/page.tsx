import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { GallerySection } from "@/components/GallerySection";
import { HeroSection } from "@/components/HeroSection";
import { MenuPreview } from "@/components/MenuPreview";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { VisitSection } from "@/components/VisitSection";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <MenuPreview />
        <GallerySection />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}

