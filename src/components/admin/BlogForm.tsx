"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Save, Loader2, AlertCircle, Tag, X } from "lucide-react";
import { Blog, BlogStatus } from "@/types";
import { cn } from "@/lib/utils";
import "@uiw/react-md-editor/markdown-editor.css";

// Dynamic import to avoid SSR issues with the markdown editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogFormProps {
  initialData?: Blog;
  mode: "create" | "edit";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogForm({ initialData, mode }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [author, setAuthor] = useState(initialData?.author ?? "Admin");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [status, setStatus] = useState<BlogStatus>(initialData?.status ?? "draft");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, mode]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim().replace(/,$/, "");
      if (t && !tags.includes(t)) {
        setTags([...tags, t]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Partial<Blog> = {
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        coverImage,
        status,
        tags,
      };

      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/blogs/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save blog");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/blogs"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-sm border border-green-500/20"
        >
          ✓ Blog saved! Redirecting...
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Your blog post title"
            className={fieldClass}
          />
        </div>

        {/* Slug */}
        <div className="md:col-span-2">
          <label htmlFor="slug" className={labelClass}>
            Slug <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (auto-generated, manually editable)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">/blog/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              required
              placeholder="your-blog-slug"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className={labelClass}>Author</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className={fieldClass}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. AI & Technology"
            className={fieldClass}
          />
        </div>

        {/* Cover Image */}
        <div className="md:col-span-2">
          <label htmlFor="coverImage" className={labelClass}>Cover Image URL</label>
          <input
            id="coverImage"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={fieldClass}
          />
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label htmlFor="tags" className={labelClass}>
            Tags
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              Press Enter or comma to add
            </span>
          </label>
          <div
            className={cn(
              "flex flex-wrap gap-2 min-h-[44px] px-3 py-2 rounded-xl border border-border bg-background transition-all",
              "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
            )}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "Add a tag..." : ""}
              className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-3">
            {(["draft", "published"] as BlogStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all",
                  status === s
                    ? s === "published"
                      ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                      : "border-yellow-500 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                    : "border-border text-muted-foreground hover:bg-muted/60"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className={labelClass}>Excerpt</label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Short description shown on blog cards..."
          className={cn(fieldClass, "resize-none")}
        />
      </div>

      {/* Content — Markdown Editor */}
      <div>
        <label className={labelClass}>
          Content <span className="text-red-500">*</span>
        </label>
        <div className="rounded-xl overflow-hidden border border-border" data-color-mode="auto">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? "")}
            height={400}
            preview="live"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !title || !slug || !content}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Blog" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
