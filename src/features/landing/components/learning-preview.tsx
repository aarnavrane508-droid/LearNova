import { ArrowUpRight, BookOpen, Check, Clock3, Sprout } from "lucide-react";

export function LearningPreview() {
  return (
    <figure aria-labelledby="preview-caption" className="relative mx-auto w-full max-w-lg rounded-[2rem] bg-[#e8eadf] p-5 sm:p-9">

      <div aria-hidden="true" className="absolute -right-4 -top-5 hidden size-24 items-center justify-center rounded-full border border-[#b9c7a4] bg-background lg:flex">
        <Sprout className="size-10 text-[#6b884b]" strokeWidth={1.3} />
      </div>

      <div className="rotate-[-2deg] rounded-2xl border border-white/80 bg-white p-6 shadow-[0_20px_60px_-25px_#244f4040] sm:p-8">

        <div className="mb-8 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">YOUR LEARNING JOURNEY</p>
          <span aria-hidden="true" className="size-2 rounded-full bg-[#76934f]" />
        </div>

        <p className="mb-2 text-sm text-muted-foreground">One concept at a time.</p>

        <p className="font-display text-3xl leading-tight">
          Little steps.
          <br />
          Deeper understanding.
        </p>

        <div className="my-7 rounded-xl bg-[#f4f5ed] p-4">

          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-[#e2e9d0]">
              <BookOpen aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Introduction to ecosystems</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3" />
                Example learning resource
              </p>
            </div>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">Explore how living things connect with the world around them.</p>

        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-[#e2e9d0]">
              <Check aria-hidden="true" className="size-3" />
            </span>
            Explore the big picture
          </div>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="ml-0.5 size-5 rounded-full border border-dashed border-[#8f9f80]" />
            Build on what you know
          </div>
        </div>

      </div>

      <div className="relative -mt-3 ml-6 flex items-center justify-between gap-3 rounded-xl border border-[#dce2cb] bg-[#f0f5e3] px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-[#4e6939]">THE IDEA BEHIND LEARNOVA</p>
          <p className="mt-1 text-sm">A clearer path to your next step.</p>
        </div>
        <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
      </div>

      <figcaption id="preview-caption" className="mt-6 text-center text-xs leading-5 text-muted-foreground">An illustration of our vision. Learning tools are still in development.</figcaption>

    </figure>
  );
}
