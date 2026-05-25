# ConstructQA Agent — Tool Validation Test Cases

## TV-001: Valid requirement produces all 6 pipeline stages
- Input: REQ-01 (work package creation)
- Expected: All 6 stages return non-empty JSON
- Pass criteria: parsed, scenarios, testCases, testData, skeleton, coverage all present

## TV-002: Test cases contain all required fields
- Input: Any valid requirement
- Expected: Each test case has id, title, type, priority, role, steps, expectedResult, traceability
- Pass criteria: No field is null or empty string

## TV-003: Negative test cases are generated
- Input: Any valid requirement
- Expected: scenarios.negative[] has at least 2 items
- Pass criteria: Array length >= 2

## TV-004: Role-based test cases cover all 4 roles
- Input: REQ-03 (role-based access)
- Expected: Test cases cover Site Engineer, Contractor, Project Manager, Viewer
- Pass criteria: 4 distinct roles appear across test cases

## TV-005: Automation skeleton contains valid Playwright code
- Input: Any valid requirement
- Expected: skeleton.code contains 'test(', 'expect(', 'page.'
- Pass criteria: All 3 keywords present in skeleton.code string

## TV-006: Coverage score is a number between 0 and 100
- Input: Any valid requirement
- Expected: coverage.coverageScore is integer 0-100
- Pass criteria: typeof coverageScore === 'number' && value between 0-100

## TV-007: Export produces downloadable Markdown file
- Input: Generated test suite
- Action: Click Export MD button
- Expected: Browser downloads test-suite.md file
- Pass criteria: File downloads, contains test case IDs

## TV-008: Unauthenticated user cannot access dashboard
- Input: Visit /dashboard without login
- Expected: Redirected to /sign-in
- Pass criteria: URL changes to /sign-in page

## TV-009: Empty requirement shows validation
- Input: Click Generate with empty text area
- Expected: Generation does not start or returns error
- Pass criteria: No API call made or error message shown

## TV-010: OpenProject reference appears in output
- Input: Any valid requirement
- Expected: openproject_reference field present in each test case
- Pass criteria: Field is non-empty string referencing OpenProject module
