import { NextResponse } from 'next/server'
import { clearAppSession, getCurrentUser, setAppSession } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { authSchema } from '@/lib/validation'

export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
  })
}

export async function POST(request: Request) {
  const parsed = authSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check your details.' },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()
  const { mode, email, password, name } = parsed.data

  try {
    if (mode === 'register') {
      if (!name) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
      }
      await payload.create({
        collection: 'users',
        data: { name, email, password },
        overrideAccess: false,
      })
    }

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!result.token || !result.user) {
      return NextResponse.json({ error: 'Unable to start a secure session.' }, { status: 500 })
    }

    await setAppSession(result.token)
    return NextResponse.json({
      user: { id: result.user.id, name: result.user.name, email: result.user.email },
    })
  } catch {
    return NextResponse.json(
      { error: mode === 'login' ? 'Email or password is incorrect.' : 'An account with that email may already exist.' },
      { status: 400 },
    )
  }
}

export async function DELETE() {
  await clearAppSession()
  return NextResponse.json({ ok: true })
}
