export type SectionType =
  | 'hero'
  | 'summary'
  | 'problem'
  | 'solution'
  | 'features'
  | 'timeline'
  | 'pricing'
  | 'team'
  | 'cta'

export interface HeroData {
  title: string
  subtitle: string
  buttonText: string
}

export interface TextBlockData {
  title: string
  content: string
}

export interface FeatureItem {
  title: string
  description: string
  icon?: string
}

export interface FeaturesData {
  title: string
  items: FeatureItem[]
}

export interface TimelineItem {
  phase: string
  duration: string
  description: string
}

export interface TimelineData {
  title: string
  items: TimelineItem[]
}

export interface PricingTier {
  name: string
  price: string
  period?: string
  features: string[]
  highlighted?: boolean
}

export interface PricingData {
  title: string
  tiers: PricingTier[]
}

export interface TeamMember {
  name: string
  role: string
  bio: string
}

export interface TeamData {
  title: string
  members: TeamMember[]
}

export interface CTAData {
  title: string
  subtitle: string
  buttonText: string
}

export type SectionData =
  | HeroData
  | TextBlockData
  | FeaturesData
  | TimelineData
  | PricingData
  | TeamData
  | CTAData

export interface Section {
  id: string
  type: SectionType
  data: SectionData
}

export interface ProposalWithUploads {
  id: string
  title: string
  slug: string
  status: string
  theme: string
  clientName: string | null
  clientEmail: string | null
  sections: Section[]
  createdAt: Date
  updatedAt: Date
  uploads: UploadRecord[]
}

export interface UploadRecord {
  id: string
  proposalId: string
  filename: string
  path: string
  mimetype: string
  size: number
  extractedText: string | null
  createdAt: Date
}
