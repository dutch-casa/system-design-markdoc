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

---

## File Trees

Visualize directory structures using code fence syntax with `filetree` language. Folders end with `/`, files without.

### Syntax

```md
\`\`\`filetree
src/
​  components/
​    Button.tsx
​    Input.tsx
​  utils/
​    helpers.ts
​  index.ts
\`\`\`
```

### Simple Example

```filetree
src/
  components/
    Button.tsx
    Input.tsx
  utils/
    helpers.ts
  index.ts
```

### Complex Example

```filetree
src/
  components/
    auth/
      LoginForm.tsx
      SignupForm.tsx
    ui/
      Button.tsx
      Input.tsx
  lib/
    db.ts
    utils.ts
  app/
    layout.tsx
    page.tsx
    middleware.ts
```

### Indentation

Use 2 spaces per nesting level. Folders are distinguished by a trailing `/`.

---

## Diffs

Show side-by-side code changes with the `{%​ diff %}` tag. Use code fences inside the diff tag - the first fence is the original version, the second is the new version.



### Example

{% diff language="javascript" %}
```javascript
// Simple greeting function
function greet(name) {
  if (!name) {
    return "Hello, stranger!";
  }
  return "Hello " + name;
}

// Usage example
const message = greet("Alice");
console.log(message);
```
```javascript
// Enhanced greeting function with formality option
function greet(name, formal = false) {
  if (!name) {
    return formal ? "Good day, stranger!" : "Hello, stranger!";
  }
  
  const prefix = formal ? "Good day" : "Hello";
  const punctuation = formal ? "." : "!";
  
  return `${prefix}, ${name}${punctuation}`;
}

// Usage examples
const casualMessage = greet("Alice");
const formalMessage = greet("Alice", true);
console.log(casualMessage);  // "Hello, Alice!"
console.log(formalMessage);  // "Good day, Alice."
```
{% /diff %}

### With Language Syntax

Add a `language` attribute for syntax highlighting within the diff. The first code fence is the original, the second is the new version:

{% diff language="typescript" %}
```typescript
// User interface definition
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// User service class
class UserService {
  private users: User[] = [];
  
  createUser(user: User): User {
    this.users.push(user);
    return user;
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
```
```typescript
// Enhanced user interface with separate name fields
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced user service with validation
class UserService {
  private users: User[] = [];
  
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date();
    const user: User = {
      ...userData,
      id: this.users.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    
    this.validateUser(user);
    this.users.push(user);
    return user;
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
  
  private validateUser(user: User): void {
    if (!user.firstName || !user.lastName) {
      throw new Error("First and last name are required");
    }
    if (!user.email.includes("@")) {
      throw new Error("Invalid email address");
    }
  }
}
```
{% /diff %}
