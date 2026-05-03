import { Blog, PricingPlan, Lead, Feature, Testimonial, Integration, FAQItem } from "@/types";

export function mapBlog(row: any): Blog {
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

export function mapPricing(row: any): PricingPlan {
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

export function mapLead(row: any): Lead {
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

export function mapFeature(row: any): Feature {
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

export function mapTestimonial(row: any): Testimonial {
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

export function mapIntegration(row: any): Integration {
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

export function mapFAQ(row: any): FAQItem {
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
