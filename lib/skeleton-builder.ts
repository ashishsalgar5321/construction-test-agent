import { asStringArray, flattenTestCaseBundle } from './normalize-ai'

type TestCase = Record<string, unknown>

export function buildPlaywrightSkeleton(
  testCasesRaw: Record<string, unknown>,
  requirement: string
) {
  const list = flattenTestCaseBundle(testCasesRaw) as TestCase[]

  const top = list.slice(0, 3)
  const blocks = top.map((tc, i) => {
    const id = String(tc.id ?? `TC-00${i + 1}`)
    const title = String(tc.title ?? 'Work package test').replace(/'/g, "\\'")
    const steps = asStringArray(tc.steps)
    const stepComments =
      steps.length > 0
        ? steps.map((s, si) => `  // Step ${si + 1}: ${s}`).join('\n')
        : '  // TODO: add steps from test case'

    return `test('${id}: ${title}', async ({ page }) => {
  await page.goto('/projects/1/work_packages/new');
${stepComments}
  await expect(page.locator('.work-package-form')).toBeVisible();
});`
  })

  if (blocks.length === 0) {
    blocks.push(`test('TC-001: Create and assign work package', async ({ page }) => {
  await page.goto('/projects/1/work_packages/new');
  await page.fill('[name="subject"]', 'Safety Issue - Zone A');
  await page.selectOption('[name="assignee"]', { label: 'Contractor' });
  await page.fill('[name="dueDate"]', '2026-06-01');
  await page.click('button[type="submit"]');
  await expect(page.locator('.op-toast')).toContainText('success');
});`)
  }

  const reqLine = requirement.replace(/\n/g, ' ').slice(0, 120)

  const code = `import { test, expect } from '@playwright/test';

/**
 * ConstructQA Agent — Playwright skeleton (OpenProject reference)
 * Requirement: ${reqLine}
 * Base URL: configure in playwright.config.ts
 */

${blocks.join('\n\n')}
`

  const apiTests = [
    {
      method: 'POST',
      endpoint: '/api/v3/work_packages',
      description: 'Create a safety work package in OpenProject',
      payload: {
        subject: 'Safety Issue - Zone A',
        _links: {
          project: { href: '/api/v3/projects/1' },
          type: { href: '/api/v3/types/1' },
        },
      },
      expectedStatus: 201,
    },
    {
      method: 'GET',
      endpoint: '/api/v3/projects',
      description: 'List projects accessible to the authenticated user',
      payload: {},
      expectedStatus: 200,
    },
    {
      method: 'PATCH',
      endpoint: '/api/v3/work_packages/:id',
      description: 'Update work package status (Open → In Progress)',
      payload: {
        _links: { status: { href: '/api/v3/statuses/2' } },
      },
      expectedStatus: 200,
    },
  ]

  return {
    framework: 'Playwright',
    language: 'TypeScript',
    baseUrl: 'https://your-openproject-instance.com',
    code,
    apiTests,
  }
}
