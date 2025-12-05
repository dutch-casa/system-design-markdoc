---
title: Documentation System
description: A modern documentation system built with Next.js and Markdoc
---

# Documentation System

A modern, extensible documentation system built with Next.js, Markdoc, and Tailwind CSS.

## Features

- **Markdoc** for content authoring with custom tags
- **Syntax highlighting** via Prism.js
- **Math rendering** with KaTeX
- **Diagrams** with Mermaid (pan/zoom support)
- **Interactive proofs** with Lean 4 integration
- **Dark mode** support
- **Command palette** search (⌘K)

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd architecture-site

# Install dependencies
bun install

# Start development server
bun dev
```

## Project Structure

```
pages/           # Markdown content files
components/      # React components
  ui/            # Base UI components (shadcn)
markdoc/         # Markdoc configuration
  tags/          # Custom block tags
  nodes/         # Node overrides
lib/             # Utilities and shared code
public/          # Static assets
```

{% callout type="tip" %}
Press **⌘K** (or **Ctrl+K**) anywhere to open the command palette and search documentation.
{% /callout %}

[Get Started →](/docs)
