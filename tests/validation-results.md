# ConstructQA Agent — Validation Results

Manual and script validation against [tool-validation.md](./tool-validation.md).

| ID | Test | Result | Notes |
|----|------|--------|-------|
| TV-001 | All 6 pipeline stages return data | PASS | parsed, scenarios, testCases, testData, skeleton, coverage |
| TV-002 | Test case required fields | PASS | Validated via `npm run test:validate` on sample outputs |
| TV-003 | Negative scenarios generated | PASS | Sample outputs include scenarios.negative |
| TV-004 | Role-based covers 4 roles | PASS | role-based-access-output.json includes 4 roles |
| TV-005 | Playwright skeleton keywords | PASS | skeleton.code contains test(, expect(, page. |
| TV-006 | Coverage score 0–100 | PASS | Integer scores in sample outputs |
| TV-007 | Export MD downloads | PASS | Manual — Export Report button in dashboard |
| TV-008 | Unauthenticated /dashboard redirect | PASS | Redirects to /sign-in via middleware + page guard |
| TV-009 | Empty requirement validation | PASS | Client-side error, no API call |
| TV-010 | OpenProject reference in output | PASS | openproject_reference on each test case |

## Automated validation

```bash
npm run test:validate
```

Validates sample JSON in `samples/` against pipeline structure rules.

## Sample generated outputs

- [samples/work-package-output.json](../samples/work-package-output.json)
- [samples/role-based-access-output.json](../samples/role-based-access-output.json)
- [samples/dashboard-validation-output.json](../samples/dashboard-validation-output.json)

Last verified: 2026-05-24
