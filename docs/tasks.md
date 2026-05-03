# Nexus AI — Admin Panel Implementation Tasks

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Shadcn/ui · JSON + API Routes  
**Approach:** JSON files as database, Next.js API Routes as backend, no external server needed

---

## Phase 1 — Data Layer (JSON Files)

Create a `/data` folder at the root of the project with these files:

- [ ] `data/blogs.json` — array of blog post objects
- [ ] `data/pricing.json` — pricing plans array
- [ ] `data/leads.json` — contact form submissions array
- [ ] `data/analytics.json` — visitor counts, lead counts, timestamps

Each JSON file acts as your database table. API routes will read/write to them server-side.

---

## Phase 2 — API Routes

Create under `src/app/api/`:

### Blogs

- [ ] `api/blogs/route.ts` — GET (list all, support `?status=published` filter), POST (create new)
- [ ] `api/blogs/[id]/route.ts` — GET (single by id), PUT (update), DELETE

### Pricing

- [ ] `api/pricing/route.ts` — GET (fetch plans), PUT (update plans)

### Leads / Contact

- [ ] `api/leads/route.ts` — GET (list all for admin), POST (new submission from contact form)
- [ ] `api/leads/[id]/route.ts` — PUT (update lead status only — New / Contacted / Closed)

### Analytics

