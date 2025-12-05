---
title: Code Blocks
description: Syntax-highlighted code blocks with language support
---

# Code Blocks

Code blocks display syntax-highlighted code using Prism.js. Use standard Markdown fenced code blocks with a language identifier.

## Syntax

````md
```language
your code here
```
````

## Language Examples

### JavaScript

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

const result = greet("World");
console.log(result);
```

### TypeScript

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(data: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: data.name ?? "Anonymous",
    email: data.email ?? "",
  };
}
```

### React / JSX

```jsx
function Button({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: str
    name: str
    email: Optional[str] = None

def greet(user: User) -> str:
    return f"Hello, {user.name}!"
```

### Elixir

```elixir
defmodule MyApp.User do
  @moduledoc "User context module"

  def create(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  def get!(id), do: Repo.get!(User, id)
end
```

### Bash / Shell

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build
```

### SQL

```sql
SELECT
  users.id,
  users.name,
  COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON orders.user_id = users.id
WHERE users.created_at > '2024-01-01'
GROUP BY users.id, users.name
ORDER BY order_count DESC
LIMIT 10;
```

### JSON

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0"
  }
}
```

### YAML

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
```

### CSS

```css
.button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  border-radius: 0.375rem;
  transition: background-color 150ms ease;
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

### HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <main>
      <h1>Hello World</h1>
    </main>
  </body>
</html>
```

## Inline Code

Use single backticks for inline code: `const x = 42`

```md
Use single backticks for inline code: `const x = 42`
```

## Supported Languages

Prism.js supports many languages out of the box. Common identifiers:

| Language   | Identifier            |
| ---------- | --------------------- |
| JavaScript | `javascript`, `js`    |
| TypeScript | `typescript`, `ts`    |
| React JSX  | `jsx`                 |
| React TSX  | `tsx`                 |
| Python     | `python`, `py`        |
| Elixir     | `elixir`              |
| Bash       | `bash`, `shell`, `sh` |
| SQL        | `sql`                 |
| JSON       | `json`                |
| YAML       | `yaml`, `yml`         |
| CSS        | `css`                 |
| HTML       | `html`                |
| Markdown   | `markdown`, `md`      |

{% callout type="tip" %}
If a language isn't highlighted, check the [Prism.js documentation](https://prismjs.com/#supported-languages) for the correct identifier.
{% /callout %}
