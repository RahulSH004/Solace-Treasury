import { NextResponse, NextRequest } from 'next/server'
import { createTeam, getTeamByAdminWallet, updateTreasuryPda } from '@/app/lib/db/team'

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
        const team = await createTeam( adminWallet, repoOwner, repoName )

        return NextResponse.json(
            { team },
            { status: 201 }
        )
    }catch (err) {
        console.error('[POST /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Called on dashboard load — fetch team by admin's wallet
// ?adminWallet=<address>  ← comes from query param, not body
// (GET requests have no body — data travels in the URL)

export async function GET(req: NextRequest) {
    try{
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
        return NextResponse.json(
            team,
            { status: 200 }
        )
    }catch(err) {
        console.error('[GET /api/teams]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Called AFTER admin initializes treasury on-chain via Phantom
// Stores the PDA address in DB so agent can reference it later
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { adminWallet, treasuryPda } = body

    if (!adminWallet || !treasuryPda) {
      return NextResponse.json(
        { error: 'adminWallet and treasuryPda are required' },
        { status: 400 }
      )
    }

    // Verify the team exists before updating
    const existing = await getTeamByAdminWallet(adminWallet)
    if (!existing) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const updated = await updateTreasuryPda(adminWallet, treasuryPda)

    return NextResponse.json(updated, { status: 200 })

  } catch (err) {
    console.error('[PUT /api/teams]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}