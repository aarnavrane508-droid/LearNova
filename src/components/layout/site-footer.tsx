import { Brand } from "@/components/layout/brand";

export function SiteFooter() {
  return (
    <footer className="container-shell flex flex-col gap-6 border-t py-9 sm:flex-row sm:items-center sm:justify-between">

      <Brand />

      <p className="text-sm text-muted-foreground">Built around understanding. Designed for your pace.</p>

      <a href="#top" className="text-sm text-muted-foreground hover:text-foreground">Back to top ↑</a>

    </footer>
  );
}
