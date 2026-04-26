import { NextRequest, NextResponse } from "next/server";
import { addMember, resolveWallet, getMembers  } from '@/app/lib/db/members'
import { getTeamByAdminWallet } from "@/app/lib/db/team";


export async function POST(req: NextRequest) {
    try{
        const body = await req.json()
        const { teamId, githubUsername, walletAddress } = body

        if(!teamId || !githubUsername || !walletAddress){
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const member = await addMember(teamId, githubUsername, walletAddress)
        return NextResponse.json(
            { member },
            { status: 201 }
        )
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            return NextResponse.json({ error: error.message }, { status: 409 })
        }
        console.error('[POST /api/members]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET /api/members

export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url)
        const adminWallet = searchParams.get('adminWallet')

        if (!adminWallet) {
            return NextResponse.json({ error: 'Missing adminWallet' }, { status: 400 })
        }

        const team = await getTeamByAdminWallet(adminWallet)
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }
        
        const members = await getMembers(team.id)
        return NextResponse.json({ members })

    }catch (error) {
        console.error('[GET /api/members]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}