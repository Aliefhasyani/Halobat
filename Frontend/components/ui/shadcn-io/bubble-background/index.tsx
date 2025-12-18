"use client";

import * as React from "react";
import {
  motion,
  type SpringOptions,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Normalize a provided color into a usable CSS color string.
 * - If the input looks like an existing CSS color (rgb(...), rgba(...), oklch(...), hex, var(...))
 *   return it as-is.
 * - If the input is an "r,g,b" triplet return rgb(r,g,b).
 * - Otherwise return the original string and let the browser attempt to parse it.
 */
function convertToCssColor(input?: string) {
  if (!input) return "";

  const str = input.trim();

  // Common CSS color formats (return these unchanged)
  if (/^(rgb|rgba|oklch|hsl|var|#)/i.test(str)) return str;

  // r,g,b triplet -> rgb(...)
  if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(str)) return `rgb(${str})`;

  // Fallback — return the original string
  return str;
}

type BubbleBackgroundProps = React.ComponentProps<"div"> & {
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
    sixth: string;
  };
  /**
   * Optional: primary color (background) and secondary color (bubble).
   * Accepts hex (#rrggbb), rgb(...) or plain `r,g,b` string. When provided
   * these two values override the `colors` object for a simpler two-color
   * setup (primary = background, secondary = bubbles).
   */
  primary?: string; // CSS color string or hex; when not provided, component will use app CSS var(--primary)
  secondary?: string; // when not provided, component will use app CSS var(--secondary)
};

function BubbleBackground({
  ref,
  className,
  children,
  interactive = false,
  transition = { stiffness: 100, damping: 20 },
  colors = {
    first: "18,113,255",
    second: "221,74,255",
    third: "0,220,255",
    fourth: "200,50,50",
    fifth: "180,180,50",
    sixth: "140,100,255",
  },
  primary,
  secondary,
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  React.useEffect(() => {
    if (!interactive) return;

    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    currentContainer?.addEventListener("mousemove", handleMouseMove);
    return () =>
      currentContainer?.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn("relative size-full overflow-hidden", className)}
      {...props}
    >
      <style>
        {`
            :root {
              /* Use the app's CSS variables when primary/secondary are not passed. */
                /* If a primary color is provided prefer it, otherwise try the app's
                  --primary, then fallback to the first color from the registry. */
                --bg-primary: ${
                  primary
                    ? convertToCssColor(primary)
                    : `var(--primary, ${convertToCssColor(colors.first)})`
                };

                /* Bubbles color: prefer secondary prop for all bubbles, or use individual colors */
                --bubble-color: ${
                  secondary
                    ? convertToCssColor(secondary)
                    : `var(--secondary, ${convertToCssColor(colors.second)})`
                };

              /* Individual bubble colors: use secondary if provided, otherwise use colors object */
              --first-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.first)
              };
              --second-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.second)
              };
              --third-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.third)
              };
              --fourth-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.fourth)
              };
              --fifth-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.fifth)
              };
              --sixth-color: ${
                secondary
                  ? "var(--bubble-color)"
                  : convertToCssColor(colors.sixth)
              };
            }
          `}
      </style>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-0 h-0"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          filter: "url(#goo) blur(40px)",
          /* Use the primary color for the page background via CSS var --bg-primary */
          background: `linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-primary) 100%)`,
        }}
      >
        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] bg-[radial-gradient(circle_at_center,var(--first-color)_0%,transparent_50%)] opacity-80"
          animate={{ y: [-50, 50, -50] }}
          transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <div className="rounded-full size-[80%] top-[10%] left-[10%] bg-[radial-gradient(circle_at_center,var(--second-color)_0%,transparent_50%)] opacity-80" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%+400px)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          <div className="absolute rounded-full size-[80%] bg-[radial-gradient(circle_at_center,var(--third-color)_0%,transparent_50%)] top-[calc(50%+200px)] left-[calc(50%-500px)] opacity-80" />
        </motion.div>

        <motion.div
          className="absolute rounded-full size-[80%] top-[10%] left-[10%] bg-[radial-gradient(circle_at_center,var(--fourth-color)_0%,transparent_50%)] opacity-70"
          animate={{ x: [-50, 50, -50] }}
          transition={{ duration: 40, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          <div className="absolute rounded-full size-[160%] bg-[radial-gradient(circle_at_center,var(--fifth-color)_0%,transparent_50%)] top-[calc(50%-80%)] left-[calc(50%-80%)] opacity-80" />
        </motion.div>

        {interactive && (
          <motion.div
            className="absolute rounded-full size-full bg-[radial-gradient(circle_at_center,var(--sixth-color)_0%,transparent_50%)] opacity-70"
            style={{
              x: springX,
              y: springY,
            }}
          />
        )}
      </div>

      {/* ensure page content sits above the animated overlay */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
