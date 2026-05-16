import { resolveWallet } from '@/app/lib/db/members'
import { saveTransaction } from '@/app/lib/db/transcation'
import { getMemberByIdForTeam } from '@/app/lib/db/members'
import { parseSolanaAddress } from '@/app/lib/solana-address'

//toolDeclarations OpenAI format
export const toolDeclarations = [
  {
    type: 'function',
    function: {
      name: 'resolve_wallet',
      description: 'Resolves a GitHub username to a Solana wallet address of a team member',
      parameters: {
        type: 'object',
        properties: {
          githubUsername: { type: 'string', description: 'GitHub username of the member' },
          teamId: { type: 'string', description: 'Team ID to search in' }
        },
        required: ['githubUsername', 'teamId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sol_price',
      description: 'Gets the current SOL price in USD from CoinGecko',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_github_prs',
      description: 'Gets recent pull requests and contributors from the GitHub repository',
      parameters: {
        type: 'object',
        properties: {
          repoOwner: { type: 'string', description: 'GitHub repository owner' },
          repoName: { type: 'string', description: 'GitHub repository name' }
        },
        required: ['repoOwner', 'repoName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'save_transaction',
      description: 'Saves a pending transaction. Always use memberId from resolve_wallet. toWallet is ignored when memberId is set.',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID' },
          memberId: { type: 'string', description: 'Member ID from resolve_wallet result' },
          toWallet: { type: 'string', description: 'Ignored when memberId is set' },
          amountSol: { type: 'number', description: 'Amount in SOL' },
          amountUsd: { type: 'number', description: 'Amount in USD' },
          initiatedBy: { type: 'string', description: 'Admin wallet address' },
          reason: { type: 'string', description: 'Reason for payment' }
        },
        required: ['teamId', 'memberId', 'amountSol', 'amountUsd', 'initiatedBy', 'reason']
      }
    }
  }
]
// TOOL IMPLEMENTATIONS

export async function executeTool(
  toolName: string,
  toolArgs: Record<string, any>
): Promise<any> {

  switch (toolName) {
    case 'resolve_wallet': {
      const wallet = await resolveWallet(
        toolArgs.githubUsername,
        toolArgs.teamId
      )
      if (!wallet) return { error: 'Member not found in team' }
      return {
        memberId: wallet.id,
        walletAddress: wallet.walletAddress
      }
    }
    case 'get_sol_price': {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      )
      const data = await res.json()
      return { solPriceUsd: data.solana.usd }
    }

    case 'get_github_prs': {
      const res = await fetch(
        `https://api.github.com/repos/${toolArgs.repoOwner}/${toolArgs.repoName}/pulls?state=closed&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )
      const prs = await res.json()
      // Sirf relevant info return karo — poora GitHub response nahi
      return {
        pullRequests: prs.map((pr: any) => ({
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          mergedAt: pr.merged_at
        }))
      }
    }

    case 'save_transaction': {
      const teamId = toolArgs.teamId
      const memberId = toolArgs.memberId as string | undefined
      let toWallet: string
      let resolvedMemberId: string | undefined

      if (memberId) {
        // memberId present → DB se wallet lo
        const member = await getMemberByIdForTeam(memberId, teamId)
        if (!member) {
          return { error: 'Member not found for this team' }
        }
        toWallet = member.walletAddress.trim()
        parseSolanaAddress(toWallet)
        resolvedMemberId = member.id

        // Cross-check agar model ne toWallet bhi bheja
        const modelWallet = typeof toolArgs.toWallet === 'string'
          ? toolArgs.toWallet.trim() : ''
        if (modelWallet && modelWallet !== toWallet) {
          return {
            error: 'toWallet does not match member wallet — use memberId only'
          }
        }
      } else {
        // memberId nahi — toWallet validate karo
        try {
          toWallet = parseSolanaAddress(toolArgs.toWallet)
        } catch (e: any) {
          return { error: e.message }
        }
        resolvedMemberId = undefined
      }

      const tx = await saveTransaction({
        teamId,
        toWallet,
        memberId: resolvedMemberId,
        amountSol: toolArgs.amountSol,
        amountUsd: toolArgs.amountUsd,
        initiatedBy: toolArgs.initiatedBy,
        reason: toolArgs.reason,
      })
      return { transactionId: tx.id, status: tx.status }
    }


    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}
