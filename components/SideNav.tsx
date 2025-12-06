import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_SECTIONS, type NavSection } from "@/lib/navigation";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { rewritePathVersion, type VersionConfig } from "@/lib/versioning";

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// NavSectionItem
// -----------------------------------------------------------------------------

function NavSectionItem({
  item,
  defaultOpen,
  onNavigate,
}: {
  item: NavSection;
  defaultOpen: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = item.icon;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

  const handleLinkClick = useCallback(() => {
    onNavigate?.();
  }, [onNavigate]);

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
                      onClick={handleLinkClick}
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

// -----------------------------------------------------------------------------
// SideNavContent (inner content, no positioning)
// -----------------------------------------------------------------------------

interface SideNavContentProps extends React.ComponentProps<"div"> {
  /** Optional version configuration for docs versioning */
  versionConfig?: VersionConfig;
  /** Callback when a navigation link is clicked */
  onNavigate?: () => void;
}

function SideNavContent({ versionConfig, className, onNavigate, ...props }: SideNavContentProps) {
  const router = useRouter();

  const handleVersionChange = useCallback(
    (version: string) => {
      const newPath = rewritePathVersion(router.asPath, version);
      router.push(newPath);
      onNavigate?.();
    },
    [router, onNavigate]
  );

  // Determine current version from path or default to latest
  const currentVersion = versionConfig?.current ?? "";
  const hasVersions = versionConfig && versionConfig.versions.length > 1;

  return (
    <div
      data-slot="side-nav.content"
      className={cn("flex flex-col px-3 py-4", className)}
      {...props}
    >
      {/* Version Switcher */}
      {hasVersions && (
        <div className="mb-4 px-3">
          <VersionSwitcher
            versions={versionConfig.versions}
            current={currentVersion}
            onVersionChange={handleVersionChange}
          />
        </div>
      )}

      {/* Navigation Sections */}
      {NAV_SECTIONS.map((item) => {
        const hasActiveLink = item.links.some(
          (link) => router.pathname === link.href
        );
        return (
          <NavSectionItem
            key={item.title}
            item={item}
            defaultOpen={hasActiveLink || true}
            onNavigate={onNavigate}
          />
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SideNav (wrapper with positioning for standalone use)
// -----------------------------------------------------------------------------

interface SideNavProps extends React.ComponentProps<"nav"> {
  /** Optional version configuration for docs versioning */
  versionConfig?: VersionConfig;
  /** Callback when a navigation link is clicked */
  onNavigate?: () => void;
}

function SideNav({ versionConfig, className, onNavigate, ...props }: SideNavProps) {
  return (
    <nav
      data-slot="side-nav"
      aria-label="Documentation navigation"
      className={cn(
        "h-full w-full overflow-y-auto bg-background",
        className
      )}
      {...props}
    >
      <SideNavContent versionConfig={versionConfig} onNavigate={onNavigate} />
    </nav>
  );
}

export { SideNav, SideNavContent };
