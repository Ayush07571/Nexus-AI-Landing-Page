"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, AlertCircle, Tag, X, Sparkles, Wand2, Search, Check, Info, Plus } from "lucide-react";
import { Blog, BlogStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useAIMode } from "@/hooks/useAIMode";
import { AIToggle } from "@/components/admin/AIToggle";
import { Button } from "@/components/ui/button";
import "@uiw/react-md-editor/markdown-editor.css";

// Dynamic import to avoid SSR issues with the markdown editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogFormProps {
  initialData?: Blog;
  mode: "create" | "edit";
}

interface SEOAnalysis {
  metaDescription: string;
  suggestedTags: string[];
  titleSuggestion: string;
  score: number;
  tips: string[];
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

  // AI Mode
  const { aiMode, toggleAIMode } = useAIMode();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isGettingSEO, setIsGettingSEO] = useState(false);
  const [aiTone, setAiTone] = useState<"professional" | "casual" | "technical">("professional");
  const [improvementInstruction, setImprovementInstruction] = useState("");
  const [showImprovementInput, setShowImprovementInput] = useState(false);
  const [seoData, setSeoData] = useState<SEOAnalysis | null>(null);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showAiStatus = (message: string, type: "success" | "error") => {
    setAiStatus({ message, type });
    setTimeout(() => setAiStatus(null), 5000);
  };

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

  const handleGenerate = async () => {
    if (!title) {
      showAiStatus("Please enter a title first", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", data: { title, tone: aiTone } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      if (!data) throw new Error("No data received from AI");
      setExcerpt(data.excerpt);
      setContent(data.content);
      setTags(data.tags);
      setCategory(data.category);
      showAiStatus("Content generated!", "success");
    } catch (err) {
      showAiStatus(err instanceof Error ? err.message : "AI generation failed. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (!content || !improvementInstruction) return;
    setIsImproving(true);
    try {
      const res = await fetch("/api/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "improve", data: { content, instruction: improvementInstruction } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Improvement failed");
      if (!data) throw new Error("No data received from AI");
      setContent(data.content);
      setShowImprovementInput(false);
      setImprovementInstruction("");
      showAiStatus("Content improved!", "success");
    } catch (err) {
      showAiStatus(err instanceof Error ? err.message : "AI improvement failed. Please try again.", "error");
    } finally {
      setIsImproving(false);
    }
  };

  const handleGetSEO = async () => {
    if (!title || !content) {
      showAiStatus("Title and content are required for SEO analysis", "error");
      return;
    }
    setIsGettingSEO(true);
    try {
      const res = await fetch("/api/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seo", data: { title, content } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "SEO analysis failed");
      if (!data) throw new Error("No data received from AI");
      setSeoData(data);
      setShowSeoPanel(true);
    } catch (err) {
      showAiStatus(err instanceof Error ? err.message : "SEO analysis failed. Please try again.", "error");
    } finally {
      setIsGettingSEO(false);
    }
  };

  const fieldClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1" />
        <AIToggle aiMode={aiMode} onToggle={toggleAIMode} />
      </div>

      {aiStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-medium",
            aiStatus.type === "success" 
              ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
              : "bg-destructive/10 border-destructive/20 text-destructive"
          )}
        >
          {aiStatus.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {aiStatus.message}
        </motion.div>
      )}
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

        {/* AI Tone & Generate */}
        {aiMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:col-span-2 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">AI Generation Tone:</span>
                <div className="flex bg-muted p-1 rounded-xl">
                  {(["professional", "casual", "technical"] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setAiTone(tone)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all",
                        aiTone === tone 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !title}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white gap-2 h-10 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Full Post
              </Button>
            </div>
          </motion.div>
        )}

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
          {aiMode && (
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isGettingSEO || !title || !content}
                onClick={handleGetSEO}
                className="gap-2 text-blue-500 border-blue-500/20 hover:bg-blue-500/5 rounded-xl"
              >
                {isGettingSEO ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Get SEO Suggestions
              </Button>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>
            Status
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (Only &quot;Published&quot; posts appear on the home page)
            </span>
          </label>
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
          {aiMode && (
            <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground ml-2">AI Content Tools</span>
              <div className="relative">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImprovementInput(!showImprovementInput)}
                  className="gap-2 text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-lg h-8"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Improve Content
                </Button>
                
                <AnimatePresence>
                  {showImprovementInput && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-72 p-4 bg-card border border-border rounded-xl shadow-2xl z-50 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-foreground">Improvement Instruction</h4>
                      <textarea
                        value={improvementInstruction}
                        onChange={(e) => setImprovementInstruction(e.target.value)}
                        placeholder="e.g. Make it more persuasive, add more technical details, or fix grammar..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background resize-none h-20 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="xs"
                          className="flex-1 bg-purple-600 text-white hover:bg-purple-500"
                          onClick={handleImprove}
                          disabled={isImproving || !improvementInstruction}
                        >
                          {isImproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply Improvement"}
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => setShowImprovementInput(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? "")}
            height={400}
            preview="live"
          />
        </div>

        {/* SEO Side Panel */}
        <AnimatePresence>
          {showSeoPanel && seoData && (
            <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSeoPanel(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-foreground">SEO Suggestions</h3>
                  </div>
                  <button
                    onClick={() => setShowSeoPanel(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Score */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-500/20 relative">
                      <span className="text-3xl font-bold text-blue-600">{seoData.score}</span>
                      <span className="text-[10px] absolute -bottom-2 px-2 py-0.5 bg-blue-500 text-white rounded-full font-bold">SCORE</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">Nexus AI SEO Analysis Score</p>
                  </div>

                  {/* Title Suggestion */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Info className="w-4 h-4 text-blue-500" />
                      <h4>Title Suggestion</h4>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border group relative">
                      <p className="text-sm text-foreground pr-8">{seoData.titleSuggestion}</p>
                      <button 
                        onClick={() => { if (seoData) { setTitle(seoData.titleSuggestion); showAiStatus("Title updated!", "success"); } }}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                        title="Use this title"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Info className="w-4 h-4 text-blue-500" />
                      <h4>Meta Description</h4>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border group relative">
                      <p className="text-xs text-muted-foreground pr-8 italic">&quot;{seoData.metaDescription}&quot;</p>
                      <button 
                        onClick={() => { if (seoData) { setExcerpt(seoData.metaDescription); showAiStatus("Excerpt updated!", "success"); } }}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                        title="Use as excerpt"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Suggested Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <h4>Suggested Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seoData.suggestedTags.map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!tags.includes(tag)) {
                              setTags([...tags, tag]);
                              showAiStatus(`Added tag: ${tag}`, "success");
                            }
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                            tags.includes(tag) 
                              ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20"
                          )}
                        >
                          {tags.includes(tag) ? <Check className="w-3 h-3 inline mr-1" /> : <Plus className="w-3 h-3 inline mr-1" />}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-3 pb-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <h4>Optimization Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      {seoData.tips.map((tip: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-purple-500 font-bold shrink-0">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => setShowSeoPanel(false)}
                  >
                    Close Analysis
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
