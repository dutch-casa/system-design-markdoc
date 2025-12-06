import * as React from "react";
import { ReactNode, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Collapsible Component
// -----------------------------------------------------------------------------

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      data-slot="collapsible"
      data-state={isOpen ? "open" : "closed"}
      className="my-6 overflow-hidden rounded-lg border border-border bg-card"
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        data-slot="collapsible.trigger"
        className={cn(
          "flex w-full items-center justify-between gap-4 px-4 py-3",
          "text-left text-sm font-medium text-foreground",
          "transition-colors duration-base ease-out-cubic",
          "hover:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        )}
      >
        <span>{title}</span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            "transition-transform duration-base ease-out-cubic",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div
          data-slot="collapsible.content"
          className="border-t border-border px-4 py-3 text-sm text-foreground/80"
        >
          {children}
        </div>
      )}
    </div>
  );
}

