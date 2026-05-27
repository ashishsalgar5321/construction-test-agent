import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ReportsClient from '@/app/dashboard/reports/ReportsClient'
import { getClerkDisplayName, getClerkPrimaryEmail } from '@/lib/clerk-user'

type SearchParams = Promise<{ runId?: string }>

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const userName = user ? getClerkDisplayName(user) : 'Engineer'
  const userEmail = user ? getClerkPrimaryEmail(user) : ''
  const params = await searchParams

  return (
    <ReportsClient
      userName={userName}
      userEmail={userEmail}
      highlightRunId={params.runId}
    />
  )
}
