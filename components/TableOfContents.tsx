"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type TocItem = {
  id?: string;
  level?: number;
  title: string;
};

function useActiveSection(itemIds: string[]) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (itemIds.length === 0) return;

    // Find the scrollable container (.page-content)
    const scrollContainer = document.querySelector(".page-content");
    if (!scrollContainer) return;

    const findTopmostHeading = () => {
      const threshold = 120; // Offset from top of viewport

      let bestIndex = 0;
      let bestTop = -Infinity;

      itemIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const top = rect.top;

        // Find the last heading that's at or above threshold
        if (top <= threshold && top > bestTop) {
          bestTop = top;
          bestIndex = index;
        }
      });

      // If no heading above threshold, pick the first visible one
      if (bestTop === -Infinity) {
        for (let i = 0; i < itemIds.length; i++) {
          const el = document.getElementById(itemIds[i]);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0) {
            return i;
          }
        }
      }

      return bestIndex;
    };

    // Set initial
    setActiveIndex(findTopmostHeading());

    // Throttle scroll handler
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setActiveIndex(findTopmostHeading());
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, [itemIds]);

  return activeIndex;
}

export function TableOfContents({ toc }: { toc: TocItem[] }) {
  const items = toc.filter(
    (item) => item.id && (item.level === 2 || item.level === 3)
  );

  const itemIds = items.map((item) => item.id).filter(Boolean) as string[];
  const activeIndex = useActiveSection(itemIds);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${id}`);
      }
    },
    []
  );

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav
      data-slot="table-of-contents"
      className={cn(
        "hidden lg:block",
        "sticky top-[calc(var(--top-nav-height)+1.5rem)]",
        "max-h-[calc(100vh-var(--top-nav-height)-3rem)]",
        "w-[var(--toc-width)] shrink-0 self-start",
        "overflow-y-auto"
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          "text-muted-foreground",
          "mb-3"
        )}
      >
        On this page
      </div>

      <ul className="relative space-y-0.5 border-l border-border pl-4">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const isNested = item.level === 3;
          // Use id as key, fallback to index for uniqueness
          const key = item.id || `toc-${index}`;
          return (
            <li
              key={key}
              data-state={isActive ? "active" : "inactive"}
              className={cn("relative", isNested && "pl-4")}
            >
              {isActive && (
                <motion.span
                  layoutId="toc-indicator"
                  className={cn(
                    "absolute -left-4 top-1/2 -translate-y-1/2",
                    "-ml-px h-5 w-0.5 rounded-full",
                    "bg-primary"
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Link
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id!)}
                data-state={isActive ? "active" : "inactive"}
                className={cn(
                  "block py-1 text-sm leading-normal",
                  "transition-colors duration-base ease-out-cubic",
                  "text-muted-foreground/60 hover:text-foreground",
                  "data-[state=active]:text-foreground data-[state=active]:font-medium"
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
