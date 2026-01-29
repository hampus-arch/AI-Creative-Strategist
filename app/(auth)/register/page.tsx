"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - auth is disabled
    router.replace("/");
  }, [router]);

  return null;
}
