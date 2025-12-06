---
title: UI Components
description: Interactive UI elements for enhanced documentation
---

# UI Components

Rich interactive components for organizing and presenting content.

---

## Collapsible

Hide detailed content behind an expandable section using the `{%​ collapsible %}` tag.

### Syntax

```md
{​%​ collapsible title="Advanced Configuration" %}
Content that can be hidden...
{​%​ /collapsible %}
```

### Example

{% collapsible title="Environment Variables" %}
Configure these environment variables in your `.env` file:

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `API_TIMEOUT` | Request timeout in milliseconds | `5000` |
| `LOG_LEVEL` | Logging verbosity | `info` |

{% /collapsible %}

{% collapsible title="Migration from v1 to v2" %}
Follow these steps to migrate:

1. Update package versions
2. Replace deprecated imports
3. Update configuration format
4. Test thoroughly before deploying

See the [migration guide](#) for detailed instructions.
{% /collapsible %}

### Use Cases

- Optional advanced instructions
- Detailed API specifications
- Troubleshooting sections
- Historical context or rationale

---

## Glossary

Define terms inline with hover tooltips using the `{%​ glossary %}` tag.

### Syntax

```md
{​%​ glossary term="Event Sourcing" %}
A pattern where state changes are stored as a sequence of events
{​%​ /glossary %}
```

### Example

In microservices architecture, {% glossary term="Event Sourcing" %}A pattern where all changes to application state are stored as a sequence of events{% /glossary %} is often combined with {% glossary term="CQRS" %}Command Query Responsibility Segregation - separating read and write operations{% /glossary %} to handle complex domains.

The {% glossary term="Saga Pattern" %}A design pattern for managing distributed transactions across multiple services{% /glossary %} helps coordinate long-running business processes.

### Benefits

- Inline definitions without breaking flow
- No scrolling to footnotes
- Consistent terminology
- Better comprehension for new readers

---

## Card Grid

Display items in a responsive grid using the `{%​ cardgrid %}` tag.

### Syntax

```md
{​%​ cardgrid %}
{​%​ card icon="Zap" title="Fast" %}
Description here
{​%​ /card %}
{​%​ card icon="Lock" title="Secure" %}
Description here
{​%​ /card %}
{​%​ /cardgrid %}
```

### Example (3 Columns)

{% cardgrid columns=3 %}
{% card icon="Zap" title="Performance" %}
Built for speed with optimized rendering and minimal bundle size.
{% /card %}
{% card icon="Shield" title="Type Safety" %}
Full TypeScript support with strict type checking and inference.
{% /card %}
{% card icon="Puzzle" title="Composable" %}
Mix and match components to build exactly what you need.
{% /card %}
{% card icon="Sparkles" title="Modern" %}
Uses the latest React patterns and best practices.
{% /card %}
{% card icon="Package" title="Tree-shakable" %}
Only bundle what you use with automatic tree-shaking.
{% /card %}
{% card icon="Palette" title="Themeable" %}
Customize every aspect with CSS variables and tokens.
{% /card %}
{% /cardgrid %}

### Example (2 Columns)

{% cardgrid columns=2 %}
{% card icon="Database" title="PostgreSQL" %}
Primary relational database for structured data, transactions, and complex queries.
{% /card %}
{% card icon="Zap" title="Redis" %}
In-memory cache for session storage, rate limiting, and real-time features.
{% /card %}
{% card icon="Box" title="S3" %}
Object storage for user uploads, static assets, and backups.
{% /card %}
{% card icon="Search" title="Elasticsearch" %}
Full-text search engine for fast, relevant search results.
{% /card %}
{% /cardgrid %}

### Icon Options

Use any [Lucide icon](https://lucide.dev/icons) name:

- **Common**: `Check`, `X`, `AlertTriangle`, `Info`, `HelpCircle`
- **Tech**: `Code`, `Database`, `Server`, `Cloud`
- **Actions**: `Play`, `Pause`, `Download`, `Upload`, `Send`
- **UI**: `Menu`, `Settings`, `User`, `Home`, `Search`

### Column Options

Choose 2, 3, or 4 columns (defaults to 3):

```md
{​%​ cardgrid columns=2 %}
<!-- 2 columns on desktop -->
{​%​ /cardgrid %}

{​%​ cardgrid columns=4 %}
<!-- 4 columns on desktop -->
{​%​ /cardgrid %}
```

All grids are responsive and stack on mobile.

---

## Quote

Display attributed quotes using the `{%​ quote %}` tag.

### Syntax

```md
{​%​ quote author="Martin Fowler" source="Refactoring" %}
Any fool can write code that a computer can understand.
Good programmers write code that humans can understand.
{​%​ /quote %}
```

### Example

{% quote author="Donald Knuth" %}
Premature optimization is the root of all evil.
{% /quote %}

{% quote author="Kent Beck" source="Extreme Programming Explained" %}
Make it work, make it right, make it fast.
{% /quote %}

{% quote author="Fred Brooks" source="The Mythical Man-Month" %}
Adding manpower to a late software project makes it later.
{% /quote %}

### Attributes

- `author` - Person being quoted (optional)
- `source` - Book, article, or context (optional)

Both attributes are optional but at least one is recommended for attribution.

---

## Combining Components

These components work well together:

{% cardgrid columns=2 %}
{% card icon="FileText" title="Documentation" %}
Use {% glossary term="Collapsible" %}Sections that can expand and collapse to hide or show content{% /glossary %} for optional details.
{% /card %}
{% card icon="BookOpen" title="Tutorials" %}
Combine {% glossary term="Tabs" %}Multi-panel content switchers{% /glossary %} with {% glossary term="Steps" %}Numbered sequential procedures{% /glossary %} for platform-specific guides.
{% /card %}
{% /cardgrid %}

{% collapsible title="Example: Complex Feature Documentation" %}

{% steps %}
{% step %}
Choose your approach:

{% tabs %}
{% tab label="Async" %}
```typescript
const data = await fetchData();
```
{% /tab %}
{% tab label="Sync" %}
```typescript
const data = fetchDataSync();
```
{% /tab %}
{% /tabs %}
{% /step %}
{% step %}
Process the results according to your needs.
{% /step %}
{% /steps %}

{% /collapsible %}

