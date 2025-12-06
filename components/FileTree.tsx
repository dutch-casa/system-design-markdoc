import * as React from "react";
import { ReactNode, useMemo } from "react";
import { Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TreeNode {
  name: string;
  isFolder: boolean;
  level: number;
  children?: TreeNode[];
}

// -----------------------------------------------------------------------------
// Parse File Tree
// -----------------------------------------------------------------------------

function parseFileTree(content: string): TreeNode[] {
  const lines = content.trim().split("\n");
  const root: TreeNode[] = [];
  const stack: { node: TreeNode; level: number }[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const level = (line.match(/^\s*/)?.[0].length ?? 0) / 2;
    const name = line.trim();
    const isFolder = name.endsWith("/");

    const node: TreeNode = {
      name: isFolder ? name.slice(0, -1) : name,
      isFolder,
      level,
    };

    // Pop stack until we find the parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    }

    stack.push({ node, level });
  }

  return root;
}

// -----------------------------------------------------------------------------
// TreeItem
// -----------------------------------------------------------------------------

function TreeItem({ node }: { node: TreeNode }) {
  const Icon = node.isFolder ? Folder : File;

  return (
    <div data-slot="filetree.item" className="group">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 text-sm",
          "text-foreground/80 dark:text-foreground/70"
        )}
        style={{ paddingLeft: `${node.level * 1.5}rem` }}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            node.isFolder
              ? "text-sky-600 dark:text-sky-400"
              : "text-muted-foreground"
          )}
        />
        <span className="font-mono text-sm">{node.name}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem key={`${child.name}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FileTree Component
// -----------------------------------------------------------------------------

interface FileTreeProps {
  children: ReactNode;
}

export function FileTree({ children }: FileTreeProps) {
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

  const tree = useMemo(() => parseFileTree(content), [content]);

  return (
    <div
      data-slot="filetree"
      className="my-6 rounded-lg border border-border bg-card p-4"
    >
      {tree.map((node, index) => (
        <TreeItem key={`${node.name}-${index}`} node={node} />
      ))}
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

