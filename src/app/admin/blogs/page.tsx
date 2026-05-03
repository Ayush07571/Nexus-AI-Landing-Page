"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Blog } from "@/types";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: Blog["status"] }) {
  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium",
        status === "published"
          ? "bg-green-500/15 text-green-600 dark:text-green-400"
          : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
      )}
    >
      {status}
    </span>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    try {
      const res = await fetch("/api/blogs");
      if (!res.ok) throw new Error("Failed to load blogs");
      const data = await res.json() as Blog[];
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeletingId(blog.id);
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    } catch {
      alert("Failed to delete blog. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    setTogglingId(blog.id);
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json() as Blog;
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updated : b)));
    } catch {
      alert("Failed to update blog status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Blog Management</h2>
          <p className="text-sm text-muted-foreground">{blogs.length} total posts</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          New Blog
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">{search ? "No blogs match your search" : "No blogs yet"}</p>
          {!search && (
            <Link
              href="/admin/blogs/new"
              className="mt-3 text-blue-500 text-sm hover:underline"
            >
              Create your first blog post
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((blog, i) => (
                  <motion.tr
                    key={blog.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                        <p className="text-xs text-muted-foreground truncate">/{blog.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{blog.category}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={blog.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{blog.views.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Publish Toggle */}
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          disabled={togglingId === blog.id}
                          title={blog.status === "published" ? "Unpublish" : "Publish"}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          {togglingId === blog.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : blog.status === "published" ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-blue-500"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(blog)}
                          disabled={deletingId === blog.id}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50"
                        >
                          {deletingId === blog.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((blog) => (
              <div key={blog.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{blog.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{blog.category}</p>
                  </div>
                  <StatusBadge status={blog.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{blog.views} views</span>
                  <span>•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(blog)}
                    disabled={togglingId === blog.id}
                    className="flex-1 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {togglingId === blog.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : blog.status === "published" ? (
                      <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /> Publish</>
                    )}
                  </button>
                  <Link
                    href={`/admin/blogs/${blog.id}/edit`}
                    className="flex-1 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog)}
                    disabled={deletingId === blog.id}
                    className="flex-1 py-2 rounded-lg border border-red-500/30 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deletingId === blog.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
