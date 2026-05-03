import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blog } from "@/types";
import { Calendar, Clock, Tag, ArrowLeft, Eye } from "lucide-react";
import { ThemeProvider } from "@/components/ui/providers";

async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Blog>;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Blog Post Not Found — Nexus AI" };
  return {
    title: `${blog.title} — Nexus AI Blog`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "published") notFound();

  function readingTime(content: string): number {
    return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
  }

  // Simple markdown → HTML (headings, paragraphs, bold, code blocks)
  function renderMarkdown(md: string): string {
    return md
      // Code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.slice(3, -3).replace(/^[a-z]*\n/, "");
        return `<pre class="bg-muted/60 rounded-xl p-4 overflow-x-auto text-sm my-4"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
      })
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-foreground mt-8 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-foreground mt-12 mb-4">$1</h1>')
      // Bold / italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Unordered list items
      .replace(/^- (.+)$/gm, '<li class="flex gap-2 items-start"><span class="text-blue-500 mt-1.5 shrink-0">•</span><span>$1</span></li>')
      // Ordered list items
      .replace(/^\d+\. (.+)$/gm, '<li class="flex gap-2 items-start"><span class="text-blue-500 font-semibold shrink-0">—</span><span>$1</span></li>')
      // Paragraphs (double newline)
      .replace(/\n\n(?!<)/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')
      .replace(/^(?!<)/, '<p class="text-muted-foreground leading-relaxed mb-4">')
      // Wrap li in ul
      .replace(/(<li .+<\/li>\n?)+/g, '<ul class="space-y-2 my-4 pl-2">$&</ul>');
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        {blog.coverImage && (
          <div className="relative h-72 sm:h-96 overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {blog.category && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium">
                {blog.category}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTime(blog.content)} min read
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {blog.views.toLocaleString()} views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{blog.excerpt}</p>

          {/* Author */}
          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {blog.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{blog.author}</p>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
          />

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Back CTA */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              More Articles
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
