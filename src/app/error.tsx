"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ApplicationError({ reset }: { reset: () => void }) {
  return (
    <main className="container-shell py-20">
      <h1 className="font-display text-4xl">This page is temporarily unavailable.</h1>
      <p className="my-6 max-w-lg text-muted-foreground">Please try again shortly. Account pages require authentication services and an available database.</p>
      <div className="flex flex-wrap items-center gap-5"><Button onClick={reset}>Try again</Button><Link href="/" className="underline underline-offset-4">Back to home</Link></div>
    </main>
  );
}
