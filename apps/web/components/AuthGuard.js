"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    async function check() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        if (alive) setReady(true);
      } catch {
        router.replace("/login");
      }
    }

    check();
    return () => {
      alive = false;
    };
  }, [API_BASE, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking session…
      </div>
    );
  }

  return children;
}
