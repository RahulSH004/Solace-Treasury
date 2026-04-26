import { NextRequest, NextResponse } from 'next/server'
import { saveTransaction, getTransactions } from '@/app/lib/db/transcation'
import { getTeamByAdminWallet } from '@/app/lib/db/team'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { teamId, initiatedBy, toWallet, memberId, amountSol, amountUsd, reason } = body

        if (!teamId || !initiatedBy || !toWallet || !amountSol || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const transaction = await saveTransaction({
            teamId,
            toWallet,
            memberId,
            initiatedBy,
            amountSol,
            amountUsd: amountUsd ?? null,
            reason
        })
        return NextResponse.json(
            { transaction },
            { status: 201 }
        )
    } catch (error) {
        console.error('[POST /api/transactions]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Admin dashboard calls this to show pending + past transactions

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const adminWallet = searchParams.get('adminWallet')

        if (!adminWallet) {
            return NextResponse.json(
                { error: 'adminWallet query param is required' },
                { status: 400 }
            )
        }

        // Bridge: adminWallet → teamId (frontend doesn't know teamId)
        const team = await getTeamByAdminWallet(adminWallet)
        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        const transactions = await getTransactions(team.id)
        return NextResponse.json({ transactions }, { status: 200 })

    } catch (error) {
        console.error('[GET /api/transactions]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
