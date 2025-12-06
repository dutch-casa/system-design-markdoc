import { adr } from "./tags/adr.markdoc";
import { callout } from "./tags/callout.markdoc";
import { math } from "./tags/math.markdoc";
import { mermaid } from "./tags/mermaid.markdoc";
import { proof } from "./tags/proof.markdoc";
import { tabs, tab } from "./tags/tabs.markdoc";
import { steps, step } from "./tags/steps.markdoc";
import { filetree } from "./tags/filetree.markdoc";
import { terminal } from "./tags/terminal.markdoc";
import { diff, original, newTag } from "./tags/diff.markdoc";
import { collapsible } from "./tags/collapsible.markdoc";
import { glossary } from "./tags/glossary.markdoc";
import { cardgrid, card } from "./tags/cardgrid.markdoc";
import { quote } from "./tags/quote.markdoc";
import { fence } from "./nodes/fence.markdoc";
import { heading } from "./nodes/heading.markdoc";
import { Tabs } from "@/components/Tabs";
import { Steps } from "@/components/Steps";

// Markdoc's Config type expects render to be a string, but we pass React components
// This is the standard pattern for @markdoc/next.js
export const config = {
  tags: {
    adr,
    callout,
    math,
    mermaid,
    proof,
    tabs,
    tab,
    steps,
    step,
    filetree,
    terminal,
    diff,
    original,
    new: newTag,
    collapsible,
    glossary,
    cardgrid,
    card,
    quote,
  },
  nodes: {
    fence,
    heading,
  },
};

export default config;
