export type SectionType =
  | 'hero'
  | 'cover'
  | 'summary'
  | 'about'
  | 'scope'
  | 'specs'
  | 'gallery'
  | 'investment'
  | 'timeline'
  | 'testimonials'
  | 'terms'
  | 'cta'

export type BackgroundType = 'gradient' | 'image' | 'video'

// ── Hero (full-bleed banner with optional video/image bg) ─────────────────
export interface HeroData {
  title: string
  subtitle: string
  buttonText: string
  backgroundType?: BackgroundType
  backgroundImage?: string
  backgroundVideo?: string
  overlayOpacity?: number
}

// ── Cover (proposal title page) ───────────────────────────────────────────
export interface CoverData {
  title: string
  subtitle?: string
  preparedFor: string
  preparedBy: string
  date: string
  logo?: string
  backgroundImage?: string
}

// ── Text block (summary, about) ───────────────────────────────────────────
export interface TextBlockData {
  title: string
  content: string
}

// ── Scope of work ─────────────────────────────────────────────────────────
export interface ScopeItem {
  text: string
  included: boolean
}
export interface ScopeData {
  title: string
  intro?: string
  items: ScopeItem[]
}

// ── Specifications / key-value table ──────────────────────────────────────
export interface SpecItem {
  label: string
  value: string
}
export interface SpecsData {
  title: string
  subtitle?: string
  items: SpecItem[]
  image?: string
}

// ── Photo gallery ─────────────────────────────────────────────────────────
export interface GalleryImage {
  url: string
  caption?: string
}
export interface GalleryData {
  title: string
  subtitle?: string
  images: GalleryImage[]
  columns?: number
}

// ── Investment / cost breakdown ───────────────────────────────────────────
export interface InvestmentItem {
  description: string
  amount: string
}
export interface InvestmentData {
  title: string
  intro?: string
  items: InvestmentItem[]
  total: string
  currency?: string
  notes?: string
  validity?: string
}

// ── Timeline ──────────────────────────────────────────────────────────────
export interface TimelineItem {
  phase: string
  duration: string
  description: string
}
export interface TimelineData {
  title: string
  items: TimelineItem[]
}

// ── Testimonials ──────────────────────────────────────────────────────────
export interface TestimonialItem {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
}
export interface TestimonialsData {
  title: string
  items: TestimonialItem[]
}

// ── Terms & conditions ────────────────────────────────────────────────────
export interface TermsData {
  title: string
  content: string
  showSignature?: boolean
}

// ── Call to action ────────────────────────────────────────────────────────
export interface CTAData {
  title: string
  subtitle: string
  buttonText: string
}

export type SectionData =
  | HeroData
  | CoverData
  | TextBlockData
  | ScopeData
  | SpecsData
  | GalleryData
  | InvestmentData
  | TimelineData
  | TestimonialsData
  | TermsData
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
