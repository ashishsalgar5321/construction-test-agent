import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { storageErrorMessage } from '@/lib/storage/api-error'
import { getRunsStore, storageWarning } from '@/lib/storage'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const store = getRunsStore()
    const run = await store.getRun(userId, id)
    if (!run) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ run, warning: storageWarning() })
  } catch (err) {
    console.error('[GET /api/runs/:id]', err)
    return NextResponse.json(
      { error: 'Could not load run', detail: storageErrorMessage(err) },
      { status: 503 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const store = getRunsStore()
    const ok = await store.deleteRun(userId, id)
    if (!ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/runs/:id]', err)
    return NextResponse.json(
      { error: 'Could not delete run', detail: storageErrorMessage(err) },
      { status: 503 }
    )
  }
}
