import { adr } from "./tags/adr.markdoc";
import { callout } from "./tags/callout.markdoc";
import { math } from "./tags/math.markdoc";
import { mermaid } from "./tags/mermaid.markdoc";
import { proof } from "./tags/proof.markdoc";
import { fence } from "./nodes/fence.markdoc";
import { heading } from "./nodes/heading.markdoc";

// Markdoc's Config type expects render to be a string, but we pass React components
// This is the standard pattern for @markdoc/next.js
export const config = {
  tags: {
    adr,
    callout,
    math,
    mermaid,
    proof,
  },
  nodes: {
    fence,
    heading,
  },
};

export default config;
