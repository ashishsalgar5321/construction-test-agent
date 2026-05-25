import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await currentUser()
  return (
    <DashboardClient
      userName={user?.firstName ?? 'Engineer'}
      userLastName={user?.lastName ?? ''}
      userEmail={user?.emailAddresses[0]?.emailAddress ?? ''}
    />
  )
}