import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

import { NAV_SECTIONS, type NavSection } from "@/lib/navigation";

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

function NavSectionItem({
  item,
  defaultOpen,
}: {
  item: NavSection;
  defaultOpen: boolean;
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = item.icon;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div data-slot="nav.section" className="mb-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <ChevronRight
          className="size-3.5 shrink-0 text-foreground/40 transition-transform duration-150 ease-out group-hover:text-foreground/60 group-data-[state=open]:rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        <Icon
          className="size-4 shrink-0 text-foreground/50 transition-colors duration-150 ease-out group-hover:text-foreground/70"
          aria-hidden="true"
        />
        <span>{item.title}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            data-slot="nav.list-wrapper"
            initial={prefersReducedMotion ? undefined : { height: 0 }}
            animate={prefersReducedMotion ? undefined : { height: "auto" }}
            exit={prefersReducedMotion ? undefined : { height: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <ul
              data-slot="nav.list"
              className="flex flex-col gap-0.5 py-1 pl-7"
            >
              {item.links.map((link, index) => {
                const isActive = router.pathname === link.href;
                return (
                  <motion.li
                    key={link.href}
                    data-slot="nav.item"
                    initial={
                      prefersReducedMotion ? undefined : { opacity: 0, y: -4 }
                    }
                    animate={
                      prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                    }
                    exit={
                      prefersReducedMotion ? undefined : { opacity: 0, y: -4 }
                    }
                    transition={{
                      ...transition,
                      delay: prefersReducedMotion ? 0 : index * 0.03,
                    }}
                  >
                    <Link
                      href={link.href}
                      data-state={isActive ? "active" : "inactive"}
                      className="block rounded-lg px-3 py-2 text-sm text-foreground/60 transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium motion-reduce:transition-none"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SideNav() {
  const router = useRouter();

  return (
    <nav
      data-slot="sidebar"
      aria-label="Documentation navigation"
      className="sticky top-[var(--top-nav-height)] h-[calc(100vh-var(--top-nav-height))] w-64 shrink-0 overflow-y-auto border-r border-border bg-background px-3 py-4"
    >
      {NAV_SECTIONS.map((item) => {
        const hasActiveLink = item.links.some(
          (link) => router.pathname === link.href
        );
        return (
          <NavSectionItem
            key={item.title}
            item={item}
            defaultOpen={hasActiveLink || true}
          />
        );
      })}
    </nav>
  );
}
