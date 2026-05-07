import { nanoid } from 'nanoid'
import type { Section, SectionType } from './types'

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    nanoid(6)
  )
}

export function parseSections(raw: string): Section[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function createDefaultSection(type: SectionType): Section {
  const id = nanoid()

  const defaults: Record<SectionType, Section['data']> = {
    hero: {
      title: 'Welcome to Our Proposal',
      subtitle: "We're excited to present this proposal to you.",
      buttonText: 'Get Started',
    },
    summary: {
      title: 'Executive Summary',
      content: 'Provide a concise overview of your proposal here.',
    },
    problem: {
      title: 'The Problem',
      content: 'Describe the challenge or pain point your client is facing.',
    },
    solution: {
      title: 'Our Solution',
      content: 'Explain how your product or service solves the problem.',
    },
    features: {
      title: 'Key Features',
      items: [
        { title: 'Feature 1', description: 'Description of this feature.' },
        { title: 'Feature 2', description: 'Description of this feature.' },
        { title: 'Feature 3', description: 'Description of this feature.' },
      ],
    },
    timeline: {
      title: 'Project Timeline',
      items: [
        { phase: 'Phase 1', duration: '2 weeks', description: 'Discovery and planning.' },
        { phase: 'Phase 2', duration: '4 weeks', description: 'Development and implementation.' },
        { phase: 'Phase 3', duration: '1 week', description: 'Testing and launch.' },
      ],
    },
    pricing: {
      title: 'Pricing',
      tiers: [
        { name: 'Starter', price: '$999', period: '/month', features: ['Feature A', 'Feature B'], highlighted: false },
        {
          name: 'Professional',
          price: '$2,499',
          period: '/month',
          features: ['Everything in Starter', 'Feature C', 'Feature D'],
          highlighted: true,
        },
      ],
    },
    team: {
      title: 'Our Team',
      members: [{ name: 'Jane Doe', role: 'Project Lead', bio: 'Expert with 10+ years of experience.' }],
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: "Let's work together to achieve your goals.",
      buttonText: 'Contact Us',
    },
  }

  return { id, type, data: defaults[type] }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero Banner',
  summary: 'Executive Summary',
  problem: 'Problem Statement',
  solution: 'Our Solution',
  features: 'Key Features',
  timeline: 'Project Timeline',
  pricing: 'Pricing',
  team: 'Our Team',
  cta: 'Call to Action',
}
