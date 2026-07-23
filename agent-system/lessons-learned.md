# Lessons Learned & Anti-Patterns

This file logs failures, root cause analyses, mistakes, and preventative actions to avoid repeating past errors.

---

## 🛑 Active Lessons & Preventative Actions

### LESSON-001: Always Verify Directory Contents Before File Search
- **Date Recorded**: 2026-07-23
- **Category**: Tooling & File Discovery
- **Severity**: Low
- **Root Cause**: `grep_search` with specific filename glob failed to locate `agent-persona-creation.md` due to case matching / path globbing behavior.
- **Resolution**: Use `list_dir` or broader search parameters to inspect root workspace contents directly.
- **Preventative Action**: Always combine directory listing with search queries when validating target file existence.

---

## 📥 Template for New Lessons

```markdown
### LESSON-XXX: [Title of Failure / Issue]
- **Date Recorded**: YYYY-MM-DD
- **Category**: [Tooling | TypeScript | Security | Performance | Architecture]
- **Severity**: [Critical | Major | Minor]
- **Root Cause**: Explanation of why the issue occurred.
- **Resolution**: How the issue was resolved.
- **Preventative Action**: Concrete rules to prevent repetition.
```
