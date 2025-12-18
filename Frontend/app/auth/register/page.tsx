"use client";

import { RegisterForm } from "./register-form";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      <BubbleBackground
        className="absolute inset-0 pointer-events-none bg-primary"
        colors={{
          first: "255,200,230",
          second: "255,200,230",
          third: "255,200,230",
          fourth: "255,200,230",
          fifth: "255,200,230",
          sixth: "255,200,230",
        }}
      />

      {/* page content sits above the background */}
      <div className="relative z-10 w-full max-w-sm">
        {/* back button consistent with login page */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
