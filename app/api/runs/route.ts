import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { storageErrorMessage } from '@/lib/storage/api-error'
import { getRunsStore, storageMode, storageWarning } from '@/lib/storage'
import type { CreateRunInput } from '@/lib/types/run'

export const runtime = 'nodejs'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const store = getRunsStore()
    const runs = await store.listRuns(userId)
    return NextResponse.json({
      runs,
      storage: storageMode(),
      warning: storageWarning(),
    })
  } catch (err) {
    console.error('[GET /api/runs]', err)
    return NextResponse.json(
      {
        error: 'Could not load history',
        detail: storageErrorMessage(err),
        storage: storageMode(),
        warning: storageWarning(),
      },
      { status: 503 }
    )
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const warn = storageWarning()
  if (warn) {
    return NextResponse.json({ error: warn, storage: storageMode() }, { status: 503 })
  }

  let body: CreateRunInput
  try {
    body = (await req.json()) as CreateRunInput
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const requirement = body.requirement?.trim()
  if (!requirement) {
    return NextResponse.json({ error: 'Requirement is required' }, { status: 400 })
  }
  if (!body.results || typeof body.results !== 'object') {
    return NextResponse.json({ error: 'Results are required' }, { status: 400 })
  }

  try {
    const store = getRunsStore()
    const run = await store.createRun(userId, {
      requirement,
      results: body.results,
      status: body.status ?? 'complete',
    })

    return NextResponse.json({ run, storage: storageMode() }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/runs]', err)
    return NextResponse.json(
      {
        error: 'Could not save run',
        detail: storageErrorMessage(err),
        storage: storageMode(),
      },
      { status: 503 }
    )
  }
}
