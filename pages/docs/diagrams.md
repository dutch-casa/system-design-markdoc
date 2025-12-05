---
title: Diagrams (Mermaid)
description: Create diagrams with Mermaid syntax
---

# Diagrams (Mermaid)

Create diagrams using [Mermaid](https://mermaid.js.org/) syntax. Diagrams support pan and zoom interaction.

## Syntax

```text
{​% mermaid %}
graph TD
A[Start] --> B[End]
{​% /mermaid %}
```

## Flowcharts

### Basic Flowchart

{% mermaid %}
graph TD
A[Start] --> B{Is it working?}
B -->|Yes| C[Great!]
B -->|No| D[Debug]
D --> B
C --> E[End]
{% /mermaid %}

```text
{​% mermaid %}
graph TD
A[Start] --> B{Is it working?}
B -->|Yes| C[Great!]
B -->|No| D[Debug]
D --> B
C --> E[End]
{​% /mermaid %}
```

### Left to Right

{% mermaid %}
graph LR
A[Input] --> B[Process]
B --> C[Output]
{% /mermaid %}

```text
{​% mermaid %}
graph LR
A[Input] --> B[Process]
B --> C[Output]
{​% /mermaid %}
```

## Sequence Diagrams

{% mermaid %}
sequenceDiagram
participant Client
participant Server
participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: HTTP Response

{% /mermaid %}

```text
{​% mermaid %}
sequenceDiagram
participant Client
participant Server
participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: HTTP Response

{​% /mermaid %}
```

## Class Diagrams

{% mermaid %}
classDiagram
class User {
+String id
+String name
+String email
+create()
+update()
+delete()
}
class Order {
+String id
+Date createdAt
+Number total
+process()
}
User "1" --> "\*" Order : places
{% /mermaid %}

```text
{​% mermaid %}
classDiagram
class User {
+String id
+String name
+String email
+create()
+update()
+delete()
}
class Order {
+String id
+Date createdAt
+Number total
+process()
}
User "1" --> "*" Order : places
{​% /mermaid %}
```

## Entity Relationship Diagrams

{% mermaid %}
erDiagram
USER ||--o{ ORDER : places
ORDER ||--|{ LINE_ITEM : contains
PRODUCT ||--o{ LINE_ITEM : "ordered in"

    USER {
        string id PK
        string name
        string email UK
    }
    ORDER {
        string id PK
        date created_at
        string user_id FK
    }

{% /mermaid %}

```text
{​% mermaid %}
erDiagram
USER ||--o{ ORDER : places
ORDER ||--|{ LINE_ITEM : contains
PRODUCT ||--o{ LINE_ITEM : "ordered in"

    USER {
        string id PK
        string name
        string email UK
    }
    ORDER {
        string id PK
        date created_at
        string user_id FK
    }

{​% /mermaid %}
```

## State Diagrams

{% mermaid %}
stateDiagram-v2
[*] --> Draft
Draft --> Review : Submit
Review --> Draft : Request Changes
Review --> Approved : Approve
Approved --> Published : Publish
Published --> [*]
{% /mermaid %}

```text
{​% mermaid %}
stateDiagram-v2
[*] --> Draft
Draft --> Review : Submit
Review --> Draft : Request Changes
Review --> Approved : Approve
Approved --> Published : Publish
Published --> [*]
{​% /mermaid %}
```

## Gantt Charts

{% mermaid %}
gantt
title Project Timeline
dateFormat YYYY-MM-DD

    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 14d

    section Development
    Backend         :b1, after a2, 21d
    Frontend        :b2, after a2, 21d

    section Launch
    Testing         :c1, after b1, 7d
    Deployment      :c2, after c1, 3d

{% /mermaid %}

```text
{​% mermaid %}
gantt
title Project Timeline
dateFormat YYYY-MM-DD

    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 14d

    section Development
    Backend         :b1, after a2, 21d
    Frontend        :b2, after a2, 21d

{​% /mermaid %}
```

## Pie Charts

{% mermaid %}
pie title Traffic Sources
"Organic Search" : 45
"Direct" : 25
"Social Media" : 20
"Referral" : 10
{% /mermaid %}

```text
{​% mermaid %}
pie title Traffic Sources
"Organic Search" : 45
"Direct" : 25
"Social Media" : 20
"Referral" : 10
{​% /mermaid %}
```

## Interaction

{% callout type="tip" %}
Diagrams support pan and zoom. Click and drag to pan, use the controls or scroll wheel to zoom.
{% /callout %}

## Available Diagram Types

| Type                  | Description                        |
| --------------------- | ---------------------------------- |
| `graph` / `flowchart` | Flowcharts with various directions |
| `sequenceDiagram`     | Interaction sequences              |
| `classDiagram`        | Class structures and relationships |
| `erDiagram`           | Entity-relationship models         |
| `stateDiagram-v2`     | State machines                     |
| `gantt`               | Project timelines                  |
| `pie`                 | Pie charts                         |

For complete syntax, see the [Mermaid documentation](https://mermaid.js.org/intro/).
