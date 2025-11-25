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
      // primary = white background, secondary = soft pastel for bubbles
      primary="#ffffff"
      secondary="255,200,230"
      colors={{
        first: "255,230,240",
        second: "200,240,220",
        third: "200,220,255",
        fourth: "240,200,220",
        fifth: "240,230,200",
        sixth: "220,210,245",
      }}
      interactive={false}
    >
      {children}
    </BubbleBackground>
  );
}
