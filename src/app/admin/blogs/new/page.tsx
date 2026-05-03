import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Create New Blog Post</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Write and publish a new blog post to the Nexus AI site.
        </p>
      </div>
      <BlogForm mode="create" />
    </div>
  );
}
