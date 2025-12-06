"use client";

import * as React from "react";
import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import Prism from "prismjs";

// -----------------------------------------------------------------------------
// Terminal Component
// -----------------------------------------------------------------------------

interface TerminalProps {
  children?: ReactNode;
  prompt?: string;
  language?: string;
}

export function Terminal({ children, prompt = "$", language }: TerminalProps) {
  const textContent = React.useMemo(() => {
    if (typeof children === "string") return children;
    
    // Handle Markdoc code fence children - get the raw text
    if (React.isValidElement(children)) {
      // If it's a pre element, extract from code child
      if (children.type === "pre") {
        const code = React.Children.toArray((children.props as any).children).find(
          (child: any) => React.isValidElement(child) && child.type === "code"
        );
        if (code && React.isValidElement(code)) {
          const codeChildren = (code.props as any).children;
          // If it's already a string, use it directly
          if (typeof codeChildren === "string") return codeChildren;
          return extractText(codeChildren);
        }
      }
      // Try to get children directly
      const props = children.props as any;
      if (props.children) {
        if (typeof props.children === "string") return props.children;
        return extractText(props.children);
      }
    }
    
    return extractText(children);
  }, [children]);

  const lines = textContent.split("\n");

  return (
    <div
      data-slot="terminal"
      className="my-6 overflow-hidden rounded-lg border border-[#3d3d3d] bg-[#1e1e1e]"
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-[#3d3d3d] bg-[#2d2d2d] px-4 py-2">
        <div className="size-3 rounded-full bg-[#ff5f56]" />
        <div className="size-3 rounded-full bg-[#ffbd2e]" />
        <div className="size-3 rounded-full bg-[#27c93f]" />
      </div>

      {/* Terminal Content */}
      <div className="p-4">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre">
          <code 
            className={language ? `language-${language}` : ""}
            style={{ color: '#d4d4d4' }}
          >
            {lines.map((line, index) => {
              const trimmedLine = line.trim();
              
              // Command line (starts with prompt)
              if (trimmedLine.startsWith(prompt)) {
                const command = trimmedLine.slice(prompt.length).trim();
                const highlighted = language && Prism.languages[language] 
                  ? Prism.highlight(command, Prism.languages[language], language)
                  : command;
                return (
                  <div key={index} className="flex gap-2">
                    <span className="text-emerald-400">{prompt}</span>
                    <span 
                      className="text-gray-200"
                      style={{ color: '#d4d4d4' }}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </div>
                );
              }

              // Success output (✓, ✔)
              if (trimmedLine.match(/^[✓✔]/)) {
                return (
                  <div key={index} className="text-emerald-400">
                    {trimmedLine}
                  </div>
                );
              }

              // Error output (✗, ✘, ×)
              if (trimmedLine.match(/^[✗✘×]/)) {
                return (
                  <div key={index} className="text-rose-400">
                    {trimmedLine}
                  </div>
                );
              }

              // Warning output (⚠, !)
              if (trimmedLine.match(/^[⚠!]/)) {
                return (
                  <div key={index} className="text-amber-400">
                    {trimmedLine}
                  </div>
                );
              }

              // Info output (→, ›, ▸)
              if (trimmedLine.match(/^[→›▸]/)) {
                return (
                  <div key={index} className="text-sky-400">
                    {trimmedLine}
                  </div>
                );
              }

              // Regular output - highlight if language specified
              const highlighted = language && Prism.languages[language] && trimmedLine
                ? Prism.highlight(trimmedLine, Prism.languages[language], language)
                : trimmedLine || "\u00A0";
              
              return (
                <div 
                  key={index} 
                  className="text-gray-300"
                  style={{ color: '#d4d4d4' }}
                  dangerouslySetInnerHTML={typeof highlighted === 'string' && highlighted.includes('<span') 
                    ? { __html: highlighted }
                    : undefined}
                >
                  {typeof highlighted === 'string' && !highlighted.includes('<span') ? highlighted : null}
                </div>
              );
            })}
          </code>
        </pre>
        <style dangerouslySetInnerHTML={{__html: `
          [data-slot="terminal"] code[class*="language-"] {
            color: #d4d4d4 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.comment {
            color: #6a9955 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.keyword {
            color: #569cd6 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.string {
            color: #ce9178 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.number {
            color: #b5cea8 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.function {
            color: #dcdcaa !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.class-name {
            color: #4ec9b0 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.property {
            color: #9cdcfe !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.tag {
            color: #569cd6 !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.attr-name {
            color: #9cdcfe !important;
          }
          [data-slot="terminal"] code[class*="language-"] .token.attr-value {
            color: #ce9178 !important;
          }
        `}} />
      </div>
    </div>
  );
}

// Helper to extract text from React nodes, preserving newlines
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(extractText).join("\n");
  }
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props.children) {
      if (typeof props.children === "string") return props.children;
      return extractText(props.children);
    }
  }
  return "";
}

