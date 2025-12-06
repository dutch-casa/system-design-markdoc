import { Tag } from "@markdoc/markdoc";

import { Heading } from "../../components/Heading";

// Counter for generating unique IDs per document
let headingCounter = 0;

function generateID(children, attributes) {
  if (attributes.id && typeof attributes.id === "string") {
    return attributes.id;
  }
  // Generate unique ID based on index, not text content
  const index = headingCounter++;
  return `heading-${index}`;
}

export const heading = {
  render: Heading,
  children: ["inline"],
  attributes: {
    id: { type: String },
    level: { type: Number, required: true, default: 1 },
    className: { type: String },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    
    // Reset counter when we encounter a level 1 heading (typically the document title)
    // This ensures we start fresh for each document
    if (attributes.level === 1) {
      headingCounter = 0;
    }
    
    const id = generateID(children, attributes);

    return new Tag(this.render, { ...attributes, id }, children);
  },
};
