# Agent Knowledge System (Agent OS)

This directory implements a portable, model-agnostic **Agent Knowledge System** designed to maintain persistent institutional memory, operational standards, skills, and accumulated intelligence across AI models and platforms.

---

## 📁 Recommended Folder Structure

```text
agent-system/
├── README.md               # Knowledge System architecture, conventions, strategies
├── GEMINI.md               # Mandatory cross-model bootstrap entry point
├── agent.md                # Identity, mission, principles, constraints
├── persona.md              # Personality, tone, communication guidelines
├── instructions.md         # Standard operating procedures and execution rules
├── operating-system.md     # Workflow orchestration, 6-phase framework, & core principles
├── project-overview.md     # System purpose, business domain, user roles, core workflows
├── architecture.md         # Frontend/backend stack, state management, auth flow, export engine
├── business-rules.md       # Platform business rules, dispute policy, fee calculation, audit log rules
├── technical-debt.md       # Known code debt, missing bindings, and refactoring backlog
├── memory.md               # Tagged long-term memory & key discoveries
├── lessons-learned.md      # Root cause analyses, mistake preventions, best practices
├── skills.md               # Capability matrix, maturity levels, specialized knowledge
├── patterns.md             # Reusable design & architectural patterns
├── decisions.md            # Architecture Decision Records (ADRs) & strategic choices
├── glossary.md             # Domain terminology, acronyms, & concepts
├── changelog.md            # Knowledge evolution audit log
├── modules/                # Module-by-module detailed documentation
│   ├── user-management.md
│   ├── retreats-and-listings.md
│   ├── bookings-and-disputes.md
│   ├── finance-and-payments.md
│   ├── campaigns-and-marketing.md
│   ├── modalities-and-seo.md
│   ├── reports-and-analytics.md
│   └── settings-and-audit.md
└── archive/                # Historical & deprecated knowledge archive
    └── .gitkeep
```

---

## 📜 Formatting & Style Standards

1. **Standard Markdown**: Use GitHub Flavored Markdown (GFM).
2. **Metadata Headers**: All entries in dynamic files (`memory.md`, `lessons-learned.md`, `decisions.md`, `skills.md`) must include standardized YAML frontmatter or key-value headers.
3. **Immutability & Appends**: Dynamic log files should strictly append new entries chronologically with unique identifiers (e.g., `MEM-001`, `LESSON-001`, `DEC-001`).
4. **Human & Machine Readability**: Keep tables concise, code snippets clean, and avoid monolithic unstructured text blocks.

---

## 🏷️ Metadata Conventions

Every log entry should use standard metadata fields:

```markdown
---
id: MEM-001
date: 2026-07-23
source: User Interaction / Task Execution
importance: High | Medium | Low
tags: [admin-console, authentication, security]
---
```

---

## 🔄 Update & Knowledge Evolution Workflow

When new operational experience occurs:

```mermaid
flowchart LR
    A[New Experience] --> B[Extract Lesson]
    B --> C[Update Memory]
    C --> D[Update Skills / Patterns / Decisions]
    D --> E[Record in Changelog]
```

1. **Extract Lesson**: Identify key takeaways, failure root causes, or optimization patterns.
2. **Update Memory**: Record raw historical context in `memory.md`.
3. **Update Skills / Patterns / Decisions**: Refine capabilities in `skills.md`, reusable templates in `patterns.md`, or choices in `decisions.md`.
4. **Log Changes**: Add a record of what changed to `changelog.md`.

---

## 📌 Strategies

### 1. Versioning Strategy
- Semantic Knowledge Versioning (`vMAJOR.MINOR.PATCH`).
- **MAJOR**: Structural overhaul or fundamental shift in agent identity/operating framework.
- **MINOR**: Addition of new skills, patterns, or major architectural decisions.
- **PATCH**: Routine memory appends, lessons learned, or glossary definitions.

### 2. Archiving Strategy
- Knowledge is never deleted. When a pattern, skill, or decision becomes obsolete:
  - Mark status as `[DEPRECATED]` or `[SUPERSEDED]` in the active file with a link to the replacement entry.
  - Move full historical records to `archive/<category>/` when main files exceed 500 lines or 50KB to preserve context window efficiency.

### 3. Knowledge Inheritance Strategy for Future AI Models
- **Zero-Setup Bootstrapping**: A new model reading `agent.md`, `persona.md`, and `instructions.md` gains immediate operational alignment.
- **Context Injection**: For specialized tasks, load specific sub-modules (`skills.md` for execution, `lessons-learned.md` to avoid past pitfalls, `patterns.md` for code generation).
- **Model Agnosticism**: No platform-specific prompt hacks; all knowledge is encoded in structured natural language and standards.
