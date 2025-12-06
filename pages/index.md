---
title: SysDoc
description: System architecture documentation
---

# SysDoc

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

```filetree
pages/
components/
  ui/
markdoc/
  tags/
  nodes/
lib/
public/
```

{% callout type="tip" %}
Press **⌘K** (or **Ctrl+K**) anywhere to open the command palette and search documentation.
{% /callout %}

[Get Started →](/docs)
