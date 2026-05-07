import { NextRequest } from 'next/server'
import { improveSection } from '@/lib/claude'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Context) {
  await params

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const { sectionType, currentData, instructions } = body

  if (!sectionType || !currentData || !instructions?.trim()) {
    return Response.json({ error: 'sectionType, currentData, and instructions are required' }, { status: 400 })
  }

  const improved = await improveSection(sectionType, currentData, instructions)
  return Response.json({ data: improved })
}
