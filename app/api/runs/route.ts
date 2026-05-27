import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getRunsStore, storageMode } from '@/lib/storage'
import type { CreateRunInput } from '@/lib/types/run'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = getRunsStore()
  const runs = await store.listRuns(userId)
  return NextResponse.json({ runs, storage: storageMode() })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const store = getRunsStore()
  const run = await store.createRun(userId, {
    requirement,
    results: body.results,
    status: body.status ?? 'complete',
  })

  return NextResponse.json({ run, storage: storageMode() }, { status: 201 })
}
