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
    system: `You are a professional proposal writer. Generate structured proposal content. Return ONLY valid JSON — no markdown, no explanation, no code fences.`,
    messages: [
      {
        role: 'user',
        content: `Create a professional proposal for: "${proposalTitle}"

Context:
${input}

Return a JSON array of proposal sections. Each section: { id (unique 8-char string), type, data }.

Available types and their data shapes:
- cover: { title, subtitle, preparedFor, preparedBy, date }
- hero: { title, subtitle, buttonText }
- summary: { title, content }
- about: { title, content }
- scope: { title, intro, items: [{ text, included: boolean }] }
- specs: { title, subtitle, items: [{ label, value }] }
- gallery: { title, subtitle, images: [] }
- investment: { title, intro, items: [{ description, amount }], total, currency, validity, notes }
- timeline: { title, items: [{ phase, duration, description }] }
- testimonials: { title, items: [{ quote, author, role, company }] }
- terms: { title, content, showSignature: true }
- cta: { title, subtitle, buttonText }

Rules:
- Always start with cover or hero, always end with cta
- Pick 5-7 sections that fit the proposal type (hotel, car, construction, service, etc.)
- Make all content specific, professional and compelling — no generic filler
- For investment: include realistic line items and a total
- For scope: 4-6 included items, 1-2 excluded items
- For specs: 6-10 relevant key/value rows`,
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
