import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { storageErrorMessage } from '@/lib/storage/api-error'
import { getRunsStore, storageMode, storageWarning } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const store = getRunsStore()
    const reports = await store.listReports(userId)
    return NextResponse.json({
      reports,
      storage: storageMode(),
      warning: storageWarning(),
    })
  } catch (err) {
    console.error('[GET /api/reports]', err)
    return NextResponse.json(
      {
        error: 'Could not load reports',
        detail: storageErrorMessage(err),
        storage: storageMode(),
        warning: storageWarning(),
      },
      { status: 503 }
    )
  }
}
