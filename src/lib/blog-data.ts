import { supabaseAdmin } from '@/lib/supabase';
import { mapBlog } from '@/lib/mappings';
import { Blog } from '@/types';

export async function getPublishedBlogs(): Promise<Blog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapBlog);
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return mapBlog(data);
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    return null;
  }
}
