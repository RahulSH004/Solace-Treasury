import { NextResponse, NextRequest } from 'next/server'
import { createTeam, getTeamByAdminWallet, updateTreasuryPda, updateTeam } from '@/app/lib/db/team'
import { authOptions } from '../auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'

//called when admin/founder connect the wallet and create their team
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { adminWallet, repoName, repoOwner } = body

        //validate all fields 
        if (!adminWallet || !repoName || !repoOwner) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }
        // Conflict check — one admin wallet = one team
        const existing = await getTeamByAdminWallet(adminWallet)
        if (existing) {
            return NextResponse.json(
                { error: 'Team already exists for this wallet' },
                { status: 409 }
            )
        }
        const team = await createTeam(adminWallet, repoName, repoOwner)

        return NextResponse.json(
            { team },
            { status: 201 }
        )
    } catch (err) {
        console.error('[POST /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Called on dashboard load — fetch team by admin's wallet
// ?adminWallet=<address>  ← comes from query param, not body
// (GET requests have no body — data travels in the URL)

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const adminWallet = searchParams.get('adminWallet')

        if (!adminWallet) {
            return NextResponse.json(
                { error: 'Missing adminWallet query parameter' },
                { status: 400 }
            )
        }

        const team = await getTeamByAdminWallet(adminWallet)
        if (!team) {
            return NextResponse.json(
                { error: 'Team not found for this wallet' },
                { status: 404 }
            )
        }
        const { githubAccessToken, ...safe } = team
        return NextResponse.json({
            ...safe,
            githubConnected: !!githubAccessToken,
        })
    } catch (err) {
        console.error('[GET /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Called AFTER admin initializes treasury on-chain via Phantom
// Stores the PDA address in DB so agent can reference it later
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { adminWallet, treasuryPda, githubAccessToken } = body

        if (!adminWallet) {
            return NextResponse.json(
                { error: 'adminWallet is required' },
                { status: 400 }
            )
        }

        if (!treasuryPda && !githubAccessToken) {
            return NextResponse.json(
                { error: 'treasuryPda or githubAccessToken is required' },
                { status: 400 }
            )
        }

        const existing = await getTeamByAdminWallet(adminWallet)
        if (!existing) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        if (githubAccessToken && typeof githubAccessToken !== 'string') {
            return NextResponse.json({ error: 'Invalid githubAccessToken' }, { status: 400 })
        }

        const updated = treasuryPda
            ? await updateTreasuryPda(adminWallet, treasuryPda)
            : await updateTeam(adminWallet, {
                githubAccessToken: githubAccessToken.trim()
              })

        const { githubAccessToken: storedToken, ...safe } = updated
        return NextResponse.json(
            { ...safe, githubConnected: !!storedToken },
            { status: 200 }
        )

    } catch (err) {
        console.error('[PUT /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 })
        }
        const { adminWallet } = await req.json()
        if (!adminWallet) {
            return NextResponse.json({ error: 'adminWallet required' }, { status: 400 })
        }
        const team = await getTeamByAdminWallet(adminWallet)
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }
        const updated = await updateTeam(adminWallet, { githubAccessToken: session.accessToken })
        const { githubAccessToken, ...safe } = updated
        return NextResponse.json({
            ...safe,
            githubConnected: !!githubAccessToken,
        })
    } catch (err) {
        console.error('[PATCH /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}