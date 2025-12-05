import { Tag } from "@markdoc/markdoc";
import { KaTeX } from "../../components/KaTeX";

export const math = {
  render: KaTeX,
  description: "Render LaTeX math expressions using KaTeX",
  children: ["inline", "text", "paragraph"],
  attributes: {
    display: {
      type: Boolean,
      default: false,
      description: "Whether to render in display mode (centered, larger)",
    },
  },
  transform(node: any, config: any) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    // Extract text content from transformed children, preserving all characters
    // including backslashes for LaTeX commands and newlines between paragraphs
    function extractText(items: unknown[]): string {
      const parts: string[] = [];
      let needsNewline = false;

      for (const item of items) {
        if (typeof item === "string") {
          parts.push(item);
          needsNewline = false;
        } else if (item && typeof item === "object") {
          // Handle Tag objects (transformed nodes)
          if ("name" in item && "children" in item) {
            const tag = item as { name?: string; children?: unknown[] };

            // Add newline before paragraph if we have previous content
            if (tag.name === "p" && parts.length > 0) {
              parts.push("\n");
            }

            if (tag.children && Array.isArray(tag.children)) {
              parts.push(extractText(tag.children));

              // Add newline after paragraph elements to preserve LaTeX structure
              if (tag.name === "p") {
                parts.push("\n");
                needsNewline = true;
              }
            }
          }
          // Handle React elements (if already transformed)
          else if (
            "props" in item &&
            typeof item.props === "object" &&
            item.props !== null
          ) {
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

    let mathContent = extractText(children).trim();

    // Normalize line endings but preserve structure
    mathContent = mathContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    return new Tag(this.render, { ...attributes, math: mathContent }, []);
  },
};
