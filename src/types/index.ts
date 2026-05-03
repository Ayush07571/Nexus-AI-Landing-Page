// ──────────────────────────────────────────────
// Nexus AI — Shared TypeScript Interfaces
// ──────────────────────────────────────────────

export interface DailyVisit {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
}

export interface Analytics {
  totalVisits: number;
  dailyVisits: DailyVisit[];
  totalLeads: number;
  lastUpdated: string; // ISO datetime string
}

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  badge: string | null;
  highlighted: boolean;
  cta: string;
  features: PricingFeature[];
}

export interface PricingData {
  plans: PricingPlan[];
}

export type BlogStatus = 'published' | 'draft';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: BlogStatus;
  category: string;
  tags: string[];
  coverImage: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  views: number;
}

export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: LeadStatus;
  createdAt: string; // ISO datetime string
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
  visible: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  results: string[];
  visible: boolean;
}

export interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  color: string;
  visible: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  visible: boolean;
}

export interface ResetToken {
  token: string;
  createdAt: string;
  expiresAt: string;
}
