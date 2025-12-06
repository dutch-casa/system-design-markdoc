"use client";

import * as React from "react";
import { ReactNode, useMemo, useState } from "react";
import { Folder, File, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TreeNode {
  name: string;
  isFolder: boolean;
  children?: TreeNode[];
}

// -----------------------------------------------------------------------------
// Parse File Tree
// -----------------------------------------------------------------------------

function parseFileTree(content: string): TreeNode[] {
  const lines = content.trim().split("\n");
  const root: TreeNode[] = [];
  const stack: Array<{ node: TreeNode; indent: number }> = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Count leading spaces to determine indent level
    const indent = line.search(/\S/);
    const name = line.trim();
    const isFolder = name.endsWith("/");

    const node: TreeNode = {
      name: isFolder ? name.slice(0, -1) : name,
      isFolder,
      children: isFolder ? [] : undefined,
    };

    // Pop stack until we find the correct parent
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    // Add to parent or root
    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (parent.children) {
        parent.children.push(node);
      }
    }

    // Push current node to stack if it's a folder
    if (isFolder) {
      stack.push({ node, indent });
    }
  }

  return root;
}

// -----------------------------------------------------------------------------
// TreeItem
// -----------------------------------------------------------------------------

function TreeItem({ node }: { node: TreeNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: "spring" as const,
        bounce: 0,
        duration: 0.45, // --duration-macro (450ms)
      };

  return (
    <li className="select-none m-0 py-[2px]">
      <span className="flex items-center gap-1">
        {/* Chevron button for folders with children */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-4 h-4 p-0 hover:bg-muted rounded transition-colors"
            style={{
              transitionDuration: "var(--duration-base)",
              transitionTimingFunction: "var(--ease-out-cubic)",
            }}
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <motion.span
              animate={prefersReducedMotion ? {} : { rotate: isOpen ? 90 : 0 }}
              transition={transition}
              className="flex items-center justify-center"
            >
              <ChevronRight className="size-4 text-muted-foreground" />
            </motion.span>
          </button>
        ) : (
          <span className="w-4" aria-hidden="true" />
        )}

        {/* Icon */}
        {node.isFolder ? (
          <Folder className="size-4 shrink-0 text-blue-500 dark:text-blue-400" />
        ) : (
          <File className="size-4 shrink-0 text-muted-foreground" />
        )}

        {/* Name */}
        <span className="text-sm text-card-foreground leading-tight">{node.name}</span>
      </span>

      {/* Children */}
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.ul
            initial={prefersReducedMotion ? undefined : { height: 0 }}
            animate={prefersReducedMotion ? undefined : { height: "auto" }}
            exit={prefersReducedMotion ? undefined : { height: 0 }}
            transition={transition}
            className="pl-3 overflow-hidden flex flex-col justify-end m-0 p-0"
          >
            {node.children!.map((child, index) => (
              <TreeItem key={`${child.name}-${index}`} node={child} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

// -----------------------------------------------------------------------------
// FileTree Component
// -----------------------------------------------------------------------------

interface FileTreeProps {
  content?: string;
  children?: ReactNode;
}

export function FileTree({ content, children }: FileTreeProps) {
  // Use content prop if provided (from transform), otherwise extract from children
  const textContent = React.useMemo(() => {
    if (content) return content;
    if (typeof children === "string") return children;
    
    // Handle Markdoc code fence children - get the raw text
    if (React.isValidElement(children)) {
      if (children.type === "pre") {
        const code = React.Children.toArray((children.props as any).children).find(
          (child: any) => React.isValidElement(child) && child.type === "code"
        );
        if (code && React.isValidElement(code)) {
          const codeChildren = (code.props as any).children;
          if (typeof codeChildren === "string") return codeChildren;
          return extractText(codeChildren);
        }
      }
      const props = children.props as any;
      if (props.children) {
        if (typeof props.children === "string") return props.children;
        return extractText(props.children);
      }
    }
    
    return extractText(children);
  }, [content, children]);

  const tree = useMemo(() => parseFileTree(textContent), [textContent]);

  return (
    <div
      data-slot="filetree"
      className="my-6 rounded-lg border border-border bg-card p-4"
    >
      <ul className="space-y-0 m-0 p-0 list-none">
        {tree.map((node, index) => (
          <TreeItem key={`${node.name}-${index}`} node={node} />
        ))}
      </ul>
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

