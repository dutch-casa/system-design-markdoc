import { Diff } from "@/components/Diff";
import React from "react";
import { Tag } from "@markdoc/markdoc";

function extractRawText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  
  if (Array.isArray(node)) {
    const parts: string[] = [];
    for (const item of node) {
      // Strings in array are text content - add directly
      if (typeof item === "string") {
        parts.push(item);
      } else {
        const text = extractRawText(item);
        if (text) parts.push(text);
      }
    }
    // Join paragraphs with newlines, but join text within paragraphs with nothing
    return parts.join("\n");
  }
  
  if (typeof node === "object") {
    // PRIORITY: Handle fence nodes - get raw content from attributes (preserves whitespace)
    if (node.type === "fence") {
      if (node.attributes && node.attributes.content !== undefined && node.attributes.content !== null) {
        return String(node.attributes.content);
      }
    }
    
    // Handle paragraph nodes - extract from children and add newline after
    if (node.type === "paragraph") {
      if (node.children && Array.isArray(node.children)) {
        // Join children without newlines (they're inline text)
        const paraParts: string[] = [];
        for (const child of node.children) {
          if (typeof child === "string") {
            paraParts.push(child);
          } else {
            const text = extractRawText(child);
            if (text) paraParts.push(text);
          }
        }
        return paraParts.join("") + "\n";
      }
    }
    
    // Handle text nodes - content can be in different places
    if (node.type === "text") {
      if (node.content !== undefined && node.content !== null) {
        return String(node.content);
      }
      if (node.value !== undefined && node.value !== null) {
        return String(node.value);
      }
      // Text nodes might have children that are strings
      if (node.children && Array.isArray(node.children)) {
        return node.children.filter(c => typeof c === "string").join("") || extractRawText(node.children);
      }
    }
    
    // Try content/value properties directly
    if (node.content !== undefined && node.content !== null) {
      return String(node.content);
    }
    if (node.value !== undefined && node.value !== null) {
      return String(node.value);
    }
    
    // Handle nodes with children - recursively extract
    if (node.children && Array.isArray(node.children)) {
      return extractRawText(node.children);
    }
  }
  
  return "";
}

export const diff = {
  render: ({ originalText, newText, language }: { originalText?: string; newText?: string; language?: string }) => {
    return React.createElement(Diff, { originalText: originalText || "", newText: newText || "", language });
  },
  children: ["fence", "original", "new"], // Accept fence nodes directly, or original/new tags for backward compatibility
  attributes: {
    language: {
      type: String,
    },
    originalText: { type: String },
    newText: { type: String },
  },
  transform(node: any, config: any) {
    const attributes = node.transformAttributes(config);
    
    let originalText = "";
    let newText = "";
    
    // PRIORITY: Look for fence nodes first (preserves whitespace perfectly)
    const fenceNodes: any[] = [];
    for (const child of node.children || []) {
      if (child && child.type === "fence") {
        fenceNodes.push(child);
      }
    }
    
    // If we have fence nodes, use them (first = original, second = new)
    if (fenceNodes.length >= 2) {
      originalText = String(fenceNodes[0].attributes?.content || "");
      newText = String(fenceNodes[1].attributes?.content || "");
    } else if (fenceNodes.length === 1) {
      // Only one fence - treat as original
      originalText = String(fenceNodes[0].attributes?.content || "");
    }
    
    // Fallback: Use original/new tags if no fence nodes found
    if (!originalText && !newText) {
      // Transform children first - this runs original/new transforms
      const children = node.transformChildren(config);
      
      // Extract from transformed children
      for (const child of children || []) {
        if (child && typeof child === "object") {
          // Check for __content attribute from original/new transforms
          if ("attributes" in child && child.attributes && "__content" in child.attributes) {
            const content = (child.attributes as any).__content;
            const tagType = (child.attributes as any).__tag;
            if (tagType === "original") {
              originalText = String(content);
            } else if (tagType === "new") {
              newText = String(content);
            }
          }
        }
      }
      
      // Final fallback: raw extraction from original/new tags
      if (!originalText || !newText) {
        for (const child of node.children || []) {
          if (child && child.type === "tag") {
            if (child.tag === "original" && !originalText) {
              originalText = extractRawText(child.children || []);
            } else if (child.tag === "new" && !newText) {
              newText = extractRawText(child.children || []);
            }
          }
        }
      }
    }
    
    // Return Tag with extracted text as attributes, empty children
    return new Tag(this.render, { ...attributes, originalText, newText }, []);
  },
};

// Extract text from transformed children - preserve line breaks exactly
function extractTextFromTransformed(items: unknown[]): string {
  const parts: string[] = [];

  for (const item of items) {
    if (typeof item === "string") {
      parts.push(item);
    } else if (item && typeof item === "object") {
      // Handle Tag objects (transformed nodes like paragraphs)
      if ("name" in item && "children" in item) {
        const tag = item as { name?: string; children?: unknown[] };
        
        if (tag.children && Array.isArray(tag.children)) {
          const text = extractTextFromTransformed(tag.children);
          parts.push(text);
          
          // CRITICAL: Add newline after paragraph to preserve line structure
          // Each paragraph represents a line in the original markdown
          if (tag.name === "p") {
            parts.push("\n");
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
            parts.push(extractTextFromTransformed(props.children));
          }
        }
      }
    }
  }

  // Join with empty string - newlines are already added after paragraphs
  const result = parts.join("");
  return result;
}

export const original = {
  render: () => null,
  children: ["paragraph", "tag", "list", "fence"],
  attributes: {},
  transform(node: any, config: any) {
    // Transform children first, then extract text - like math tag
    const children = node.transformChildren(config);
    const content = extractTextFromTransformed(children);
    return new Tag(this.render, { __content: content, __tag: "original" }, []);
  },
};

export const newTag = {
  render: () => null,
  children: ["paragraph", "tag", "list", "fence"],
  attributes: {},
  transform(node: any, config: any) {
    // Transform children first, then extract text - like math tag
    const children = node.transformChildren(config);
    const content = extractTextFromTransformed(children);
    return new Tag(this.render, { __content: content, __tag: "new" }, []);
  },
};
