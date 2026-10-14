import { describe, expect, it } from "vitest";
import { cn } from "../../src/lib/utils";

describe("shared class composition", () => {
  it("allows callers to override conflicting Tailwind spacing", () => {
    expect(cn("p-4 text-sm", "p-8")).toBe("text-sm p-8");
  });

  it("keeps independent responsive and focus styles", () => {
    expect(cn("p-4 md:p-8 focus:ring-2", { hidden: false, flex: true })).toBe("p-4 md:p-8 focus:ring-2 flex");
  });
});
