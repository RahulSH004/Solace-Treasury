import { prisma } from "../prisma";

export async function addMember(
  teamId: string,
  githubUsername: string,
  walletAddress: string
) {
    try {
    return await prisma.member.create({
      data: { teamId, githubUsername, walletAddress }
    })
    } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error(`Member ${githubUsername} already exists in this team`)
    }
        throw error
    }
}

export async function resolveWallet(
  githubUsername: string,
  teamId: string
): Promise<string | null>{
    return await prisma.member.findFirst({
        where: {
            githubUsername,
            teamId
        },
        select: {
            walletAddress: true
        }
    }).then(member => member?.walletAddress ?? null)
}

export async function getMembers(teamId: string) {
  return await prisma.member.findMany({
    where: { teamId },
    orderBy: { addedAt: 'desc' }
  })
}