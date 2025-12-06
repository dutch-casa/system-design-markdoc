import * as React from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Terminal Component
// -----------------------------------------------------------------------------

interface TerminalProps {
  children: ReactNode;
  prompt?: string;
}

export function Terminal({ children, prompt = "$" }: TerminalProps) {
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
    <div
      data-slot="terminal"
      className="my-6 overflow-hidden rounded-lg border border-border bg-[#1e1e1e] dark:bg-[#0d1117]"
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-border/50 bg-[#2d2d2d] dark:bg-[#161b22] px-4 py-2">
        <div className="size-3 rounded-full bg-[#ff5f56]" />
        <div className="size-3 rounded-full bg-[#ffbd2e]" />
        <div className="size-3 rounded-full bg-[#27c93f]" />
      </div>

      {/* Terminal Content */}
      <div className="p-4">
        <pre className="font-mono text-sm leading-relaxed">
          {lines.map((line, index) => {
            const trimmedLine = line.trim();
            
            // Command line (starts with prompt)
            if (trimmedLine.startsWith(prompt)) {
              return (
                <div key={index} className="flex gap-2">
                  <span className="text-emerald-400 dark:text-emerald-500">
                    {prompt}
                  </span>
                  <span className="text-gray-200 dark:text-gray-300">
                    {trimmedLine.slice(prompt.length).trim()}
                  </span>
                </div>
              );
            }

            // Success output (✓, ✔)
            if (trimmedLine.match(/^[✓✔]/)) {
              return (
                <div key={index} className="text-emerald-400 dark:text-emerald-500">
                  {trimmedLine}
                </div>
              );
            }

            // Error output (✗, ✘, ×)
            if (trimmedLine.match(/^[✗✘×]/)) {
              return (
                <div key={index} className="text-rose-400 dark:text-rose-500">
                  {trimmedLine}
                </div>
              );
            }

            // Warning output (⚠, !)
            if (trimmedLine.match(/^[⚠!]/)) {
              return (
                <div key={index} className="text-amber-400 dark:text-amber-500">
                  {trimmedLine}
                </div>
              );
            }

            // Info output (→, ›, ▸)
            if (trimmedLine.match(/^[→›▸]/)) {
              return (
                <div key={index} className="text-sky-400 dark:text-sky-500">
                  {trimmedLine}
                </div>
              );
            }

            // Regular output
            return (
              <div key={index} className="text-gray-300 dark:text-gray-400">
                {trimmedLine || "\u00A0"}
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

