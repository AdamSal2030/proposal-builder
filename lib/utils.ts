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
      subtitle: 'We are excited to present this opportunity to you.',
      buttonText: 'View Details',
    },
    cover: {
      title: 'Proposal Title',
      subtitle: 'A tailored proposal prepared exclusively for you',
      preparedFor: 'Client Name',
      preparedBy: 'Your Company',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    summary: {
      title: 'Executive Summary',
      content: 'Provide a concise overview of your proposal here.',
    },
    about: {
      title: 'About Us',
      content: 'Tell your client who you are and why you are the right choice.',
    },
    scope: {
      title: 'Scope of Work',
      intro: 'The following outlines exactly what is included in this proposal.',
      items: [
        { text: 'Item included in this proposal', included: true },
        { text: 'Another deliverable included', included: true },
        { text: 'Item not included in this scope', included: false },
      ],
    },
    specs: {
      title: 'Specifications',
      subtitle: 'Detailed specifications for this proposal',
      items: [
        { label: 'Category', value: 'Value' },
        { label: 'Specification', value: 'Details here' },
        { label: 'Another Spec', value: 'Details here' },
      ],
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'A visual overview',
      images: [],
      columns: 3,
    },
    investment: {
      title: 'Investment',
      intro: 'Below is a detailed breakdown of the investment required.',
      items: [
        { description: 'Item / Service', amount: '$0' },
        { description: 'Item / Service', amount: '$0' },
      ],
      total: '$0',
      currency: 'USD',
      notes: 'Prices are valid for 30 days from the date of this proposal.',
      validity: '30 days',
    },
    timeline: {
      title: 'Project Timeline',
      items: [
        { phase: 'Phase 1', duration: '1 week', description: 'Initial consultation and planning.' },
        { phase: 'Phase 2', duration: '2 weeks', description: 'Execution and delivery.' },
        { phase: 'Phase 3', duration: '1 week', description: 'Review, handover and sign-off.' },
      ],
    },
    testimonials: {
      title: 'What Our Clients Say',
      items: [
        {
          quote: 'Working with this team was an absolute pleasure. The results exceeded our expectations.',
          author: 'Client Name',
          role: 'CEO',
          company: 'Company Name',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      content: 'By accepting this proposal, the client agrees to the terms outlined herein. Payment is due within 14 days of invoice. All work remains the property of the service provider until full payment is received.',
      showSignature: true,
    },
    cta: {
      title: 'Ready to Move Forward?',
      subtitle: 'Get in touch and we will get started right away.',
      buttonText: 'Accept Proposal',
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
  cover: 'Cover Page',
  summary: 'Executive Summary',
  about: 'About Us',
  scope: 'Scope of Work',
  specs: 'Specifications',
  gallery: 'Photo Gallery',
  investment: 'Investment',
  timeline: 'Timeline',
  testimonials: 'Testimonials',
  terms: 'Terms & Conditions',
  cta: 'Call to Action',
}
