import * as React from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Diff Component
// -----------------------------------------------------------------------------

interface DiffProps {
  children: ReactNode;
  language?: string;
}

export function Diff({ children, language }: DiffProps) {
  const content =
    typeof children === "string"
      ? children
      : React.Children.toArray(children)
          .map((child) => {
            if (typeof child === "string") return child;
            if (React.isValidElement(child)) {
              const props = child.props as any;
              if (props.children) {
                return extractText(props.children);
              }
            }
            return "";
          })
          .join("");

  const lines = content.trim().split("\n");

  return (
    <div data-slot="diff" className="my-6">
      {/* Header */}
      {language && (
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/80 px-4 py-2">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
      )}

      {/* Diff Content */}
      <div
        className={cn(
          "overflow-x-auto border border-border bg-[#1e1e1e] dark:bg-[#0d1117]",
          language ? "rounded-b-lg border-t-0" : "rounded-lg"
        )}
      >
        <pre className="font-mono text-sm leading-relaxed">
          {lines.map((line, index) => {
            const firstChar = line[0];
            
            // Removed line
            if (firstChar === "-") {
              return (
                <div
                  key={index}
                  className="bg-rose-500/10 text-rose-400 dark:bg-rose-500/20 dark:text-rose-300"
                >
                  <span className="inline-block w-12 select-none text-center text-rose-400/50 dark:text-rose-300/50">
                    {index + 1}
                  </span>
                  <span className="px-4">{line}</span>
                </div>
              );
            }

            // Added line
            if (firstChar === "+") {
              return (
                <div
                  key={index}
                  className="bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300"
                >
                  <span className="inline-block w-12 select-none text-center text-emerald-400/50 dark:text-emerald-300/50">
                    {index + 1}
                  </span>
                  <span className="px-4">{line}</span>
                </div>
              );
            }

            // Context line (unchanged)
            return (
              <div
                key={index}
                className="text-gray-300 dark:text-gray-400"
              >
                <span className="inline-block w-12 select-none text-center text-gray-500 dark:text-gray-600">
                  {index + 1}
                </span>
                <span className="px-4">{line || "\u00A0"}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// Helper to extract text from React nodes
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props.children) {
      return extractText(props.children);
    }
  }
  return "";
}

