// apps/admin/components/useAdminAuth.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAdminAuth({ redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // 'checking' | 'authed' | 'unauth'
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch(`${API_BASE}/api/admin-auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted) return;

        if (res.ok) {
          setStatus("authed");
        } else {
          setStatus("unauth");
          // redirect cleanly to /login (no next param)
          router.replace(redirectTo);
        }
      } catch (err) {
        if (!mounted) return;
        setStatus("unauth");
        router.replace(redirectTo);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [API_BASE, redirectTo, router]);

  return status;
}
