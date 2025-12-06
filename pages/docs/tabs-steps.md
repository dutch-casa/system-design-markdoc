---
title: Tabs & Steps
description: Multi-panel content and numbered procedures
---

# Tabs & Steps

Interactive components for organizing content and guiding users through procedures.

---

## Tabs

Display content in switchable panels using the `{%​ tabs %}` tag.

### Syntax

````md
{​%​ tabs %}
{​%​ tab label="JavaScript" %}
```javascript
console.log("Hello");
```
{​%​ /tab %}
{​%​ tab label="Python" %}
```python
print("Hello")
```
{​%​ /tab %}
{​%​ /tabs %}
````

### Example

{% tabs %}
{% tab label="npm" %}
```bash
npm install my-package
npm run dev
```
{% /tab %}
{% tab label="yarn" %}
```bash
yarn add my-package
yarn dev
```
{% /tab %}
{% tab label="bun" %}
```bash
bun add my-package
bun dev
```
{% /tab %}
{% /tabs %}

### Multiple Sections

Use tabs for different approaches or environments:

{% tabs %}
{% tab label="REST API" %}
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});
const user = await response.json();
```
{% /tab %}
{% tab label="GraphQL" %}
```typescript
const result = await client.query({
  query: gql`
    mutation CreateUser($name: String!) {
      createUser(name: $name) {
        id
        name
      }
    }
  `,
  variables: { name: 'Alice' }
});
```
{% /tab %}
{% tab label="tRPC" %}
```typescript
const user = await trpc.user.create.mutate({
  name: 'Alice'
});
```
{% /tab %}
{% /tabs %}

---

## Steps

Create numbered, sequential procedures using the `{%​ steps %}` tag.

### Syntax

```md
{​%​ steps %}
{​%​ step %}
First step description
{​%​ /step %}
{​%​ step %}
Second step description
{​%​ /step %}
{​%​ /steps %}
```

### Example

{% steps %}
{% step %}
**Install dependencies**

Run the package manager install command:

```bash
bun install
```
{% /step %}
{% step %}
**Configure environment**

Create a `.env` file with your settings:

```bash
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your_key_here
```
{% /step %}
{% step %}
**Run migrations**

Initialize the database schema:

```bash
bun run db:migrate
```
{% /step %}
{% step %}
**Start the server**

Launch the development server:

```bash
bun dev
```

Your app is now running at http://localhost:3000
{% /step %}
{% /steps %}

### Multi-step Migration

Steps are ideal for migration guides:

{% steps %}
{% step %}
**Update dependencies**

Upgrade to the latest versions:

```bash
bun update @myorg/lib@latest
```
{% /step %}
{% step %}
**Replace deprecated imports**

{% diff language="typescript" %}
- import { oldApi } from '@myorg/lib';
+ import { newApi } from '@myorg/lib/v2';
{% /diff %}
{% /step %}
{% step %}
**Update function signatures**

The API signature has changed:

{% diff language="typescript" %}
- const result = oldApi(data);
+ const result = await newApi({ data, options });
{% /diff %}
{% /step %}
{% step %}
**Test the changes**

Run your test suite:

```bash
bun test
```
{% /step %}
{% /steps %}

---

## Combining Tabs and Steps

Use tabs within steps for platform-specific instructions:

{% steps %}
{% step %}
**Choose your deployment platform**

{% tabs %}
{% tab label="Vercel" %}
```bash
vercel deploy
```
{% /tab %}
{% tab label="Netlify" %}
```bash
netlify deploy --prod
```
{% /tab %}
{% tab label="Fly.io" %}
```bash
fly deploy
```
{% /tab %}
{% /tabs %}
{% /step %}
{% step %}
**Configure environment variables**

Set your production environment variables in your platform's dashboard.
{% /step %}
{% step %}
**Verify deployment**

Check that your application is running correctly at the production URL.
{% /step %}
{% /steps %}

