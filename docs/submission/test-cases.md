# Test Cases - ConstructQA Agent

## Test Coverage Summary

This suite covers functional flows, UI/UX, API behavior, authentication/validation, edge behavior, negative testing, and non-functional checks.

Status values:
- `Pass` - verified and expected behavior observed
- `Pending` - requires re-run or environment-specific validation
- `Blocked` - cannot validate due to dependency/environment constraint

## Complete Project Test Cases

| Test Case ID | Category | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| TC-FUNC-001 | Functional | Generate outputs from valid requirement | Sign in -> open dashboard -> enter requirement -> click Generate | All 6 pipeline stages complete and tabs populated | Pass |
| TC-FUNC-002 | Functional | Quick-select workflow generation | Choose quick-select requirement -> Generate | Generated artifacts align with selected workflow intent | Pass |
| TC-FUNC-003 | Functional | History run open/delete | Open History -> open saved run -> delete run | Run loads correctly; delete removes item from list | Pass |
| TC-FUNC-004 | Functional | Reports open/delete | Open Reports -> open report -> delete report | Report content displayed; delete succeeds | Pass |
| TC-FUNC-005 | Functional | Export artifact integrity | Generate output -> export markdown/json/csv where available | Downloaded content matches visible data | Pending |
| TC-UI-001 | UI/UX | Dashboard alignment consistency | Compare Dashboard, History, Reports page layouts | Consistent spacing, container behavior, readable hierarchy | Pass |
| TC-UI-002 | UI/UX | Tab visibility/wrapping | On dashboard, switch between tabs on narrow width | Tabs remain visible and wrap correctly (no hidden actions) | Pass |
| TC-UI-003 | UI/UX | Themed scrollbar visibility | Navigate long lists in dark theme | Scrollbar is visible, theme-consistent, usable | Pass |
| TC-UI-004 | UI/UX | Password rules placement in sign-up | Open sign-up password stage | Rules appear below password field, no overlap | Pass |
| TC-UI-005 | UI/UX | Password rules highlight behavior | Type invalid/valid password progressively | Failing rules red, passing rules green, summary shown when all pass | Pass |
| TC-API-001 | API | `/api/generate` success response | POST valid requirement payload | Returns staged generation output without server error | Pass |
| TC-API-002 | API | `/api/runs` list retrieval | Authenticate -> request runs | Returns run list for signed-in context | Pass |
| TC-API-003 | API | `/api/reports` list retrieval | Authenticate -> request reports | Returns report list for signed-in context | Pass |
| TC-API-004 | API | API unauthorized access protection | Call protected API without auth | Access denied/redirect behavior enforced | Pass |
| TC-AUTH-001 | Auth/Validation | Sign-up flow gating | Enter email -> verify code -> set password | Password step appears only after verification stage | Pass |
| TC-AUTH-002 | Auth/Validation | Sign-up success acknowledgment | Complete sign-up | Success message shown then redirect to dashboard | Pass |
| TC-AUTH-003 | Auth/Validation | Sign-in wrong password message | Enter wrong password and submit | Clear invalid-password error message shown | Pass |
| TC-AUTH-004 | Auth/Validation | Forgot-password reset flow | Open forgot-password -> submit email -> verify code -> set password | Reset sequence completes and user can sign in | Pass |
| TC-AUTH-005 | Auth/Validation | Password visibility toggle | On reset/sign-up password fields click Show/Hide | Password visibility toggles without field corruption | Pass |
| TC-EDGE-001 | Edge Case | Large requirement input | Submit long requirement text | No UI crash; either completes or fails gracefully with message | Pending |
| TC-EDGE-002 | Edge Case | Repeat navigation between auth steps | Back/forward across auth flow states | UI remains stable and predictable | Pending |
| TC-NEG-001 | Negative | Empty requirement submission | Click Generate with empty requirement | Validation blocks action with readable message | Pass |
| TC-NEG-002 | Negative | Invalid reset code | Enter wrong OTP in forgot-password flow | Reset blocked and informative error shown | Pass |
| TC-NEG-003 | Negative | Missing mandatory auth field | Submit auth form without required values | Field-level validation message displayed | Pass |
| TC-PERF-001 | Performance | Build pipeline readiness | Run `npm run build` | Build succeeds with no errors | Pass |
| TC-PERF-002 | Performance | Lint baseline quality | Run `npm run lint` | No lint errors blocking release | Pass |
| TC-PERF-003 | Performance | Validation script check | Run `npm run test:validate` | Validation script passes sample output checks | Pass |
| TC-SEC-001 | Security | Secret handling in repo | Inspect tracked config files | No private keys committed; `.env.example` only | Pass |
| TC-SEC-002 | Security | Protected route enforcement | Access `/dashboard` without active session | Redirect/login enforcement occurs | Pass |
| TC-SEC-003 | Security | Server-only secret usage | Review env usage for secret keys | Secret keys used server-side only | Pass |

## Functional Test Cases

- Requirement-to-artifact generation
- History/report lifecycle operations
- Output export and tab rendering

## UI/UX Test Cases

- Layout consistency across modules
- Password rules visibility and dynamic feedback
- Theme readability and control accessibility

## API Test Cases

- Generate route behavior
- Runs/reports CRUD surface checks
- Unauthorized access behavior

## Authentication and Validation Test Cases

- Sign-up gating and acknowledgment
- Sign-in validation messaging
- Forgot-password sequence with OTP and password policy

## Edge Cases

- Long input payload behavior
- Navigation churn across auth flows

## Negative Test Cases

- Empty field submissions
- Invalid OTP/password combinations

## Performance and Security Test Cases

- Build/lint/validate execution
- Route protection and secret management checks

## Notes

- Detailed manual evidence is also available in:
  - `tests/tool-validation.md`
  - `tests/validation-results.md`
