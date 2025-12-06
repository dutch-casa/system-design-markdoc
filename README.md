# Architecture Documentation Site

A technical documentation platform built with Next.js 16 and Markdoc. Designed for architecture documentation, decision records, formal proofs, and API references.

## Features

### Markdoc Extensions

- **Architecture Decision Records (ADRs)**: Structured ADR components with status tracking (proposed, accepted, deprecated, superseded, rejected), metadata fields, and automatic anchor linking.
- **Mermaid Diagrams**: Embedded diagram support with error boundaries and client-side rendering.
- **KaTeX Mathematics**: LaTeX math rendering for equations and formulas.
- **Lean 4 Proof Blocks**: Live proof verification via lean4web integration. Supports Mathlib, Std, and base Lean 4 environments.
- **Callouts**: Styled information boxes for notes, warnings, and other callout types.
- **Syntax Highlighting**: Prism.js-based code blocks with language detection.

### Documentation Infrastructure

- **OpenAPI Documentation**: Renders OpenAPI 3.x specifications from YAML. Includes sidebar navigation, endpoint grouping, parameter tables, request/response schemas.
- **Navigation System**: Configurable sidebar with icon support (lucide-react). Sections defined in `lib/navigation.ts`.
- **Version Support**: Git tag-based versioning with semver parsing and version switching.
- **Backlinks**: Bidirectional link tracking across markdown pages and Mermaid diagram click directives.
- **Global Search**: Command palette (Cmd+K) for searching pages and headings.

### Component Architecture

- **Compound Components**: All major components (ADR, ProofBlock, Endpoint) use the compound component pattern with polymorphic `as` prop support.
- **shadcn/ui Foundation**: Full component library built on Radix UI primitives.
- **Dark/Light Theme**: System-aware theming via next-themes.

## Requirements

- Node.js 20+
- Bun (recommended) or npm/yarn

## Installation/

```bash
# Clone the repository
git clone <repository-url>
cd architecture-site

# Install dependencies
bun install
```

## Development

```bash
# Start the development server
bun run dev

# Open http://localhost:3000
```

## Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## CLI Tools

Scaffold documentation structure using the built-in CLI:

```bash
# Create a new documentation group
bun run docs:group "Domain Model" --icon Database

# Add a page to an existing group
bun run docs:page domain-model entities

# List current documentation structure
bun run docs:list
```

### Available Icons

The CLI supports any lucide-react icons

### Page Templates

- `default`: Standard documentation page
- `adr`: Architecture Decision Record template with context/decision/consequences sections
- `index`: Group overview page

```bash
bun run docs:page decisions "Use Event Sourcing" --template adr
```

## Project Structure

```
architecture-site/
├── components/
│   ├── openapi/       # OpenAPI documentation components
│   ├── ui/            # shadcn/ui primitives
│   ├── ADR.tsx        # Architecture Decision Record
│   ├── ProofBlock.tsx # Lean 4 proof embedding
│   ├── Mermaid.tsx    # Diagram rendering
│   ├── KaTeX.tsx      # Math rendering
│   └── ...
├── hooks/             # React hooks
├── lib/
│   ├── navigation.ts  # Sidebar configuration
│   ├── versioning.ts  # Version management
│   └── backlinks.ts   # Link tracking
├── markdoc/
│   ├── config.tsx     # Markdoc configuration
│   ├── tags/          # Custom Markdoc tags
│   └── nodes/         # Custom Markdoc nodes
├── pages/
│   ├── docs/          # Documentation pages (markdown)
│   ├── api-docs.tsx   # OpenAPI documentation page
│   └── ...
├── public/
│   └── openapi.yaml   # OpenAPI specification (optional)
└── scripts/
    └── docs-cli.ts    # Documentation scaffolding CLI
```

## Configuration

### Navigation

Edit `lib/navigation.ts` to configure sidebar sections:

```typescript
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    links: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/installation", label: "Installation" },
    ],
  },
];
```

### OpenAPI Documentation

Place an OpenAPI 3.x YAML file at `public/openapi.yaml`. The `/api-docs` page will render it automatically.

### Markdoc Tags

Custom tags are defined in `markdoc/tags/`. Each tag has:

- A schema definition (attributes, self-closing, etc.)
- A React component for rendering

## Markdoc Usage

### ADR

```markdown
{% adr id="001" title="Use Event Sourcing" status="accepted" date="2024-01-15" %}

## Context

The system requires full audit trails...

## Decision

We will use event sourcing for the order domain.

## Consequences

- Complete event history preserved
- Increased storage requirements

{% /adr %}
```

### Mermaid Diagram

```markdown
{% mermaid %}
graph TD
A[Client] --> B[API Gateway]
B --> C[Service A]
B --> D[Service B]
{% /mermaid %}
```

### Math

```markdown
{% math %}
E = mc^2
{% /math %}
```

### Proof Block

```markdown
{% proof project="mathlib-stable" %}
theorem add_comm (a b : Nat) : a + b = b + a := by
induction a with
| zero => simp
| succ n ih => simp [Nat.succ_add, ih]
{% /proof %}
```

### Callout

```markdown
{% callout type="warning" %}
This operation cannot be undone.
{% /callout %}
```

## Technology Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Markdoc
- Radix UI
- TypeScript 5
- Bun

## License

MIT
