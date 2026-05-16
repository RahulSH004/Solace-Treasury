import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 401 }
      )
    }

    const res = await fetch(
      'https://api.github.com/user/repos?per_page=50&sort=updated&type=all',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      }
    )

    const repos = await res.json()
    return NextResponse.json({
      repos: repos.map((r: any) => ({
        name: r.name,
        owner: r.owner.login,
        private: r.private,
        description: r.description
      }))
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
  }
}