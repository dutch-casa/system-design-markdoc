import React from "react";
import { nodes, Tag } from "@markdoc/markdoc";
import { CodeBlock } from "@/components/CodeBlock";
import { Mermaid } from "@/components/Mermaid";

// Custom Fence component that handles mermaid code blocks
function FenceRenderer({
  children,
  "data-language": dataLanguage,
}: {
  children?: React.ReactNode;
  "data-language"?: string;
}) {
  const lang = dataLanguage;

  // Extract code content from children
  let code = "";
  if (typeof children === "string") {
    code = children;
  } else if (Array.isArray(children)) {
    code = children
      .map((child) => {
        if (typeof child === "string") return child;
        if (typeof child === "object" && child !== null && "props" in child) {
          const obj = child as { props?: { children?: unknown } };
          return extractTextContent(obj.props?.children);
        }
        return "";
      })
      .join("");
  }

  if (lang === "mermaid") {
    return <Mermaid chart={code} />;
  }

  return <CodeBlock data-language={lang}>{code}</CodeBlock>;
}

function extractTextContent(children: unknown): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === "string") return child;
        if (typeof child === "object" && child !== null && "props" in child) {
          const obj = child as { props?: { children?: unknown } };
          return extractTextContent(obj.props?.children);
        }
        return "";
      })
      .join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    const obj = children as { props?: { children?: unknown } };
    return extractTextContent(obj.props?.children);
  }
  return "";
}

export const fence = {
  render: FenceRenderer,
  attributes: nodes.fence.attributes,
};
