import { learningSteps } from "@/features/landing/content";

export function LearningLoopSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="bg-primary text-primary-foreground">

      <div className="container-shell grid gap-12 py-16 lg:grid-cols-2 lg:gap-24 lg:py-20">
        <div>
          <p className="eyebrow mb-5 text-[#c2d49d]">A simple learning loop</p>
          <h2 id="how-title" className="section-title">
            Progress starts
            <br />
            with a little clarity.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#d6e1d8]">Our goal is to connect what you learn with what you understand, then help you choose a useful next step.</p>
        </div>
        <ol className="space-y-0">{learningSteps.map(({ icon: Icon, ...step }, index) => <li key={step.title} className="flex gap-5 border-b border-white/15 py-6 first:pt-0 last:border-0 last:pb-0">
          <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-white/25 text-sm">{index+1}</span>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#d6e1d8]">{step.description}</p>
          </div>
          <Icon aria-hidden="true" className="mt-2 size-5 text-[#c2d49d]" strokeWidth={1.5} />
        </li>)}</ol>
      </div>

    </section>
  );
}
