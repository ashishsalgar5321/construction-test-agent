import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getClerkDisplayName, getClerkPrimaryEmail } from '@/lib/clerk-user'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  const displayName = getClerkDisplayName(user)
  const [first, ...rest] = displayName.split(' ')
  return (
    <Suspense fallback={null}>
      <DashboardClient
        userName={user?.firstName ?? first ?? 'Engineer'}
        userLastName={user?.lastName ?? rest.join(' ')}
        userEmail={getClerkPrimaryEmail(user)}
      />
    </Suspense>
  )
}