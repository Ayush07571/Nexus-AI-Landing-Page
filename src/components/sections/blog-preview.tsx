"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Blog } from "@/types";
import { BlogCard } from "@/components/blog/BlogCard";
import { cn } from "@/lib/utils";

interface BlogPreviewProps {
  className?: string;
}

export function BlogPreview({ className }: BlogPreviewProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs?status=published")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data.slice(0, 3));
        } else {
          console.error("Blogs API returned non-array data:", data);
          setBlogs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch blogs:", err);
        setBlogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Don't render section at all if no blogs
  if (!loading && blogs.length === 0) return null;

  return (
    <section id="blog" className={cn("py-20 bg-background", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            From the Blog
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Insights & Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical tips, deep dives, and the latest thinking on AI-powered productivity.
          </p>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <BlogCard blog={blog} variant="compact" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All CTA */}
        {!loading && blogs.length > 0 && (
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-sm font-semibold text-foreground hover:border-blue-500 hover:text-blue-500 transition-all duration-200 group"
            >
              View All Articles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default BlogPreview;
