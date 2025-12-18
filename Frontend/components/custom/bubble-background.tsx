"use client";

import * as React from "react";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";

/**
 * Custom wrapper: a preconfigured BubbleBackground that uses a white page
 * background and softer bubble colors so it looks like the mockup.
 */
export default function CustomBubbleBackground({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <BubbleBackground
      className={className}
      // primary = white background, first 3 bubbles pink, last 3 green
      primary="#ffffff"
      colors={{
        first: "11,85,26",
        second: "255,200,230",
        third: "255,200,230",
        fourth: "255,200,230",
        fifth: "11,85,26",
        sixth: "11,85,26",
      }}
      interactive={false}
    >
      {children}
    </BubbleBackground>
  );
}
