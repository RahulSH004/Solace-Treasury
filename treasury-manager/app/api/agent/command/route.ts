import { NextRequest, NextResponse } from 'next/server'
import { toolDeclarations, executeTool } from '@/app/lib/agent/tools'
import { getTeamByAdminWallet } from '@/app/lib/db/team'

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
      - Always resolve wallet before saving a transaction
      - Always get SOL price before saving a transaction
      - Never save a transaction without both wallet and SOL price
      - If member not found, say so clearly — do not proceed
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

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast',
          messages,
          tools: toolDeclarations,
          tool_choice: 'auto'
        })
      })

      const data = await res.json()
      console.log('[Agent] Raw response:', JSON.stringify(data, null, 2))  // ← add karo
      const message = data.choices?.[0]?.message
      // Tool calls hain?
      if (message?.tool_calls && message.tool_calls.length > 0) {
        // Model ka response history mein daalo
        messages.push(message)

        // Har tool execute karo
        for (const toolCall of message.tool_calls) {
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
        finalResponse = message?.content ?? ''
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