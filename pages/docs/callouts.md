---
title: Callouts
description: Highlighted callout blocks for notes, warnings, tips, and errors
---

# Callouts

Callouts highlight important information with visual distinction. Use them to draw attention to notes, warnings, tips, or errors.

## Syntax

```text
{​% callout type="note" %}
Your content here.
{​% /callout %}
```

## Variants

### Note

Default callout for general information.

{% callout type="note" %}
This is a note callout. Use it to highlight supplementary information that readers might find useful.
{% /callout %}

```text
{​% callout type="note" %}
This is a note callout.
{​% /callout %}
```

### Warning

Use for cautions and important considerations.

{% callout type="warning" %}
This is a warning callout. Use it when readers should proceed with caution or be aware of potential issues.
{% /callout %}

```text
{​% callout type="warning" %}
This is a warning callout.
{​% /callout %}
```

### Error

Use for critical issues or things to avoid.

{% callout type="error" %}
This is an error callout. Use it to highlight critical issues, breaking changes, or things that will cause problems.
{% /callout %}

```text
{​% callout type="error" %}
This is an error callout.
{​% /callout %}
```

### Tip

Use for helpful suggestions and best practices.

{% callout type="tip" %}
This is a tip callout. Use it to share best practices, shortcuts, or helpful suggestions.
{% /callout %}

```text
{​% callout type="tip" %}
This is a tip callout.
{​% /callout %}
```

## Custom Titles

Override the default title with the `title` attribute:

{% callout type="note" title="Did you know?" %}
You can customize the callout title to better fit your content.
{% /callout %}

```text
{​% callout type="note" title="Did you know?" %}
You can customize the callout title.
{​% /callout %}
```

{% callout type="warning" title="Deprecation Notice" %}
This API will be removed in version 3.0. Please migrate to the new endpoint.
{% /callout %}

```text
{​% callout type="warning" title="Deprecation Notice" %}
This API will be removed in version 3.0.
{​% /callout %}
```

## Rich Content

Callouts support paragraphs, lists, and inline formatting:

{% callout type="tip" title="Pro Tips" %}
You can include rich content in callouts:

- **Bold text** for emphasis
- `inline code` for technical terms
- [Links](/docs) to other pages

Multiple paragraphs work too.
{% /callout %}

```text
{​% callout type="tip" title="Pro Tips" %}
You can include rich content in callouts:

- **Bold text** for emphasis
- `inline code` for technical terms
- [Links](/docs) to other pages
{​% /callout %}
```

## Attributes Reference

| Attribute | Type                                            | Default       | Description                 |
| --------- | ----------------------------------------------- | ------------- | --------------------------- |
| `type`    | `"note"` \| `"warning"` \| `"error"` \| `"tip"` | `"note"`      | Visual style of the callout |
| `title`   | `string`                                        | Based on type | Custom title text           |
