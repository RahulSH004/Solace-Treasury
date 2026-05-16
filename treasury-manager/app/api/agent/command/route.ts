import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { toolDeclarations, executeTool } from '@/app/lib/agent/tools'
import { getTeamByAdminWallet } from '@/app/lib/db/team'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { command, adminWallet } = body

    if (!command || !adminWallet) {
      return NextResponse.json(
        { error: 'command and adminWallet are required' },
        { status: 400 }
      )
    }

    const team = await getTeamByAdminWallet(adminWallet)
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const systemPrompt = `
      You are Solace, an AI treasury manager for a Solana-based team wallet.
      
      Team Context:
      - Team ID: ${team.id}
      - GitHub Repo: ${team.repoOwner}/${team.repoName}
      - Admin Wallet: ${adminWallet}
      
      Rules:
      - For "who are top contributors" or PR questions — ONLY call get_github_prs with teamId: ${team.id}, repoOwner: ${team.repoOwner}, repoName: ${team.repoName}. Do NOT call resolve_wallet for listing contributors.
      - For payments — call resolve_wallet first to get memberId, then get_sol_price, then save_transaction
      - Call save_transaction with memberId from resolve_wallet — NEVER invent toWallet
      - When calling get_github_prs always pass teamId: ${team.id}
      - If get_github_prs returns an error about PAT — tell user to add GitHub PAT on Team page
      - If resolve_wallet fails for a payment — say clearly that member is not registered in the team
      - Be concise in final response
    `

    // Groq format — system alag message hota hai
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: command }
    ]

    const tools = toolDeclarations.map(t => ({
      type: 'function' as const,
      function: {
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters
      }
    }))

    let finalResponse = ''
    let iterations = 0
    const MAX_ITERATIONS = 10

    while (iterations < MAX_ITERATIONS) {
      iterations++

      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools,
        tool_choice: 'auto'
      })

      const message = result.choices[0].message
      console.log('[Agent] Raw response:', JSON.stringify(message, null, 2))

      // Tool calls hain?
      if (!message.tool_calls || message.tool_calls.length === 0) {
        finalResponse = message.content ?? ''
        break
      }

      // Model message push karo
      messages.push(message)

      // Tool calls execute karo
      const toolResults: any[] = []

      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        console.log(`[Agent] Executing tool: ${name}`, args)
        const result = await executeTool(name, args)
        console.log(`[Agent] Tool result: ${name}`, result)

        toolResults.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        })
      }

      // Tool results push karo
      messages.push(...toolResults)
    }

    return NextResponse.json({
      message: finalResponse,
      teamId: team.id
    })

  } catch (error: any) {
    console.error('[POST /api/agent/command]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}