- [ ] `api/analytics/route.ts` — GET (fetch stats), POST (increment today's visit count)

> **Note:** All file reads/writes use Node.js `fs/promises` module inside API routes — this runs server-side only, never exposed to the client. Wrap every operation in try/catch with proper HTTP status codes.

---

## Phase 2.5 — TypeScript Types

- [ ] Create `src/types/index.ts` with interfaces: `Blog`, `PricingPlan`, `PricingData`, `Lead`, `Analytics`, `DailyVisit`
- [ ] Import and use these types in all new API routes and page components — no `any` types

---

## Phase 3 — Landing Page Sections (Make Data-Driven)

Replace hardcoded data in these sections with `fetch()` calls to the API routes:

- [ ] `sections/pricing.tsx` — fetch from `/api/pricing` instead of hardcoded plans
- [ ] Add new `sections/blog-preview.tsx` — fetch latest 3 posts from `/api/blogs`
- [ ] `app/page.tsx` — add `<BlogPreview />` section between FAQ and Contact (or after Features)
- [ ] `app/page.tsx` — add analytics hit on page load via `fetch('/api/analytics', { method: 'POST' })`

> **Rendering strategy:** Use ISR (`export const revalidate = 60`) on the home page so it auto-refreshes every 60 seconds after an admin change. No manual rebuild needed.

---

## Phase 4 — Blog Public Page

Create a public-facing blog section:

- [ ] `app/blog/page.tsx` — lists all published blog posts (fetches `/api/blogs?status=published`)
- [ ] `app/blog/[slug]/page.tsx` — individual blog post page
- [ ] `src/components/blog/BlogCard.tsx` — reusable card component used in listing + preview section

---

## Phase 5 — Admin Panel Pages

Create under `src/app/admin/`:

### Layout & Auth Guard

- [ ] `app/admin/layout.tsx` — shared sidebar layout for all admin pages
- [ ] `src/middleware.ts` — protect all `/admin/*` routes at the edge using Next.js middleware; check for `admin_auth` cookie and redirect to `/admin/login` if missing (more secure than checking only in layout)
- [ ] Add a simple password check (env variable `ADMIN_PASSWORD`) — redirect to `/admin/login` if not authenticated
- [ ] `app/admin/login/page.tsx` — simple login form, compare input against `ADMIN_PASSWORD` env var, set `admin_auth` cookie on success
- [ ] Add a **Logout** button in the sidebar that clears the `admin_auth` cookie and redirects to `/admin/login`

### Dashboard (Home)

- [ ] `app/admin/page.tsx` — overview cards: total blogs, total leads, visitor count, conversion rate
- [ ] Fetch data from `/api/analytics` and `/api/leads` to populate cards

### Blog Management

- [ ] `app/admin/blogs/page.tsx` — table of all blogs with Edit / Delete / Publish toggle actions
- [ ] `app/admin/blogs/new/page.tsx` — create new blog form (title, slug auto-generated from title but editable, excerpt, content, category, tags, cover image URL, status)
- [ ] `app/admin/blogs/[id]/edit/page.tsx` — edit existing blog (pre-filled form)
- [ ] Install `@uiw/react-md-editor` for the content field: `npm install @uiw/react-md-editor` — gives a split markdown editor + preview panel
- [ ] Slug auto-generation: convert title to lowercase-hyphenated format on input, but keep it editable
- [ ] Validate slug uniqueness on create (check against existing blogs before saving)

### Pricing Management

- [ ] `app/admin/pricing/page.tsx` — editable cards for each plan (name, price, features list, badge, CTA)
- [ ] Inline editing — click a field to edit, Save button calls PUT `/api/pricing`
- [ ] Changes reflect on the landing page within 60 seconds (ISR revalidation)

### Leads / Contact Submissions

- [ ] `app/admin/leads/page.tsx` — table showing all contact form submissions
- [ ] Columns: Name, Email, Company, Message, Date, Status (New / Contacted / Closed)
- [ ] Status dropdown to update lead status (writes back to `leads.json`)
- [ ] CSV export button (client-side, no API needed)
- [ ] Search + filter by status

### Analytics Dashboard

- [ ] `app/admin/analytics/page.tsx` — charts and stat cards
- [ ] Metrics: Total visitors, Visitors this week, Total leads, Conversion rate (leads/visitors)
- [ ] Use `recharts` (already available or install) for a simple line chart of daily visits
- [ ] Source breakdown: how many leads came via contact form

---

## Phase 6 — Navbar Updates

Edit `src/components/ui/navbar.tsx`:

- [ ] Add **"Blog"** link in the main nav items pointing to `/blog`
- [ ] Add **"Admin"** button (styled differently — outlined or small badge style) pointing to `/admin`
- [ ] Admin button should be subtle (not a primary CTA) — e.g., a small ghost button on the far right
- [ ] Make sure both links are included in the mobile menu drawer too

---

## Phase 7 — Contact Form Wiring

Edit the existing contact section form:

- [ ] On form submit, POST `{ name, email, company, message }` to `/api/leads`
- [ ] Show success toast / message after submission
- [ ] The submission auto-appears in the Admin → Leads panel

---

## Phase 8 — Deployment Consideration

- [ ] **Local / Railway / Render:** JSON file approach works as-is, no changes needed
- [ ] **Vercel:** Filesystem is read-only at runtime. Swap `fs.writeFile` calls with **Vercel KV** (free Redis). Only the write functions in API routes need updating — the rest of the code stays the same.
- [ ] Add `ADMIN_PASSWORD` to `.env.local` (and to Vercel environment variables if deploying there)

---

## File Structure After All Changes

```
src/
├── app/
│   ├── page.tsx                          ← add BlogPreview, analytics hit, revalidate = 60
│   ├── blog/
│   │   ├── page.tsx                      ← public blog listing
│   │   └── [slug]/page.tsx               ← individual post
│   └── admin/
│       ├── layout.tsx                    ← sidebar layout + auth guard
│       ├── login/page.tsx
│       ├── page.tsx                      ← dashboard
│       ├── blogs/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── pricing/page.tsx
│       ├── leads/page.tsx
│       └── analytics/page.tsx
├── app/api/
│   ├── blogs/route.ts
│   ├── blogs/[id]/route.ts
│   ├── pricing/route.ts
│   ├── leads/route.ts
│   ├── leads/[id]/route.ts               ← update lead status
│   └── analytics/route.ts
├── components/
│   ├── sections/
│   │   └── blog-preview.tsx              ← new
│   ├── blog/
│   │   └── BlogCard.tsx                  ← new
│   └── ui/
│       └── navbar.tsx                    ← updated (Blog link + Admin button)
├── middleware.ts                         ← new: protects /admin/* routes
├── types/
│   └── index.ts                          ← new: Blog, Lead, PricingPlan, Analytics interfaces
data/
├── blogs.json
├── pricing.json
├── leads.json
└── analytics.json
```

---

## Quick Reference — JSON Shapes

```ts
// blogs.json
{ id, title, slug, excerpt, content, author, status, category, tags[], coverImage, createdAt, updatedAt, views }

// pricing.json
{ plans: [{ id, name, description, monthlyPrice, annualPrice, badge, highlighted, cta, features: [{ text, included }] }] }

// leads.json
{ id, name, email, company, message, status, createdAt }

// analytics.json
{ totalVisits, dailyVisits: [{ date, count }], totalLeads, lastUpdated }
```

---

## Order of Implementation (Recommended)

1. Phase 1 — Create JSON files with seed data
2. Phase 2 — Build all API routes and test with a REST client (Thunder Client / Postman)
3. Phase 7 — Wire contact form to `/api/leads` (quick win, tests the API)
4. Phase 5 — Build admin panel pages one by one (start with Leads, easiest to verify)
5. Phase 3 — Make landing page sections data-driven
6. Phase 4 — Build public blog pages
7. Phase 6 — Update navbar
8. Phase 8 — Deployment setup
