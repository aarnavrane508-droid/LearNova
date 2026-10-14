"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/features/auth/client";
import { parsePublicRole } from "@/features/auth/policy";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    setError("");
    setPending(true);
    try {
      const result = registering
        ? await authClient.signUp.email({
          name: String(form.get("name") || "").trim(), email, password,
          accountType: parsePublicRole(form.get("accountType")),
        })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.status === 429
          ? "Too many attempts. Please wait a minute before trying again."
          : result.error.status >= 500
            ? "Account services are unavailable. Please try again later."
            : registering
              ? "We couldn’t create this account. Check your details or try signing in."
              : "We couldn’t sign you in. Check your email and password.");
        return;
      }
      // Use a fixed local destination. No user-controlled return URL is accepted.
      router.replace("/dashboard");
      router.refresh();
    } catch { setError("Unable to reach account services. Please try again later."); }
    finally { setPending(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={pending}>
      {registering && (
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <Input id="name" name="name" autoComplete="name" minLength={2} maxLength={80} required disabled={pending} />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email address</label>
        <Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={pending} />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input id="password" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 12 : undefined} maxLength={128} required disabled={pending} aria-describedby={registering ? "password-help" : undefined} />
        {registering && <p id="password-help" className="text-xs leading-5 text-muted-foreground">Use 12–128 characters. A long, unique passphrase works well.</p>}
      </div>
      {registering && (
        <fieldset className="space-y-3" disabled={pending}>
          <legend className="text-sm font-medium">I’m joining as a</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["STUDENT", "TEACHER"] as const).map((role) => (
              <label key={role} className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary">
                <input type="radio" name="accountType" value={role} defaultChecked={role === "STUDENT"} className="size-4 accent-primary" />
                {role === "STUDENT" ? "Student" : "Teacher"}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div role="alert" aria-live="polite" className="text-sm text-destructive">{error}</div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
        {pending ? "Please wait…" : registering ? "Create account" : "Log in"}
        {!pending && <ArrowRight aria-hidden="true" />}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {registering ? "Already have an account? " : "New to Coolearn? "}
        <Link href={registering ? "/login" : "/register"} className="font-medium text-primary underline underline-offset-4">{registering ? "Log in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
