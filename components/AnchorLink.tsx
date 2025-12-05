"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Link2, Check } from "lucide-react";
import { Slottable } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AnchorLinkContextValue {
  id: string;
  copied: boolean;
  handleClick: (e: React.MouseEvent) => void;
  href: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AnchorLinkContext = createContext<AnchorLinkContextValue | null>(null);

function useAnchorLinkContext() {
  const context = useContext(AnchorLinkContext);
  if (!context) {
    throw new Error(
      "AnchorLink compound components must be used within AnchorLink.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

interface RootProps {
  /** The element ID to link to */
  id: string;
  /** Scroll behavior - 'instant' snaps immediately, 'smooth' animates */
  behavior?: ScrollBehavior;
  /** Feedback duration in ms after copy (0 to disable) */
  feedbackDuration?: number;
  children: ReactNode;
}

function Root({
  id,
  behavior = "instant",
  feedbackDuration = 2000,
  children,
}: RootProps) {
  const [copied, setCopied] = useState(false);
  const href = `#${id}`;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });
      }

      window.history.pushState(null, "", href);

      const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;
      navigator.clipboard.writeText(fullUrl).then(() => {
        if (feedbackDuration > 0) {
          setCopied(true);
          setTimeout(() => setCopied(false), feedbackDuration);
        }
      });
    },
    [id, href, behavior, feedbackDuration]
  );

  return (
    <AnchorLinkContext.Provider value={{ id, copied, handleClick, href }}>
      {children}
    </AnchorLinkContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

type TriggerElement = "a" | "button" | "span";

interface TriggerProps extends ComponentPropsWithoutRef<"a"> {
  as?: TriggerElement;
  asChild?: boolean;
}

function Trigger({
  as = "a",
  asChild,
  className,
  children,
  ...props
}: TriggerProps) {
  const { handleClick, href, copied } = useAnchorLinkContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      href={as === "a" ? href : undefined}
      onClick={handleClick}
      data-slot="anchor-link.trigger"
      data-state={copied ? "copied" : "idle"}
      className={className}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Icon
// -----------------------------------------------------------------------------

type IconElement = "span" | "div";

interface IconProps extends ComponentPropsWithoutRef<"span"> {
  as?: IconElement;
  asChild?: boolean;
  /** Size of the icon (default: 4 = 16px) */
  size?: number;
}

function Icon({
  as = "span",
  asChild,
  size = 4,
  className,
  ...props
}: IconProps) {
  const { copied } = useAnchorLinkContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="anchor-link.icon"
      data-state={copied ? "copied" : "idle"}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {copied ? (
        <Check className={`size-${size} text-emerald-500`} />
      ) : (
        <Link2 className={`size-${size}`} />
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Inline - Pre-composed trigger for heading-style anchor links
// -----------------------------------------------------------------------------

interface InlineProps extends ComponentPropsWithoutRef<"a"> {
  /** Label for screen readers */
  label?: string;
}

function Inline({ label, className, ...props }: InlineProps) {
  const { href, handleClick, copied } = useAnchorLinkContext();

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={label ?? "Copy link to section"}
      data-slot="anchor-link.inline"
      data-state={copied ? "copied" : "idle"}
      className={cn(
        "inline-flex items-center ml-2",
        "text-muted-foreground/0 group-hover:text-muted-foreground",
        "transition-colors duration-base ease-out-cubic",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "rounded-sm",
        className
      )}
      {...props}
    >
      {copied ? (
        <Check className="size-[0.75em] text-emerald-500" />
      ) : (
        <Link2 className="size-[0.75em]" />
      )}
    </a>
  );
}

// -----------------------------------------------------------------------------
// Button - Pre-composed trigger for button-style anchor links
// -----------------------------------------------------------------------------

interface ButtonProps extends ComponentPropsWithoutRef<"a"> {
  /** Label for screen readers */
  label?: string;
}

function Button({ label, className, ...props }: ButtonProps) {
  const { href, handleClick, copied } = useAnchorLinkContext();

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={label ?? (copied ? "Link copied" : "Copy link")}
      data-slot="anchor-link.button"
      data-state={copied ? "copied" : "idle"}
      className={cn(
        "shrink-0 rounded-md p-1.5",
        "text-muted-foreground",
        "transition-colors duration-150",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Link2 className="size-4" />
      )}
    </a>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const AnchorLink = Object.assign(Root, {
  Trigger,
  Icon,
  Inline,
  Button,
});

export { useAnchorLinkContext };
