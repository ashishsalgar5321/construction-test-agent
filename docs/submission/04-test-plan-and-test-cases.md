# Test Plan and Test Cases

## 1) Test Strategy

Testing combines:

- manual end-to-end validation for user flows and UX,
- deterministic checks for generated structure quality,
- build-time verification for release readiness.

## 2) Test Scope

### Functional Areas

- Authentication (sign-up, sign-in, forgot-password, protected routes)
- Requirement generation pipeline (all 6 stages)
- Dashboard tabs and sorting/filtering behavior
- History and reports persistence actions
- Export behavior and content integrity

### Non-Functional Areas

- Error messaging clarity
- UI consistency and readability in dark theme
- Deployment configuration validity

## 3) Environments

- **Local:** Node.js + `.env.local`
- **Production:** Vercel deployment with managed env vars
- **Auth Provider:** Clerk
- **AI Provider:** Groq

## 4) Core Test Matrix

## Happy Path Cases

1. **HP-01: End-to-end generation**
   - Input: valid construction requirement
   - Expected: all stages complete; all dashboard tabs populated.

2. **HP-02: Authenticated dashboard access**
   - Input: valid sign-in
   - Expected: dashboard loads with user context; protected access works.

3. **HP-03: Save and reopen run**
   - Input: generated run saved to history
   - Expected: run appears in history and reopens correctly.

4. **HP-04: Reports open/delete flow**
   - Input: generated report
   - Expected: report opens with expected fields and can be deleted.

## Negative and Validation Cases

1. **NEG-01: Empty requirement**
   - Expected: validation prevents generation and surfaces clear message.

2. **NEG-02: Invalid auth input**
   - Expected: human-readable field validation message shown.

3. **NEG-03: Wrong password during sign-in**
   - Expected: specific error shown; no successful session.

4. **NEG-04: Invalid reset code**
   - Expected: reset blocked with actionable message.

## Edge Cases

1. **EDGE-01: Long requirement text**
   - Expected: system remains responsive; generation still completes/fails gracefully.

2. **EDGE-02: Partial AI stage failure**
   - Expected: error surfaced without UI crash; user can retry.

3. **EDGE-03: Repeated navigation auth screens**
   - Expected: no broken state; expected screen transitions persist.

## 5) Authentication-Specific Coverage

- Sign-up path includes verification gating before password setup.
- Forgot-password path validates email, reset code, and new password rules.
- Password rule panel behavior validated for visibility, highlighting, and summary messaging.

## 6) Evidence in Repository

- `tests/tool-validation.md` - scenario definitions and validation checklist.
- `tests/validation-results.md` - outcome tracking for test evidence.
- `samples/*.json` - representative generated artifacts for judge review.

## 7) Automated / Scripted Verification

Run before release:

```bash
npm run build
npm run lint
npm run test:validate
```

## 8) Exit Criteria

Release candidate is accepted when:

- build and lint pass,
- validation evidence is present and current,
- auth + generation + history/reports flows are manually confirmed,
- deployment environment variables are correctly configured.
