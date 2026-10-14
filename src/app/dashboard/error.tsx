"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="container-shell py-20"><h1 className="font-display text-4xl">Account services are unavailable.</h1><p className="my-6 max-w-lg text-muted-foreground">Please try again shortly. Your private workspace requires a valid session and an available database.</p><div className="flex gap-5"><Button onClick={reset}>Try again</Button><Link href="/" className="self-center underline underline-offset-4">Back to home</Link></div></main>;
}
