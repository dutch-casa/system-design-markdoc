import { Tag } from "@markdoc/markdoc";
import { ProofBlock, ProofProject } from "../../components/ProofBlock";

export const proof = {
  render: ProofBlock,
  description: "Render an interactive Lean 4 proof block with lean4web",
  children: ["inline", "text", "paragraph"],
  attributes: {
    code: {
      type: String,
      required: false,
      description: "The Lean 4 proof code (alternative to children)",
    },
    project: {
      type: String,
      required: false,
      default: "mathlib-stable",
      matches: ["mathlib-stable", "mathlib-demo", "std", "lean"],
      description: "The Lean project/environment to use",
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

    // Use code attribute if provided, otherwise extract from children
    let codeContent = attributes.code;
    if (!codeContent && children && children.length > 0) {
      codeContent = extractText(children).trim();
    }

    // Normalize line endings
    if (codeContent) {
      codeContent = codeContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    const project: ProofProject = attributes.project ?? "mathlib-stable";

    return new Tag(this.render, { code: codeContent || "", project }, []);
  },
};
