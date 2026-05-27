import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import HistoryClient from '@/app/dashboard/history/HistoryClient'
import { getClerkDisplayName, getClerkPrimaryEmail } from '@/lib/clerk-user'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const userName = user ? getClerkDisplayName(user) : 'Engineer'
  const userEmail = user ? getClerkPrimaryEmail(user) : ''

  return <HistoryClient userName={userName} userEmail={userEmail} />
}
