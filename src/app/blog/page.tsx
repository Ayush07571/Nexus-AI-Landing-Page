import React from "react";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { Blog } from "@/types";
import { BookOpen, ArrowRight } from "lucide-react";
import { ThemeProvider } from "@/components/ui/providers";

async function getPublishedBlogs(): Promise<Blog[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blogs?status=published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json() as Promise<Blog[]>;
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Blog — Nexus AI",
  description:
    "Insights, tips, and deep dives on AI-powered productivity from the Nexus AI team.",
};

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-blue-600/10 via-purple-600/5 to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Nexus AI Blog
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Insights on{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI & Productivity
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep dives, how-to guides, and expert perspectives on the future of work —
              powered by AI.
            </p>
          </div>
          {/* decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No posts yet</h2>
              <p className="text-muted-foreground">Check back soon for new articles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Nexus AI
          </Link>
        </div>
      </div>
    </ThemeProvider>
  );
}
