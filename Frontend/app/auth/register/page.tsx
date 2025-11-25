"use client";

import { RegisterForm } from "./register-form";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* positioned bubble background so it doesn't affect layout sizing */}
      <BubbleBackground className="absolute inset-0 pointer-events-none bg-primary" />

      {/* page content sits above the background */}
      <div className="relative z-10 w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
