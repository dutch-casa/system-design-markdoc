---
title: Math (KaTeX)
description: LaTeX math rendering with KaTeX
---

# Math (KaTeX)

Render LaTeX mathematical expressions using [KaTeX](https://katex.org/). KaTeX provides fast, high-quality math typesetting.

## Syntax

```text
{​% math %}
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
{​% /math %}
```

For display mode (centered, larger):

```text
{​% math display=true %}
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
{​% /math %}
```

## Inline Math

Inline math renders within the text flow. The quadratic formula {% math %}x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}{% /math %} is commonly used.

```text
The formula {​% math %}x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}{​% /math %} is used.
```

## Display Math

Display math is centered and larger, suitable for important equations.

{% math display=true %}
E = mc^2
{% /math %}

```text
{​% math display=true %}
E = mc^2
{​% /math %}
```

## Examples

### Fractions and Roots

{% math display=true %}
\sqrt{\frac{a^2 + b^2}{c^2}} = \frac{\sqrt{a^2 + b^2}}{c}
{% /math %}

```text
{​% math display=true %}
\sqrt{\frac{a^2 + b^2}{c^2}} = \frac{\sqrt{a^2 + b^2}}{c}
{​% /math %}
```

### Summations and Products

{% math display=true %}
\sum\_{i=1}^{n} i = \frac{n(n+1)}{2}
{% /math %}

{% math display=true %}
\prod\_{i=1}^{n} i = n!
{% /math %}

```text
{​% math display=true %}
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
{​% /math %}

{​% math display=true %}
\prod_{i=1}^{n} i = n!
{​% /math %}
```

### Integrals

{% math display=true %}
\int\_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
{% /math %}

```text
{​% math display=true %}
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
{​% /math %}
```

### Matrices

{% math display=true %}
\begin{pmatrix} a & b \\\\ c & d \end{pmatrix} \begin{pmatrix} x \\\\ y \end{pmatrix} = \begin{pmatrix} ax + by \\\\ cx + dy \end{pmatrix}
{% /math %}

```text
{​% math display=true %}
\begin{pmatrix} a & b \\\\ c & d \end{pmatrix} \begin{pmatrix} x \\\\ y \end{pmatrix} = \begin{pmatrix} ax + by \\\\ cx + dy \end{pmatrix}
{​% /math %}
```

### Greek Letters

{% math display=true %}
\alpha, \beta, \gamma, \delta, \epsilon, \zeta, \eta, \theta, \iota, \kappa, \lambda, \mu
{% /math %}

{% math display=true %}
\nu, \xi, \pi, \rho, \sigma, \tau, \upsilon, \phi, \chi, \psi, \omega
{% /math %}

### Aligned Equations

{% math display=true %}
\begin{aligned} f(x) &= x^2 + 2x + 1 \\\\ &= (x + 1)^2 \end{aligned}
{% /math %}

```text
{​% math display=true %}
\begin{aligned} f(x) &= x^2 + 2x + 1 \\\\ &= (x + 1)^2 \end{aligned}
{​% /math %}
```

### Set Notation

{% math display=true %}
\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}
{% /math %}

{% math display=true %}
A \cup B = \{x : x \in A \lor x \in B\}
{% /math %}

### Logic

{% math display=true %}
\forall x \in \mathbb{R}, \exists y \in \mathbb{R} : x + y = 0
{% /math %}

{% math display=true %}
P \land Q \Rightarrow P \lor Q
{% /math %}

## Attributes Reference

| Attribute | Type      | Default | Description                               |
| --------- | --------- | ------- | ----------------------------------------- |
| `display` | `boolean` | `false` | Render in display mode (centered, larger) |

{% callout type="tip" %}
For a complete list of supported LaTeX commands, see the [KaTeX documentation](https://katex.org/docs/supported.html).
{% /callout %}
