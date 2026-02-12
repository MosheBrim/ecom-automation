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
**Date:** 2026-02-11
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

### Bug #2: CLAUDE.md Too Verbose (~600 Lines)

**AI Tool:** Claude Code (Claude Opus 4.5)
**Date:** 2026-02-11
**Severity:** Medium

**What AI Suggested:**
Created a ~600 line CLAUDE.md with full code examples and implementation patterns:
```markdown
## Example: How to implement a service
```typescript
export class ExampleService {
  // Full implementation example...
}
```
```

**Why It Was Wrong:**
- CLAUDE.md is loaded into the AI context window on every session
- Large context files waste tokens and slow down responses
- Full code examples are unnecessary - the AI can infer patterns from rules

**Correct Solution:**
Reduced to ~117 lines with concise rules only:
```markdown
## Code Rules
- Strict mode - no `any`
- Explicit return types on all functions
- Zod for runtime validation
```

**Lesson Learned:**
Keep AI context files minimal. Rules and conventions only - no code examples. The AI performs better with concise instructions.

---

### Bug #3: Test Assertions Using instanceof Across Module Boundaries

**AI Tool:** Claude Code (Claude Opus 4.5)
**Date:** 2026-02-11
**Severity:** Medium

**What AI Suggested:**
```typescript
await expect(withTimeout(slowOp, 50, 'step'))
  .rejects.toThrow(TimeoutError);

expect(error instanceof AppError).toBe(true);
```

**Why It Was Wrong:**
- ESM/CJS module boundary issues cause `instanceof` checks to fail
- When Vitest transforms modules, class references may differ between the test module and the source module
- Tests would pass locally but fail in certain configurations

**Correct Solution:**
```typescript
await expect(withTimeout(slowOp, 50, 'step'))
  .rejects.toThrow(/timed out/i);

expect((error as { code: string }).code).toBe('TIMEOUT_ERROR');
```

**Lesson Learned:**
Avoid `instanceof` in test assertions for custom error classes. Use regex matching on error messages or check specific properties instead.

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
| Architecture | 1 | 1 |
| TypeScript | 1 | 1 |
| **Total** | **3** | **3** |

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

- Total bugs found: 3
- Most common category: Security and Architecture (1 each)
- Key takeaways: AI excels at generating boilerplate and test code, but requires human oversight for configuration decisions (like .gitignore rules), context optimization (CLAUDE.md size), and cross-module compatibility (instanceof across ESM/CJS boundaries). Always review AI suggestions against project-specific requirements before applying them.
