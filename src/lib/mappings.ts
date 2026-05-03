import { Blog, PricingPlan, Lead, Feature, Testimonial, Integration, FAQItem } from "@/types";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: Blog["status"];
  category: string;
  tags: string[] | null;
  cover_image: string;
  views: number | null;
  created_at: string;
  updated_at: string;
}

export function mapBlog(data: unknown): Blog {
  const row = data as BlogRow;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    status: row.status,
    category: row.category,
    tags: row.tags || [],
    coverImage: row.cover_image,
    views: row.views || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface PricingRow {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  badge: string | null;
  highlighted: boolean;
  cta: string;
  features: PricingPlan["features"] | null;
}

export function mapPricing(data: unknown): PricingPlan {
  const row = data as PricingRow;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    monthlyPrice: Number(row.monthly_price),
    annualPrice: Number(row.annual_price),
    badge: row.badge,
    highlighted: row.highlighted,
    cta: row.cta,
    features: row.features || [],
  };
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: Lead["status"];
  created_at: string;
}

export function mapLead(data: unknown): Lead {
  const row = data as LeadRow;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

interface FeatureRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string | null;
  benefits: string[] | null;
  visible: boolean;
}

export function mapFeature(data: unknown): Feature {
  const row = data as FeatureRow;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    color: row.color || 'blue',
    benefits: row.benefits || [],
    visible: row.visible,
  };
}

interface TestimonialRow {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  results: string[] | null;
  visible: boolean;
}

export function mapTestimonial(data: unknown): Testimonial {
  const row = data as TestimonialRow;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    avatar: row.avatar,
    quote: row.quote,
    rating: row.rating,
    results: row.results || [],
    visible: row.visible,
  };
}

interface IntegrationRow {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  color: string | null;
  visible: boolean;
}

export function mapIntegration(data: unknown): Integration {
  const row = data as IntegrationRow;
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    category: row.category,
    description: row.description,
    color: row.color || 'gray',
    visible: row.visible,
  };
}

interface FAQRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  sort_order: number;
  visible: boolean;
}

export function mapFAQ(data: unknown): FAQItem {
  const row = data as FAQRow;
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || 'General',
    tags: row.tags || [],
    order: row.sort_order,
    visible: row.visible,
  };
}
