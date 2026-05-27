import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getRunsStore } from '@/lib/storage'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const store = getRunsStore()
  const run = await store.getRun(userId, id)
  if (!run) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ run })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const store = getRunsStore()
  const ok = await store.deleteRun(userId, id)
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
