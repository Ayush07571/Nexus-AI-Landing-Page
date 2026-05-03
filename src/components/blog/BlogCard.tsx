import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/types";
import { Calendar, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  blog: Blog;
  variant?: "default" | "compact";
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogCard({ blog, variant = "default" }: BlogCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/blog/${blog.slug}`} className="group">
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          {blog.coverImage && (
            <div className="relative h-40 overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              {blog.category && (
                <span className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full bg-blue-600 text-white font-medium">
                  {blog.category}
                </span>
              )}
            </div>
          )}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-blue-500 transition-colors line-clamp-2 mb-2">
              {blog.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{blog.excerpt}</p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime(blog.content)} min read
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${blog.slug}`} className="group">
      <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Cover */}
        {blog.coverImage && (
          <div className="relative h-52 overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          {/* Category + Read time */}
          <div className="flex items-center gap-2 mb-3">
            {blog.category && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium">
                {blog.category}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime(blog.content)} min read
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-foreground group-hover:text-blue-500 transition-colors line-clamp-2 mb-2 leading-snug">
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{blog.excerpt}</p>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {blog.author.charAt(0)}
              </div>
              <span className="text-xs font-medium text-foreground">{blog.author}</span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
