"use client";

import { LoginForm } from "./login-form";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // not logged in

      // Ask the backend for the user's profile so we don't store role client-side
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const json = await res.json();
        const role = json.success ? json.data.role : "user";
        if (role === "admin" || role === "superadmin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } catch (err) {
        // ignore and let user use the login page
        console.warn("profile check failed:", err);
      }
    };

    init();
  }, [router]);

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* bubble background is now a positioned child so it won't affect layout sizing */}
      <BubbleBackground className="absolute inset-0 pointer-events-none bg-primary" />

      {/* page content sits above the background */}
      <div className="relative z-10 w-full max-w-sm">
        {/* back button similar to dashboard roles create */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
