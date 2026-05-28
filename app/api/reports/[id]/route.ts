import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { storageErrorMessage } from '@/lib/storage/api-error'
import { getRunsStore } from '@/lib/storage'

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
    const report = await store.getReport(userId, id)
    if (!report) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (err) {
    console.error('[GET /api/reports/:id]', err)
    return NextResponse.json(
      { error: 'Could not load report', detail: storageErrorMessage(err) },
      { status: 503 }
    )
  }
}
