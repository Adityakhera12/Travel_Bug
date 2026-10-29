import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export const APP_SESSION_COOKIE = 'app-session'

export async function getCurrentUser() {
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayloadClient()
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })

  if (!user || user.collection !== 'users') return null
  return user
}

export async function setAppSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAppSession() {
  const cookieStore = await cookies()
  cookieStore.delete(APP_SESSION_COOKIE)
}
