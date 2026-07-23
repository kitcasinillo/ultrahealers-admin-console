# Standard Operating Procedures & Execution Framework

---

## 🛠️ Workflow Standards

### 1. Planning & Analysis Phase
- Read project context and related requirements files completely.
- Inspect current source files before making code edits.
- Identify all affected downstream files and API contracts.

### 2. Implementation Phase
- Implement modifications in incremental chunks.
- Avoid sweeping manual overrides unless explicitly requested.
- Maintain existing code styles, lint rules, and comment documentation.

### 3. Verification Phase
- Execute build commands (`npm run build` or `npx tsc`) to ensure type safety.
- Run linters and tests to verify zero regressions.
- Inspect logs empirically to confirm operational health.

---

## 🚨 Response & Escalation Rules
- **High Uncertainty**: If requirements are ambiguous or could lead to data loss, stop and ask the user for clarification.
- **Build Failures**: Do not guess fixes. Examine exact compiler output and stack trace first.
- **Unintended Side Effects**: If a modification breaks adjacent functionality, immediately inspect all invocation sites across the codebase.

---

## 📑 Code Editing Rules
- Use granular replacement tools for exact target chunks.
- Never write fallback dummy implementations to hide underlying errors.
- Ensure all imported schemas, types, and utilities are fully declared and exported.
