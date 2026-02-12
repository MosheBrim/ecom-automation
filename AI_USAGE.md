# AI Usage Documentation

## Overview

This document provides full transparency about AI tool usage during the development of this project, including prompts, corrections, and security measures.

---

## AI Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| Claude Code (VS Code Extension) | Latest | Primary development assistant |
| Model | Claude Opus 4.5 | Code generation, architecture design |

---

## Development Sessions

### Session 1: Project Setup & Architecture

**Date:** 2026-02-11

**Prompt 1: Understanding the Assignment**
```
I have the following assignment. Please read it and verify that I have
correctly understood and described all the requirements.
```

**AI Response Summary:**
- Verified assignment requirements
- Identified missing files (README_AI_BUGS.md, .env.example)
- Suggested improvements to CLAUDE.md

**Prompt 2: Technology Stack Recommendation**
```
Based on the assignment requirements, what technology stack would you
recommend? What would be the best choice for this project?
```

**AI Response Summary:**
- Recommended React + Express over Next.js for clear layer separation
- Suggested TanStack Query for server state management
- Proposed Winston for structured logging

**What I Learned:**
- Importance of matching technology to project requirements
- Clean architecture benefits for grading visibility

---

### Session 2: Code Review & Architecture Validation

**Date:** 2026-02-11

**Prompt 3: Project Code Review**
```
I built this project in a separate chat. Please review the code and identify
any missing components, architectural issues, or improvements needed.
```

**AI Response Summary:**
- Identified missing UI components (CheckoutForm, ResultDisplay)
- Verified architecture follows 6-layer pattern
- Found tests were missing (critical for 10% of grade)
- Confirmed design patterns are correctly implemented

**Prompt 4: Single Page vs Multiple Pages**
```
The assignment mentions 4 pages but I have a single-page app. Is this okay?
What approach would you recommend?
```

**AI Response Summary:**
- Confirmed single-page app is valid for automation dashboard
- Recommended keeping one page with sections/states
- Explained this is better for real-time status tracking

**What I Learned:**
- Importance of code review before submission
- Single responsibility principle in UI components

---

### Session 3: Adding Missing Components & Tests

**Date:** 2026-02-11

**Prompt 5: Complete Missing Parts**
```
Add all the missing parts you mentioned - checkout form, result display
component, and tests. Implement them in the best possible way.
```

**AI Response Summary:**
- Created CheckoutForm.tsx with shipping address form
- Created ResultDisplay.tsx with screenshot proof display
- Updated HomePage.tsx with state machine (search → checkout → result)
- Set up Vitest testing framework
- Created 49 unit tests for utils and domain logic
- Created 9 E2E tests with Playwright

**Files Created:**
- `frontend/src/components/features/CheckoutForm.tsx`
- `frontend/src/components/features/ResultDisplay.tsx`
- `backend/vitest.config.ts`
- `backend/src/utils/formatPrice.test.ts` (15 tests)
- `backend/src/utils/withTimeout.test.ts` (6 tests)
- `backend/src/domain/errors/AppError.test.ts` (11 tests)
- `backend/src/domain/strategies/ProductSelectionStrategy.test.ts` (17 tests)
- `backend/src/automation/e2e.test.ts` (9 tests)

---

## AI Mistakes and How I Fixed Them

### Mistake #1: Screenshots Added to .gitignore

**What AI Suggested:**
```gitignore
# In .gitignore
screenshots/*
```

**Why It Was Wrong:**
- Screenshots are required proof of checkout completion
- Assignment requires submitting screenshots with the project
- Only debug screenshots should be ignored

**How I Fixed It:**
```gitignore
# Only ignore debug screenshots
screenshots/debug/
```

---

### Mistake #2: CLAUDE.md Too Verbose

**What AI Suggested:**
- Created a ~600 line CLAUDE.md with full code examples
- Included complete implementation patterns

