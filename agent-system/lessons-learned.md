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

### LESSON-002: Email Deliverability & Primary Inbox Alignment for SMTP
- **Date Recorded**: 2026-08-10
- **Category**: Email & Deliverability
- **Severity**: Major
- **Root Cause**: Automated welcome emails sent via Gmail SMTP landed in Spam due to sender address mismatch (`fromAddress` fallback vs `EMAIL_USER`), subject line emojis (`🌟`, `✨`), missing `replyTo` header, and spam keywords in HTML templates.
- **Resolution**: Aligned `fromAddress` strictly with `EMAIL_USER`, added `replyTo` header, stripped subject emojis, and cleaned template headers.
- **Preventative Action**: Always enforce strict sender address alignment matching SMTP authentication user, include `replyTo`, and omit subject emojis on transactional emails.

---

### LESSON-003: Do Not Automatically Run npm Build After Tasks
- **Date Recorded**: 2026-08-13
- **Category**: Tooling & Workflow
- **Severity**: Minor
- **Root Cause**: Running `npm run build` at task end wastes time/resources when the dev server is active and the user didn't explicitly request a production build.
- **Resolution**: Respect user directive.
- **Preventative Action**: Do NOT run `npm run build` after completing coding tasks unless explicitly requested by the user.

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
