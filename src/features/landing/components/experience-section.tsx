import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { experiences } from "@/features/landing/content";

export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="container-shell py-20 lg:py-24">

      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-4 text-[#627d46]">The planned experience</p>
          <h2 id="experience-title" className="section-title">
            Less guesswork.
            <br />
            More understanding.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">A connected learning loop, designed to help you understand where you are and what comes next.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">{experiences.map(({ icon: Icon, ...item }) => <Card key={item.number} className="bg-background">
        <CardHeader>
          <div className="mb-7 flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl bg-secondary">
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </span>
            <span className="text-xs text-muted-foreground">{item.number}</span>
          </div>
          <p className="eyebrow text-[10px] text-[#627d46]">{item.label}</p>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
      </Card>)}</div>

    </section>
  );
}
