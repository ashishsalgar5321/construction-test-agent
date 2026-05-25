export const SYSTEM_PROMPT = `Senior QA engineer for OpenProject. Return one valid JSON object only. No markdown. No explanation.`

export const PARSER_PROMPT = (requirement: string) =>
  `Parse requirement into JSON: {"summary":"","workflow":"","entities":[],"roles":[],"actions":[],"conditions":[],"openproject_module":""}
Requirement: "${requirement}"`

export const SCENARIO_PROMPT = (parsedSummary: string, roleHint = '') =>
  `Generate test scenarios for OpenProject construction QA.
Context: ${parsedSummary}
${roleHint}
Return JSON with arrays positive, negative, role_based, status, dashboard, regression.
Each item: {"id":"S-P01","title":"short title","description":"one line"}.
role_based items add "role" field. status items add "status" field.
Minimum: 2 positive, 2 negative, 4 role_based (Site Engineer, Contractor, Project Manager, Viewer), 1 status, 1 dashboard, 1 regression.`

export const TESTCASE_PROMPT = (
  scenarioSummary: string,
  requirement: string,
  roleHint = ''
) =>
  `Generate test cases for OpenProject.
Requirement: "${requirement}"
Scenarios: ${scenarioSummary}
${roleHint}
Rules: minimum 10 test cases including at least 4 type "positive" and 4 type "negative"; role-denial cases use type "negative", allowed-action cases use type "positive"; also include role, status, dashboard, regression where relevant.
openproject_reference must be human-readable like "Work Package Management" NEVER "/api/v3/...".
Return JSON: {"testCases":[{"id":"TC-001","title":"readable title","description":"one line","type":"positive","priority":"high","role":"Site Engineer","openproject_reference":"Work Package Management","traceability":"S-P01","preconditions":["pre 1"],"steps":["step 1","step 2"],"expectedResult":"outcome"}]}`

export const COVERAGE_PROMPT = (testSummary: string, scenarioSummary: string) =>
  `Coverage analysis. Tests: ${testSummary}. Scenarios: ${scenarioSummary}.
Return JSON: {"covered":[{"area":"","count":1,"confidence":"high"}],"missing":[{"area":"","reason":"","risk":"low"}],"risks":[{"title":"","description":"","severity":"medium"}],"assumptions":[""],"recommendations":[""],"coverageScore":80,"summary":""}
coverageScore integer 0-100.`

export const roleRequirementEmphasis = (requirement: string): string => {
  const lower = requirement.toLowerCase()
  const isRoleReq = [
    'role',
    'access',
    'permission',
    'authorized',
    'viewer',
    'engineer',
    'contractor',
    'manager',
  ].some((k) => lower.includes(k))
  if (!isRoleReq) return ''
  return 'ROLE REQUIREMENT: include 4 role_based scenarios and 4 test cases with type "role" for Site Engineer, Contractor, Project Manager, Viewer.'
}

export const summarizeParsed = (parsed: Record<string, unknown>): string =>
  JSON.stringify({
    summary: parsed.summary,
    workflow: parsed.workflow,
    roles: parsed.roles,
    module: parsed.openproject_module,
  }).slice(0, 400)
