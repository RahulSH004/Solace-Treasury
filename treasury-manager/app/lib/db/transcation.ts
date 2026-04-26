import { prisma } from "../prisma"

export async function saveTransaction(
    data: {
        teamId: string,
        memberId?: string,
        toWallet: string
        amountSol: number
        amountUsd: number
        initiatedBy: string
        txSignature?: string    // optional - ? means not required
        reason?: string
        status?: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED'
    }
) {
    return await prisma.transaction.create({
        data: {
            teamId: data.teamId,
            memberId: data.memberId,
            toWallet: data.toWallet,
            amountSol: data.amountSol,
            amountUsd: data.amountUsd,
            initiatedBy: data.initiatedBy,
            txSignature: data.txSignature,
            reason: data.reason,
            status: data.status ?? 'PENDING'
        }
    })
}

export async function updateTransactionStatus(
    transactionId: string,
    status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'FAILED',
    txSignature?: string
) {
    return await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status,
            txSignature
        }
    })  
}

export async function getTransactions(teamId: string) {
  return await prisma.transaction.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
    include: {
      member: {
        select: {
          githubUsername: true,
          walletAddress: true
        }
      }
    }
  })
}
export async function getTransactionById(transactionId: string) {
  return await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      member: {
        select: {
          githubUsername: true,
          walletAddress: true
        }
      }
    }
  })
}