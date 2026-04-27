import { resolveWallet } from '@/app/lib/db/members'
import { saveTransaction } from '@/app/lib/db/transcation'

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
      description: 'Saves a pending transaction to the database for admin approval',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID' },
          toWallet: { type: 'string', description: 'Recipient Solana wallet address' },
          memberId: { type: 'string', description: 'Member ID in the database' },
          amountSol: { type: 'number', description: 'Amount in SOL' },
          amountUsd: { type: 'number', description: 'Amount in USD' },
          initiatedBy: { type: 'string', description: 'Admin wallet address' },
          reason: { type: 'string', description: 'Reason for payment' }
        },
        required: ['teamId', 'toWallet', 'amountSol', 'amountUsd', 'initiatedBy', 'reason']
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
            const tx = await saveTransaction({
                teamId: toolArgs.teamId,
                toWallet: toolArgs.toWallet,
                memberId: toolArgs.memberId,
                amountSol: toolArgs.amountSol,
                amountUsd: toolArgs.amountUsd,
                initiatedBy: toolArgs.initiatedBy,
                reason: toolArgs.reason
            })
            return { transactionId: tx.id, status: tx.status }
        }

        default:
            return { error: `Unknown tool: ${toolName}` }
    }
}