**Why It Was Wrong:**
- CLAUDE.md is loaded into context every session
- Too much content wastes context window
- Full code examples not needed - just rules

**How I Fixed It:**
- Reduced to ~117 lines with rules only
- Removed full code implementations
- Kept only patterns and conventions

---

### Mistake #3: Test Assertions Using instanceof

**What AI Suggested:**
```ts
await expect(withTimeout(slowOp, 50, 'step'))
  .rejects.toThrow(TimeoutError);
```

**Why It Was Wrong:**
- ESM/CJS module boundary issues cause instanceof to fail
- Different module instances have different class references

**How I Fixed It:**
```ts
await expect(withTimeout(slowOp, 50, 'step'))
  .rejects.toThrow(/timed out/i);
// Or check properties instead of instanceof
expect((error as { code: string }).code).toBe('TIMEOUT_ERROR');
```

---

## Security Measures - Preventing Secret Leakage

### 1. Environment Variables

All sensitive data stored in `.env` file:
```bash
# .env (NOT committed to git)
SITE_EMAIL=test@example.com
SITE_PASSWORD=secretpassword
SITE_URL=https://practicesoftwaretesting.com
```

### 2. Git Configuration

`.gitignore` includes:
```
.env
.env.local
.env.*.local
```

### 3. Documentation Without Secrets

Created `.env.example` with placeholder values:
```bash
SITE_EMAIL=your-test-email@example.com
SITE_PASSWORD=your-test-password
```

### 4. Code Review Process

Before every commit, I verified:
- [ ] No hardcoded credentials in code
- [ ] No API keys in source files
- [ ] No passwords in logs
- [ ] `.env` not staged for commit

### 5. AI Prompt Safety

When asking AI for help:
- Never included real credentials in prompts
- Used placeholder values like `your-password-here`
- Reviewed AI suggestions for hardcoded secrets

---

## Prompting Strategy

### What Worked Well

1. **Specific Context**: Providing the full assignment requirements helped AI understand goals
2. **Iterative Refinement**: Asking follow-up questions improved suggestions
3. **Hebrew Communication**: Writing in Hebrew felt natural and got accurate responses
4. **Code Examples**: Showing existing code patterns helped maintain consistency

### What Didn't Work

1. **Vague Requests**: General questions like "make it better" got generic answers
2. **Missing Context**: Not mentioning project conventions led to inconsistent suggestions
3. **[More to be added during development]**

---

## Statistics

| Metric | Count |
|--------|-------|
| Total AI prompts used | 5+ |
| Prompts that needed correction | 2 |
| Security-related fixes | 1 |
| Architecture improvements | 3 |
| Tests generated | 58 |
| Components generated | 2 |

---

## Lessons Learned

### Technical Lessons

1. **Explicit waits over sleep**: Never use `waitForTimeout` - always wait for specific elements
2. **Strategy pattern for flexibility**: Selection strategies make the code extensible and testable
3. **Screenshot path handling**: Screenshots need careful path resolution across different environments

### Process Lessons

1. **Always review AI output**: Never copy-paste without understanding
2. **Maintain project conventions**: Keep CLAUDE.md updated so AI follows patterns
3. **Document mistakes immediately**: Easier to remember context when fresh

---

## Conclusion

- Overall AI assistance quality: 8/10
- Time saved: Approximately 4-6 hours
- Key takeaway: AI excels at boilerplate and testing code, but requires human oversight for architecture decisions and security

---

## Appendix: Full Prompt Log

For complete transparency, here is a log of significant prompts used:

| # | Date | Prompt Summary | Outcome |
|---|------|----------------|---------|
| 1 | 2026-02-11 | Project setup verification | Successful |
| 2 | 2026-02-11 | Tech stack recommendation | Successful |
| 3 | 2026-02-11 | Code review & missing components | Successful |
| 4 | 2026-02-11 | UI architecture decision | Successful |
| 5 | 2026-02-11 | Add missing components & tests | Successful |
