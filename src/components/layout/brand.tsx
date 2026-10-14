import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={cn("inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight", className)}>

      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <BookOpen aria-hidden="true" className="size-5" />
      </span>

      {site.name}
      <span aria-hidden="true" className="text-[#799451]">.</span>

    </Link>
  );
}
