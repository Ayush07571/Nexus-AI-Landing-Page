"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";
import { Blog } from "@/types";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json() as Blog;
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
        <AlertCircle className="w-4 h-4" />
        {error ?? "Blog not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Edit Blog Post</h2>
        <p className="text-sm text-muted-foreground mt-1 truncate">{blog.title}</p>
      </div>
      <BlogForm mode="edit" initialData={blog} />
    </div>
  );
}
