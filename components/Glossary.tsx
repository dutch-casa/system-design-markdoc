import * as React from "react";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Glossary Component
// -----------------------------------------------------------------------------

interface GlossaryProps {
  term: string;
  children: ReactNode;
}

export function Glossary({ term, children }: GlossaryProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-slot="glossary.term"
            className={cn(
              "cursor-help border-b-2 border-dotted border-muted-foreground/40",
              "text-foreground",
              "transition-colors duration-base ease-out-cubic",
              "hover:border-foreground/60 hover:text-foreground"
            )}
          >
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent
          data-slot="glossary.definition"
          className="max-w-xs text-sm"
          sideOffset={5}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

