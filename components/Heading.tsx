"use client";

import * as React from "react";
import { createContext, useContext, ComponentPropsWithoutRef } from "react";
import { Link2, Check } from "lucide-react";
import { Slottable } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";
import { AnchorLink, useAnchorLinkContext } from "./AnchorLink";

// -----------------------------------------------------------------------------
// Context to disable anchor links (used by ADR Content)
// -----------------------------------------------------------------------------

const DisableAnchorLinksContext = createContext(false);

export function DisableAnchorLinks({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DisableAnchorLinksContext.Provider value={true}>
      {children}
    </DisableAnchorLinksContext.Provider>
  );
}

function useDisableAnchorLinks() {
  return useContext(DisableAnchorLinksContext);
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

interface HeadingProps extends ComponentPropsWithoutRef<"h1"> {
  id?: string;
  level?: HeadingLevel;
  as?: HeadingElement;
  asChild?: boolean;
}

// -----------------------------------------------------------------------------
// Inner component that uses context
// -----------------------------------------------------------------------------

interface HeadingContentProps {
  children: React.ReactNode;
  label: string;
}

function HeadingContent({ children, label }: HeadingContentProps) {
  const { handleClick, href, copied } = useAnchorLinkContext();

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "inline-flex items-baseline gap-2 no-underline",
        "text-inherit hover:text-inherit",
        "cursor-pointer"
      )}
    >
      <span>{children}</span>
      <span
        data-slot="anchor-link.inline"
        data-state={copied ? "copied" : "idle"}
        className={cn(
          "inline-flex items-center self-center",
          "text-muted-foreground/0 group-hover:text-muted-foreground",
          "transition-colors duration-base ease-out-cubic",
          "hover:text-foreground"
        )}
      >
        {copied ? (
          <Check className="size-[0.6em] text-emerald-500" />
        ) : (
          <Link2 className="size-[0.6em]" />
        )}
      </span>
    </a>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function Heading({
  id = "",
  level = 1,
  as,
  asChild,
  children,
  className,
  ...props
}: HeadingProps) {
  const defaultElement = `h${level}` as HeadingElement;
  const Element = as ?? defaultElement;
  const disableAnchorLinks = useDisableAnchorLinks();
  const showAnchor = Boolean(id) && !disableAnchorLinks;

  return (
    <Slottable
      as={Element}
      asChild={asChild}
      id={id}
      data-slot="heading"
      data-level={level}
      className={cn("heading group relative scroll-mt-24", className)}
      {...props}
    >
      {showAnchor ? (
        <AnchorLink id={id}>
          <HeadingContent
            label={`Link to ${
              typeof children === "string" ? children : "section"
            }`}
          >
            {children}
          </HeadingContent>
        </AnchorLink>
      ) : (
        children
      )}
    </Slottable>
  );
}
