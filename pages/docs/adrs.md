---
title: Architecture Decision Records
description: Document architecture decisions with ADR blocks
---

# Architecture Decision Records

ADRs (Architecture Decision Records) document important architectural decisions with their context and consequences.

## Syntax

```text
{​% adr id="001" title="Use PostgreSQL" status="accepted" date="2024-01-15" %}

## Context

Description of the situation and problem.

## Decision

What was decided.

## Consequences

Impact of the decision.

{​% /adr %}
```

## Status Variants

### Proposed

Decisions under consideration.

{% adr id="005" title="Implement GraphQL API" status="proposed" date="2024-12-01" deciders="Engineering Team" %}

## Context

Our REST API has grown complex with many endpoints. Clients often need to make multiple requests to gather related data, leading to over-fetching and under-fetching issues.

## Decision

We are considering implementing a GraphQL API layer to provide flexible data fetching for frontend clients.

## Consequences

- **Positive**: Clients can request exactly what they need
- **Positive**: Reduces number of round trips
- **Negative**: Additional complexity in backend
- **Negative**: Team needs GraphQL training

{% /adr %}

### Accepted

Decisions that have been approved and implemented.

{% adr id="001" title="Use PostgreSQL for Primary Database" status="accepted" date="2024-01-15" deciders="Architecture Board" %}

## Context

We need a primary database for our application. Requirements include ACID compliance, strong consistency, and support for complex queries.

## Decision

We will use PostgreSQL as our primary database.

## Consequences

- **Positive**: Mature, well-supported database
- **Positive**: Excellent query performance
- **Positive**: Strong ecosystem of tools
- **Negative**: Requires operational expertise
- **Negative**: Vertical scaling has limits

{% /adr %}

### Deprecated

Decisions that are being phased out.

{% adr id="002" title="Use MongoDB for Session Storage" status="deprecated" date="2024-02-01" supersededBy="004" %}

## Context

We initially chose MongoDB for session storage due to its flexible schema.

## Decision

MongoDB was selected for session storage.

## Consequences

This decision has been superseded. We found that Redis provides better performance for session data and is now our recommended approach. See ADR-004.

{% /adr %}

### Superseded

Decisions replaced by newer decisions.

{% adr id="003" title="Use REST API" status="superseded" date="2023-06-01" supersededBy="005" %}

## Context

We needed an API architecture for client-server communication.

## Decision

We implemented a REST API following standard conventions.

## Consequences

This approach served us well initially but has been superseded by ADR-005 (GraphQL) for new development. Existing REST endpoints remain for backward compatibility.

{% /adr %}

### Rejected

Decisions that were considered but not adopted.

{% adr id="006" title="Use Microservices Architecture" status="rejected" date="2024-03-01" deciders="CTO, Engineering Leads" %}

## Context

As our application grows, we evaluated whether to migrate from our monolithic architecture to microservices.

## Decision

We decided NOT to adopt microservices at this time.

## Rationale for Rejection

- Current team size (8 engineers) is too small for microservices overhead
- Monolith is performing well with current load
- Operational complexity would outweigh benefits
- Will re-evaluate when team exceeds 25 engineers or specific scaling needs arise

{% /adr %}

## Required Attributes

| Attribute | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `id`      | `string` | Unique identifier (e.g., "001", "042")                       |
| `title`   | `string` | Short description of the decision                            |
| `status`  | `string` | One of: proposed, accepted, deprecated, superseded, rejected |
| `date`    | `string` | Date of the decision                                         |

## Optional Attributes

| Attribute      | Type     | Description                          |
| -------------- | -------- | ------------------------------------ |
| `deciders`     | `string` | People who made the decision         |
| `supersedes`   | `string` | ADR ID that this decision supersedes |
| `supersededBy` | `string` | ADR ID that supersedes this decision |

## Best Practices

{% callout type="tip" %}
Keep ADRs focused on a single decision. If multiple related decisions need to be made, create separate ADRs and link them.
{% /callout %}

### Standard Sections

A good ADR typically includes:

1. **Context** - What situation led to this decision?
2. **Decision** - What was decided?
3. **Consequences** - What are the positive and negative outcomes?

### Immutability

Once accepted, ADRs should not be modified. If a decision changes:

1. Create a new ADR with the updated decision
2. Mark the old ADR as "superseded"
3. Link the ADRs with `supersedes` / `supersededBy`

This preserves the history of how architectural decisions evolved.
