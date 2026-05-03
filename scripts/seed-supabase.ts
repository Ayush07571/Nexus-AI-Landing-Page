import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
  console.error('❌ Error: Missing Supabase environment variables in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function seedTable<T = unknown, U = Record<string, unknown>>(
  tableName: string,
  filePath: string,
  mapper?: (data: T) => U
) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      console.warn(`⚠️ Warning: File ${filePath} not found, skipping table ${tableName}.`);
      return;
    }

    const rawData = await fs.readFile(fullPath, 'utf-8');
    let data = JSON.parse(rawData);

    // If data is an object with a nested array (like pricing.json -> plans)
    if (!Array.isArray(data) && data.plans) {
      data = data.plans;
    }

    if (mapper) {
      data = Array.isArray(data) ? data.map(mapper) : mapper(data);
    }

    if (Array.isArray(data)) {
      console.log(`⏳ Seeding ${data.length} records into ${tableName}...`);
      const { error } = await supabaseAdmin.from(tableName).upsert(data, { onConflict: 'id' });
      if (error) throw error;
    } else {
      console.log(`⏳ Seeding 1 record into ${tableName}...`);
      const { error } = await supabaseAdmin.from(tableName).upsert(data, { onConflict: 'id' });
      if (error) throw error;
    }

    console.log(`✅ Successfully seeded ${tableName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error seeding ${tableName}:`, message);
  }
}

async function seedAnalytics() {
  try {
    const filePath = 'data/analytics.json';
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      await fs.access(fullPath);
    } catch {
      console.warn(`⚠️ Warning: File ${filePath} not found, skipping analytics.`);
      return;
    }

    const rawData = await fs.readFile(fullPath, 'utf-8');
    const data = JSON.parse(rawData);

    if (data.dailyVisits && Array.isArray(data.dailyVisits)) {
      console.log(`⏳ Seeding ${data.dailyVisits.length} daily visits into analytics...`);
      const { error } = await supabaseAdmin.from('analytics').upsert(
        data.dailyVisits.map((v: { date: string; count: number }) => ({
          date: v.date,
          count: v.count
        })),
        { onConflict: 'date' }
      );
      if (error) throw error;
      console.log(`✅ Successfully seeded analytics`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error seeding analytics:`, message);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Seeding...');

  // 1. Blogs
  await seedTable('blogs', 'data/blogs.json', (blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    author: blog.author,
    status: blog.status,
    category: blog.category,
    tags: blog.tags,
    cover_image: blog.coverImage,
    views: blog.views || 0,
    created_at: blog.createdAt,
    updated_at: blog.updatedAt
  }));

  // 2. Pricing
  await seedTable('pricing', 'data/pricing.json', (plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthly_price: plan.monthlyPrice,
    annual_price: plan.annualPrice,
    badge: plan.badge,
    highlighted: plan.highlighted,
    cta: plan.cta,
    features: plan.features,
    sort_order: 0 // Default order
  }));

  // 3. Leads
  await seedTable('leads', 'data/leads.json', (lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    company: lead.company,
    message: lead.message,
    status: lead.status,
    created_at: lead.createdAt
  }));

  // 4. Features
  await seedTable('features', 'data/features.json', (feature) => ({
    id: feature.id,
    title: feature.title,
    description: feature.description,
    icon: feature.icon,
    visible: feature.visible,
    sort_order: 0
  }));

  // 5. Testimonials
  await seedTable('testimonials', 'data/testimonials.json', (t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    company: t.company,
    avatar: t.avatar,
    quote: t.quote,
    rating: t.rating,
    results: t.results,
    visible: t.visible
  }));

  // 6. Integrations
  await seedTable('integrations', 'data/integrations.json', (i) => ({
    id: i.id,
    name: i.name,
    logo: i.logo,
    category: i.category,
    description: i.description,
    color: i.color,
    visible: i.visible
  }));

  // 7. FAQ
  await seedTable('faq', 'data/faq.json', (faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    visible: faq.visible,
    sort_order: faq.order
  }));

  // 8. Analytics
  await seedAnalytics();

  console.log('🏁 Seeding Complete!');
}

main();
