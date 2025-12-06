import { Tag } from "@markdoc/markdoc";
import { FileTree } from "@/components/FileTree";

// Note: Prefer code fence syntax (```filetree) which preserves indentation.
// This tag works but may lose indentation information.
export const filetree = {
  render: FileTree,
  children: ["paragraph", "text"],
  attributes: {},
  transform(node: any, config: any) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    // Extract each paragraph as a line
    const lines: string[] = [];
    
    for (const item of children) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) lines.push(trimmed);
      } else if (item && typeof item === "object") {
        // Handle Tag objects (paragraphs)
        if ("name" in item && "children" in item) {
          const tag = item as { name?: string; children?: unknown[] };
          if (tag.name === "p") {
            const lineText = extractText(tag.children || []);
            if (lineText.trim()) {
              lines.push(lineText.trim());
            }
          }
        }
        // Handle React elements
        else if ("props" in item && typeof item.props === "object" && item.props !== null) {
          const props = item.props as { children?: unknown };
          if (props.children) {
            if (typeof props.children === "string") {
              const trimmed = props.children.trim();
              if (trimmed) lines.push(trimmed);
            } else if (Array.isArray(props.children)) {
              for (const child of props.children) {
                if (typeof child === "string") {
                  const trimmed = child.trim();
                  if (trimmed) lines.push(trimmed);
                }
              }
            }
          }
        }
      }
    }

    function extractText(items: unknown[]): string {
      const parts: string[] = [];
      for (const item of items) {
        if (typeof item === "string") {
          parts.push(item);
        } else if (item && typeof item === "object") {
          if ("name" in item && "children" in item) {
            const tag = item as { children?: unknown[] };
            if (tag.children) parts.push(extractText(tag.children));
          } else if ("props" in item && typeof item.props === "object" && item.props !== null) {
            const props = item.props as { children?: unknown };
            if (props.children) {
              if (typeof props.children === "string") {
                parts.push(props.children);
              } else if (Array.isArray(props.children)) {
                parts.push(extractText(props.children));
              }
            }
          }
        }
      }
      return parts.join("");
    }

    const content = lines.join("\n");
    return new Tag(this.render, { ...attributes, content }, []);
  },
};
