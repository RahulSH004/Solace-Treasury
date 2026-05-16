import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { toolDeclarations, executeTool } from '@/app/lib/agent/tools'
import { getTeamByAdminWallet } from '@/app/lib/db/team'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const systemPrompt = `
      You are Solace, an AI treasury manager for a Solana-based team wallet.
      
      Team Context:
      - Team ID: ${team.id}
      - GitHub Repo: ${team.repoOwner}/${team.repoName}
      - Admin Wallet: ${adminWallet}
      
      Rules:
      - ALWAYS call resolve_wallet first to get memberId
      - ALWAYS call get_sol_price before save_transaction
      - Call save_transaction with memberId from resolve_wallet — NEVER invent toWallet or memberId
      - If member not found, stop and say so clearly
      - Be concise in your final response
    `

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: command }
    ]

    let finalResponse = ''
    let iterations = 0
    const MAX_ITERATIONS = 10

    while (iterations < MAX_ITERATIONS) {
      iterations++

      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        tools: toolDeclarations.map(t => ({
          type: 'function',
          function: {
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters
          }
        })),
        tool_choice: 'auto'
      })

      const data = result.choices?.[0]?.message
      console.log('[Agent] Raw response:', JSON.stringify(data, null, 2))  // ← add karo
      // Tool calls hain?
      if (data?.tool_calls && data.tool_calls.length > 0) {
        // Model ka response history mein daalo
        messages.push(data)

        // Har tool execute karo
        for (const toolCall of data.tool_calls) {
          const name = toolCall.function.name
          const args = JSON.parse(toolCall.function.arguments)
          console.log(`[Agent] Executing tool: ${name}`, args)

          const result = await executeTool(name, args)
          console.log(`[Agent] Tool result: ${name}`, result)

          // Result history mein daalega
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          })
        }
      } else {
        // Koi tool call nahi
        finalResponse = data?.content ?? ''
        break
      }
    }

    return NextResponse.json({
      message: finalResponse,
      teamId: team.id
    })

  } catch (error) {
    console.error('[POST /api/agent/command]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}