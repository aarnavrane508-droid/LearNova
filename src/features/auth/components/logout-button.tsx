"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) { setError("Couldn’t log out. Please try again."); return; }
      router.replace("/login");
      router.refresh();
    } catch { setError("Couldn’t reach account services. Please try again."); }
    finally { setPending(false); }
  }

  return <div className="space-y-2"><Button variant="outline" size="sm" onClick={logout} disabled={pending}>{pending ? "Logging out…" : "Log out"}</Button><p role="alert" className="text-xs text-destructive">{error}</p></div>;
}
