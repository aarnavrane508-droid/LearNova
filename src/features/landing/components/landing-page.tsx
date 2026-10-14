import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "./hero-section";
import { ExperienceSection } from "./experience-section";
import { LearningLoopSection } from "./learning-loop-section";
import { RoadmapSection } from "./roadmap-section";

export function LandingPage() {
  return (
    <div id="top">

      <a href="#main-content" className="sr-only z-50 rounded-lg bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>

      <SiteHeader />

      <main id="main-content">

        <HeroSection />

        <div className="border-y bg-secondary/50">
          <div className="container-shell flex flex-col justify-between gap-4 py-6 text-sm md:flex-row md:items-center">
            <p className="font-display text-lg">A learning journey that makes sense for you.</p>
            <p className="text-muted-foreground">Watch. Read. Practice. Understand.</p>
          </div>
        </div>

        <ExperienceSection />

        <LearningLoopSection />

        <RoadmapSection />

      </main>

      <SiteFooter />

    </div>
  );
}
