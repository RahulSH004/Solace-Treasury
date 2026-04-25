import { prisma } from "../prisma";


export async function createTeam(
    adminWallet: string,
    repoName: string,
    repoOwner: string,
    treasuryPda?: string
) {
    try {
    return await prisma.team.create({
      data: {
        adminWallet,
        repoOwner,
        repoName,
        treasuryPda: treasuryPda ?? null
      }
    })
   }catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Team already exists for this wallet')
    }
        throw error
   }
}

export async function getTeamByAdminWallet(adminWallet: string){
    return await prisma.team.findUnique({
        where: { adminWallet}
    })
}

export async function updateTreasuryPda(
  teamId: string,
  treasuryPda: string
) {
  return await prisma.team.update({
    where: { id: teamId },
    data: { treasuryPda }
  })
}