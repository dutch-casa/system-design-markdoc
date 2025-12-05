---
title: Overview
description: Documentation system overview and usage guide
---

# Doc System Overview

This documentation system is built on [Markdoc](https://markdoc.dev), a powerful content authoring framework that extends Markdown with custom tags and transforms.

## How It Works

Content is written in `.md` files using standard Markdown syntax, enhanced with custom Markdoc tags for rich content blocks.

### File-based Routing

Pages are created by adding `.md` files to the `pages/` directory:

```text
pages/
  index.md          → /
  docs/
    index.md        → /docs
    callouts.md     → /docs/callouts
    math.md         → /docs/math
```

### Frontmatter

Each page can include YAML frontmatter for metadata:

```yaml
---
title: Page Title
description: Page description for SEO
---
```

## General Markdown Features

Standard Markdown syntax is fully supported. Here's a quick reference:

### Headings

```md
# Heading 1

## Heading 2

### Heading 3

#### Heading 4
```

Headings automatically generate anchor links for easy navigation.

### Text Formatting

**Bold text** with `**bold**` or `__bold__`

_Italic text_ with `*italic*` or `_italic_`

~~Strikethrough~~ with `~~strikethrough~~`

`Inline code` with backticks

### Unordered Lists

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

```md
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three
```

### Ordered Lists

1. First item
2. Second item
3. Third item
   1. Nested first
   2. Nested second

```md
1. First item
2. Second item
3. Third item
   1. Nested first
   2. Nested second
```

### Task Lists

- [x] Completed task
- [x] Another done item
- [ ] Pending task
- [ ] Future work

```md
- [x] Completed task
- [x] Another done item
- [ ] Pending task
- [ ] Future work
```

### Tables

| Column 1 | Column 2 | Column 3  |
| -------- | -------- | --------- |
| Row 1    | Data     | More data |
| Row 2    | Data     | More data |
| Row 3    | Data     | More data |

```md
| Column 1 | Column 2 | Column 3  |
| -------- | -------- | --------- |
| Row 1    | Data     | More data |
| Row 2    | Data     | More data |
```

### Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And include multiple paragraphs.

```md
> This is a blockquote.
> It can span multiple lines.
```

### Links and Images

[Link text](https://example.com) with `[text](url)`

Images with `![alt text](image-url)`

### Horizontal Rules

Use `---` or `***` for horizontal dividers:

---

## Custom Block Types

Beyond standard Markdown, this system provides custom blocks:

### Basic Blocks

| Block                            | Description                                   |
| -------------------------------- | --------------------------------------------- |
| [Callouts](/docs/callouts)       | Highlighted notes, warnings, tips, and errors |
| [Code Blocks](/docs/code-blocks) | Syntax-highlighted code with language support |

### Rich Content

| Block                      | Description                    |
| -------------------------- | ------------------------------ |
| [Math](/docs/math)         | LaTeX equations via KaTeX      |
| [Diagrams](/docs/diagrams) | Mermaid diagrams with pan/zoom |

### Advanced

| Block                  | Description                     |
| ---------------------- | ------------------------------- |
| [ADRs](/docs/adrs)     | Architecture Decision Records   |
| [Proofs](/docs/proofs) | Interactive Lean 4 proof blocks |

## Adding Custom Blocks

To create a new block type:

1. Create a React component in `components/`
2. Define the Markdoc tag in `markdoc/tags/`
3. Export from `markdoc/tags/index.ts`

```ts
// markdoc/tags/example.markdoc.ts
import { Example } from "@/components/Example";

export const example = {
  render: Example,
  attributes: {
    variant: {
      type: String,
      default: "default",
    },
  },
};
```

{% callout type="note" %}
Custom tags are automatically available in all Markdown files after being exported from the tags index.
{% /callout %}
