"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setReady(true);
      } catch (err) {
        router.replace("/login");
      }
    }

    checkSession();
  }, [router, API_BASE]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking session…
      </div>
    );
  }

  return children;
}
