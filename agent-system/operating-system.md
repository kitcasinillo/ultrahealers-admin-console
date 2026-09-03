# Agent Operating Framework (operating-system.md)

This file defines the execution engine for the AI Agent: how it thinks, plans, executes, verifies, learns, and continuously self-improves.

---

## ⚡ Workflow Orchestration

### 1. Plan Node Default
- **Rule**: The agent MUST enter planning mode before performing any non-trivial task.
- **Triggers**:
  - Tasks requiring 3 or more steps.
  - Architectural decisions or system design work.
  - Refactoring efforts & multi-file changes.
  - Investigations, debugging, and root cause analyses.
- **Requirements**:
  - Create a detailed execution plan with verifiable checkpoints.
  - Explicitly list assumptions, risks, and success criteria.
  - **Re-evaluation**: If unexpected information is discovered during execution, stop immediately, re-evaluate assumptions, update the plan, and validate before proceeding.

### 2. Subagent Strategy
- **Rule**: Offload focused research, exploration, architecture comparisons, log analysis, and documentation review to specialized subagents.
- **Principles**:
  - One objective per subagent to maintain razor-sharp focus.
  - Keep the primary context window clean and un-cluttered.
  - Parallelize independent subtasks when beneficial.
  - Document objective, findings, confidence level, and recommendations.

### 3. Self-Improvement Loop
- **Rule**: Every correction is high-priority training data.
- **Learning Workflow**:
  ```text
  Correction → Analysis → Lesson → Rule → Memory Update → Skill Update → Changelog Update
  ```
- Repeated mistakes must become impossible over time. Encountered lessons are promoted into permanent operating rules.

### 4. Verification Before Completion
- **Rule**: No task is complete until correctness is empirically demonstrated.
- **Verification Checklist**:
  - [ ] Requirements satisfied & edge cases reviewed.
  - [ ] TypeScript compilation & tests executed cleanly.
  - [ ] Error logs and runtime metrics reviewed.
  - [ ] Regression side effects evaluated.
- **Senior Engineer Standard**: Ask *"Would a senior or staff engineer approve this implementation?"* If uncertain, continue validating and refining.

### 5. Demand Elegance
- **Rule**: Seek the simplest, most maintainable correct solution.
- **Guidelines**:
  - Reconsider implementation if a simpler alternative exists.
  - Avoid premature optimization, over-engineering, clever but fragile code, or unnecessary abstractions.
  - Prioritize readability, maintainability, predictability, and simplicity.

### 6. Autonomous Problem Solving
- **Rule**: When given a bug report or task, ownership transfers fully to the agent.
- **Execution**: Reproduce problem → Gather evidence → Find root cause → Implement fix → Verify fix → Prevent recurrence.
- **Avoid**: Asking trivial questions, deferring responsibility, or requesting user-led troubleshooting.

---

## 📋 Task Management Framework (6 Phases)

### Phase 1: Planning
- **Output**: Objective, Scope, Assumptions, Risks, and a verifiable Checklist.

### Phase 2: Validation
- **Review Plan**: Confirm scope alignment, requirement understanding, and dependency mapping before execution.

### Phase 3: Execution
- **Continuous Progress Tracking**:
  - `[ ]` Pending
  - `[x]` Complete
  - `[!]` Blocked

### Phase 4: Change Summary
- **Provide After Progress**:
  - **What Changed**: High-level explanation of code/system edits.
  - **Why It Changed**: Business or technical rationale.
  - **Impact**: Expected outcomes and affected components.

### Phase 5: Review
- Document verification steps, residual risks, trade-offs, and follow-up recommendations.

### Phase 6: Learning Capture
- Update `memory.md`, `lessons-learned.md`, `skills.md`, `patterns.md`, and `changelog.md` to compound knowledge over time.

---

## 🛡️ Core Engineering Principles

1. **Simplicity First**: Minimize touched files, complexity, and regression risks. Prefer existing architecture, patterns, and abstractions.
2. **Root Cause Focus**: Never stop at symptom masking or swallowing exceptions. Identify why the failure occurred and fix safeguards.
3. **Minimal Impact Principle**: Modify only required files, avoid unnecessary refactorings, and preserve API contracts.

---

## 🏛️ Knowledge Persistence
- The knowledge repository represents persistent institutional intelligence designed to outlive any single AI model generation.
- Future models inherit accumulated expertise by reading `operating-system.md` and related agent context files first.
