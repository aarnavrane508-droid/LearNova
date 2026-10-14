import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="container-shell flex min-h-24 items-center justify-between gap-4 border-b border-border/70">

      <Brand />

      <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
        {site.navigation.map((item) => <a key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{item.label}</a>)}
      </nav>

      <a href="#roadmap" className={buttonVariants({ variant: "outline", size: "sm" })}>
        See what’s next
        <ArrowUpRight aria-hidden="true" />
      </a>

      <details className="relative md:hidden">

        <summary aria-label="Open navigation" className="list-none rounded-lg p-2">
          <Menu aria-hidden="true" className="size-5" />
        </summary>

        <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-20 grid w-56 gap-2 rounded-xl border bg-card p-3 shadow-lg">
          {site.navigation.map((item) => <a key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm hover:bg-secondary">{item.label}</a>)}
        </nav>

      </details>

    </header>
  );
}
