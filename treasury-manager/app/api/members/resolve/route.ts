import {NextRequest, NextResponse} from 'next/server'
import { resolveWallet } from '@/app/lib/db/members'

export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url)
        const githubUsername = searchParams.get('githubUsername')
        const teamId = searchParams.get('teamId')

        if(!githubUsername || !teamId){
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const walletAddress = await resolveWallet(githubUsername, teamId)
        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Member not found in this team' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { walletAddress },
            { status: 200 }
        )
    } catch (error) {
        console.error('[GET /api/members/resolve]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}