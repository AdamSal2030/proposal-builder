import Anthropic from '@anthropic-ai/sdk'
import type { Section } from './types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateProposalSections(
  input: string,
  proposalTitle: string
): Promise<Section[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are a professional proposal writer. Given information about a project, generate a structured proposal with compelling sections. Return ONLY valid JSON — no markdown, no explanation.`,
    messages: [
      {
        role: 'user',
        content: `Create a professional proposal for: "${proposalTitle}"

Context/Content:
${input}

Return a JSON array of sections. Each section must have: id (unique string), type (one of: hero, summary, problem, solution, features, timeline, pricing, team, cta), and data (type-specific fields).

Section data shapes:
- hero: { title, subtitle, buttonText }
- summary: { title, content }
- problem: { title, content }
- solution: { title, content }
- features: { title, items: [{ title, description }] }
- timeline: { title, items: [{ phase, duration, description }] }
- pricing: { title, tiers: [{ name, price, period, features: string[], highlighted?: boolean }] }
- team: { title, members: [{ name, role, bio }] }
- cta: { title, subtitle, buttonText }

Generate 5-8 sections that make sense for this proposal. Always include hero and cta. Make the content professional, specific, and compelling.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI did not return valid JSON sections')
  return JSON.parse(jsonMatch[0]) as Section[]
}

export async function improveSection(
  sectionType: string,
  currentData: Record<string, unknown>,
  instructions: string
): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are a professional proposal writer. Improve section content based on instructions. Return ONLY valid JSON with the same structure as the input.`,
    messages: [
      {
        role: 'user',
        content: `Improve this ${sectionType} section based on these instructions: "${instructions}"

Current content:
${JSON.stringify(currentData, null, 2)}

Return the improved section data as JSON with the exact same structure.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI did not return valid JSON')
  return JSON.parse(jsonMatch[0])
}

export async function extractTextFromContent(rawText: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `Extract and summarize the key information from this document content that would be useful for creating a business proposal. Be concise but comprehensive.`,
    messages: [
      {
        role: 'user',
        content: rawText.slice(0, 8000),
      },
    ],
  })
  return message.content[0].type === 'text' ? message.content[0].text : rawText
}
