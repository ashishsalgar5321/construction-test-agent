import { auth } from '@clerk/nextjs/server'
import HomeEntry from './components/HomeEntry'

export default async function Home() {
  const { userId } = await auth()
  return <HomeEntry signedIn={Boolean(userId)} />
}
