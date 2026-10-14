import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-6 px-6">
    <p className="eyebrow">404 · Page not found</p>
    <h1 className="font-display text-5xl">Let’s find your way back.</h1>
    <p className="text-muted-foreground">This page isn’t available. Head back to the Coolearn homepage.</p>
    <Link href="/" className={buttonVariants()}>Back to home</Link>
  </main>;
}
