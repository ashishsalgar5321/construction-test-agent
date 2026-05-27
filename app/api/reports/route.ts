import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getRunsStore, storageMode } from '@/lib/storage'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = getRunsStore()
  const reports = await store.listReports(userId)
  return NextResponse.json({ reports, storage: storageMode() })
}
