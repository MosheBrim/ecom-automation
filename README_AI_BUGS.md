# AI Bugs and Corrections

This document tracks mistakes made by AI tools during development and how they were corrected.

---

## Bug Tracking Format

Each bug entry follows this structure:

```
### Bug #[number]: [Short Title]

**AI Tool:** [Tool name and version]
**Date:** [Date discovered]
**Severity:** [Low/Medium/High/Critical]

**What AI Suggested:**
[Code or suggestion that was problematic]

**Why It Was Wrong:**
[Explanation of the issue]

**Correct Solution:**
[The proper implementation]

**Lesson Learned:**
[What to watch out for in the future]
```

---

## Documented Bugs

### Bug #1: Screenshots Incorrectly Added to .gitignore

**AI Tool:** Claude Code (Claude Opus 4.5)
**Date:** 2024-02-11
**Severity:** High

**What AI Suggested:**
```gitignore
# Keep screenshots folder but not contents (except .gitkeep)
screenshots/*
!screenshots/.gitkeep
```

**Why It Was Wrong:**
- Screenshots are REQUIRED as proof for submission
- The assignment explicitly states screenshots must be included
- Ignoring them would cause missing deliverables

**Correct Solution:**
```gitignore
# Screenshots folder - KEEP screenshots (required as proof for submission)
# Only ignore temporary/debug screenshots
screenshots/debug/
```

**Lesson Learned:**
Always verify submission requirements before adding files to .gitignore. Proof artifacts must be committed.

---

## Categories of Common AI Mistakes

### 1. Automation Mistakes
- Using `waitForTimeout()` instead of explicit waits
- Hardcoding selectors instead of using constants
- Not handling dynamic content properly
- Missing error handling in async operations

### 2. Security Mistakes
- Suggesting hardcoded credentials
- Not using environment variables
- Exposing sensitive data in logs
- Missing input validation

### 3. Architecture Mistakes
- Mixing concerns between layers
- Direct database/API calls in components
- Not following established patterns
- Creating unnecessary abstractions

### 4. TypeScript Mistakes
- Using `any` type
- Missing return types
- Incorrect generic usage
- Not leveraging discriminated unions

---

## Statistics

| Category | Count | Fixed |
|----------|-------|-------|
| Automation | 0 | 0 |
| Security | 1 | 1 |
| Architecture | 0 | 0 |
| TypeScript | 0 | 0 |
| **Total** | **1** | **1** |

---

## How to Add New Bugs

When you encounter an AI mistake:

1. Copy the template above
2. Fill in all fields honestly
3. Include actual code examples
4. Explain why it's wrong
5. Show the correct solution
6. Update the statistics table

---

## Summary

[To be filled at project completion]

- Total bugs found: X
- Most common category: X
- Key takeaways: X
