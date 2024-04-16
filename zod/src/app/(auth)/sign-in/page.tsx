'use client'

import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()
    {console.log(status)}
  if (status === "authenticated") {
    return <p>Signed in as {session.user.email}</p>
  }

  return <a href="../../api/auth/[...nextauth]/route.ts">Sign in</a>
}