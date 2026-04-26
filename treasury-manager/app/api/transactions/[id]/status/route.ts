import {NextResponse, NextRequest} from 'next/server';
import { updateTransactionStatus } from '@/app/lib/db/transcation'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try{
        const transactionId = params.id
        const body = await req.json()
        const { status, txSignature } = body

        if (!['PENDING', 'APPROVED', 'CONFIRMED', 'FAILED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            )
        }

        const updated = await updateTransactionStatus(transactionId, status, txSignature)
        if (!updated) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            updated,
            { status: 200 }
        )
    }catch (error) {
        console.error(`[PATCH /api/transactions/${params.id}/status]`, error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}