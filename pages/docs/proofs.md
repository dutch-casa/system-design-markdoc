---
title: Proofs (Lean 4)
description: Interactive Lean 4 proof blocks
---

# Proofs (Lean 4)

Embed interactive Lean 4 proof blocks that run in the browser using [lean4web](https://live.lean-lang.org/).

## Syntax

```text
{​% proof %}
theorem add_comm (a b : Nat) : a + b = b + a := by
  omega
{​% /proof %}
```

With a specific project:

```text
{​% proof project="mathlib-stable" %}
-- Lean code here
{​% /proof %}
```

## Basic Example

A simple theorem with automatic proof:

{% proof %}
theorem add_zero (n : Nat) : n + 0 = n := by
rfl
{% /proof %}

```text
{​% proof %}
theorem add_zero (n : Nat) : n + 0 = n := by
  rfl
{​% /proof %}
```

## Interactive Features

Click "Run" to execute the proof. The embedded editor allows you to modify the code and re-run.

{% proof %}
-- Try modifying this proof!
theorem add_succ (n m : Nat) : n + Nat.succ m = Nat.succ (n + m) := by
rfl
{% /proof %}

## Project Environments

### mathlib-stable (default)

Full Mathlib library available. Best for mathematical proofs.

{% proof project="mathlib-stable" %}
import Mathlib.Data.Nat.Basic

theorem nat_add_comm (a b : Nat) : a + b = b + a := by
exact Nat.add_comm a b
{% /proof %}

```text
{​% proof project="mathlib-stable" %}
import Mathlib.Data.Nat.Basic

theorem nat_add_comm (a b : Nat) : a + b = b + a := by
  exact Nat.add_comm a b
{​% /proof %}
```

### std

Standard library only, faster loading.

{% proof project="std" %}
theorem list_append_nil (xs : List α) : xs ++ [] = xs := by
induction xs with
| nil => rfl
| cons x xs ih => simp [ih]
{% /proof %}

```text
{​% proof project="std" %}
theorem list_append_nil (xs : List α) : xs ++ [] = xs := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [ih]
{​% /proof %}
```

### lean

Core Lean only, fastest loading but minimal library.

{% proof project="lean" %}
def factorial : Nat → Nat
| 0 => 1
| n + 1 => (n + 1) \* factorial n

#eval factorial 5
{% /proof %}

```text
{​% proof project="lean" %}
def factorial : Nat → Nat
  | 0 => 1
  | n + 1 => (n + 1) * factorial n

#eval factorial 5
{​% /proof %}
```

## Examples

### Induction Proof

{% proof project="mathlib-stable" %}
import Mathlib.Data.Finset.Basic
import Mathlib.Algebra.BigOperators.Group.Finset.Basic

theorem sum*first_n (n : Nat) : 2 * (Finset.range (n + 1)).sum id = n \_ (n + 1) := by
induction n with
| zero => simp
| succ n ih =>
rw [Finset.range_succ, Finset.sum_insert Finset.not_mem_range_self]
ring_nf
omega
{% /proof %}

### Type-level Programming

{% proof project="lean" %}
inductive Vec (α : Type) : Nat → Type where
| nil : Vec α 0
| cons : α → Vec α n → Vec α (n + 1)

def Vec.append : Vec α n → Vec α m → Vec α (n + m)
| .nil, ys => ys
| .cons x xs, ys => .cons x (xs.append ys)

#check Vec.append
{% /proof %}

### Tactic Proof

{% proof %}
example (p q r : Prop) (hp : p) (hq : q) (hr : r) : p ∧ q ∧ r := by
constructor
· exact hp
· constructor
· exact hq
· exact hr
{% /proof %}

## Attributes Reference

| Attribute | Type     | Default            | Description                         |
| --------- | -------- | ------------------ | ----------------------------------- |
| `code`    | `string` | -                  | Lean code (alternative to children) |
| `project` | `string` | `"mathlib-stable"` | Lean environment to use             |

### Available Projects

| Project          | Description           | Use Case            |
| ---------------- | --------------------- | ------------------- |
| `mathlib-stable` | Full Mathlib library  | Mathematical proofs |
| `mathlib-demo`   | Mathlib demo version  | Quick demos         |
| `std`            | Standard library only | General programming |
| `lean`           | Core Lean only        | Minimal examples    |

{% callout type="note" %}
Proofs run in the browser via WebAssembly. Initial load may take a few seconds as the Lean environment initializes.
{% /callout %}

{% callout type="tip" %}
For complex proofs, use `mathlib-stable` to access the full mathematical library including tactics like `omega`, `ring`, `simp`, and more.
{% /callout %}
