import { ArrowRight, ArrowUpRight, Sprout } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LearningPreview } from "./learning-preview";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="container-shell grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-24">

      <div>

        <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d7dfc9] bg-[#eef2e5] px-3.5 py-2 text-xs font-medium">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#607b43]" />
          A new way to grow · In development
        </p>

        <h1 id="hero-title" className="font-display text-5xl leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Your pace.
          <br />
          Your potential.
          <br />
          <span className="italic text-[#718b4c]">Your path.</span>
        </h1>

        <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">Learning looks different for everyone. We’re building a space that brings your materials, practice, and progress together — with guidance that grows with you.</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#experience" className={buttonVariants({ size: "lg" })}>
            Explore the vision
            <ArrowRight aria-hidden="true" />
          </a>
          <a href="#how-it-works" className={buttonVariants({ size: "lg", variant: "outline" })}>
            How it will work
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Sprout aria-hidden="true" className="size-4" />
          Built for understanding, one small step at a time.
        </p>

      </div>

      <LearningPreview />

    </section>
  );
}
