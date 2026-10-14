import { MoveUpRight } from "lucide-react";
import { milestones } from "@/features/landing/content";

export function RoadmapSection() {
  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="container-shell py-20 lg:py-24">

      <p className="eyebrow mb-4 text-[#627d46]">Where we’re headed</p>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 id="roadmap-title" className="section-title">
          Good things take
          <br />
          thoughtful steps.
        </h2>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">Coolearn is at the foundation stage. Here’s the path ahead, with each phase built and reviewed before the next.</p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{milestones.map((step, index) => <li key={step.number} className={`rounded-2xl border p-6 ${index===0? "border-[#becda1] bg-[#eef2e5]":"bg-background"}`}>
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-3xl text-[#718b4c]">{step.number}</span>
          <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold">{step.status}</span>
        </div>
        <h3 className="mb-3 font-semibold">{step.title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{step.detail}</p>
      </li>)}</ol>

      <div className="mt-12 flex flex-col justify-between gap-6 rounded-2xl bg-secondary px-7 py-8 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-2xl">A future that fits your classroom.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">Google Classroom and Microsoft Teams for Education are planned integrations. Resources will only be imported with authorization.</p>
        </div>
        <MoveUpRight aria-hidden="true" className="size-8 shrink-0 text-[#718b4c]" strokeWidth={1} />
      </div>

    </section>
  );
}
