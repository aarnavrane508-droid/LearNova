import { Brand } from "@/components/layout/brand";
import { AuthForm } from "@/features/auth/components/auth-form";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  return (
    <main className="container-shell flex min-h-screen flex-col items-center py-10 sm:py-16">
      <Brand />
      <section aria-labelledby="auth-title" className="mt-12 w-full max-w-md rounded-2xl border bg-card p-6 sm:p-9">
        <p className="eyebrow mb-4 text-muted-foreground">Your learning space</p>
        <h1 id="auth-title" className="font-display text-4xl tracking-tight">{registering ? "A fresh start." : "Welcome back."}</h1>
        <p className="mb-8 mt-4 text-sm leading-7 text-muted-foreground">{registering ? "Create a student or teacher account. Your dashboard is the first step." : "Log in to your account and continue to your dashboard."}</p>
        <AuthForm mode={mode} />
      </section>
      <p className="mt-6 max-w-md text-center text-xs leading-6 text-muted-foreground">Course delivery, quizzes, and personalized learning will arrive in later phases.</p>
    </main>
  );
}
