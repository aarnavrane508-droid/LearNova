"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const statusSchema = z.object({ available: z.boolean(), reason: z.enum(["ready", "disabled", "unavailable", "model-missing"]) });

export function LocalAiStatus() {
  const [label, setLabel] = useState("Checking local AI…");
  const [checking, setChecking] = useState(false);
  async function check(signal?: AbortSignal) {
    setChecking(true);
    try {
      const response = await fetch("/api/local-ai/status", { signal, cache: "no-store" });
      if (!response.ok) throw new Error();
      const status = statusSchema.parse(await response.json());
      setLabel(status.available ? "Local model installed · ready to request" : status.reason === "disabled"
        ? "Local AI is disabled" : status.reason === "model-missing" ? "Local model is not installed" : "Local AI is unavailable");
    } catch { if (!signal?.aborted) setLabel("Local AI status unavailable. Try again shortly."); }
    finally { if (!signal?.aborted) setChecking(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    // Fetch asynchronously; availability is not evidence of successful inference.
    void fetch("/api/local-ai/status", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error();
        const status = statusSchema.parse(await response.json());
        setLabel(status.available ? "Local model installed · ready to request" : status.reason === "disabled" ? "Local AI is disabled" : "Local AI is unavailable or the model is missing");
      }).catch(() => { if (!controller.signal.aborted) setLabel("Local AI status unavailable"); });
    return () => controller.abort();
  }, []);
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary p-4">
    <p role="status" className="text-sm">{label}</p>
    <Button variant="outline" size="sm" disabled={checking} onClick={() => void check()}>Check again</Button>
  </div>;
}
