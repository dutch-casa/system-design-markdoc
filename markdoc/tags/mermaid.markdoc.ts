import { Tag } from "@markdoc/markdoc";
import { Mermaid } from "../../components/Mermaid";

export const mermaid = {
  render: Mermaid,
  description: "Render a mermaid diagram",
  children: ["inline", "text", "paragraph"],
  attributes: {
    chart: {
      type: String,
      required: false,
      description: "The mermaid diagram definition (alternative to children)",
    },
  },
  transform(node: any, config: any) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    // Extract text content from transformed children
    function extractText(items: unknown[]): string {
      const parts: string[] = [];

      for (const item of items) {
        if (typeof item === "string") {
          parts.push(item);
        } else if (item && typeof item === "object") {
          // Handle Tag objects (transformed nodes)
          if ("name" in item && "children" in item) {
            const tag = item as { name?: string; children?: unknown[] };
            if (tag.children && Array.isArray(tag.children)) {
              parts.push(extractText(tag.children));
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

      return parts.join("\n");
    }

    // Use chart attribute if provided, otherwise extract from children
    let chartContent = attributes.chart;
    if (!chartContent && children && children.length > 0) {
      chartContent = extractText(children).trim();
    }

    // Normalize line endings
    if (chartContent) {
      chartContent = chartContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    return new Tag(this.render, { chart: chartContent || "" }, []);
  },
};
