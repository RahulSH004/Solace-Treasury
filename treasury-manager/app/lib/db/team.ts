import { prisma } from "../prisma";


export async function createTeam(
    adminWallet: string,
    repoName: string,
    repoOwner: string,
    treasuryPda?: string,
    githubAccessToken?: string
) {
    try {
    return await prisma.team.create({
      data: {
        adminWallet,
        repoOwner,
        repoName,
        treasuryPda: treasuryPda ?? null,
        githubAccessToken: githubAccessToken ?? null
      }
    })
   }catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Team already exists for this wallet')
    }
        throw error
   }
}

export async function getTeamByAdminWallet(adminWallet: string, retries = 1): Promise<any> {
    try {
        return await prisma.team.findUnique({
            where: { adminWallet }
        })
    } catch (error: any) {
        if (error.code === 'ETIMEDOUT' && retries > 0) {
            console.log("Database cold start timeout, retrying...");
            // Wait 2 seconds for Neon to finish waking up
            await new Promise(res => setTimeout(res, 2000));
            return getTeamByAdminWallet(adminWallet, retries - 1);
        }
        throw error;
    }
}

export async function updateTreasuryPda(
  adminWallet: string,
  treasuryPda: string
) {
  return await prisma.team.update({
    where: {adminWallet} ,
    data: { treasuryPda }
  })
}

export async function updateTeam(
  adminWallet: string,
  data: {
    treasuryPda?: string
    githubAccessToken?: string
  }
) {
  return await prisma.team.update({
    where: { adminWallet },
    data
  })
}
