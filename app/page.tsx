import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import HomeEntry from './components/HomeEntry'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return <HomeEntry />
}
