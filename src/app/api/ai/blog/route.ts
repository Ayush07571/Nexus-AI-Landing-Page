import { NextRequest, NextResponse } from "next/server";
import { generateWithAI, cleanAIJSON } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    if (action === "generate") {
      const { title, tone } = data;
      const prompt = `
  You are a content writer for Nexus AI, an AI-powered productivity platform.
  Write a complete blog post for the following title: "${title}"
  Tone: ${tone}
  
  Return a JSON object with exactly these fields:
  {
    "excerpt": "A compelling 2-sentence summary (max 160 chars)",
    "content": "Full blog post in markdown format (600-900 words)",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "One of: Product, Tips, News, Case Study, Tutorial"
  }
  Return only valid JSON. No markdown code fences. No extra text.`;

      const response = await generateWithAI(prompt, true);
      return NextResponse.json(JSON.parse(cleanAIJSON(response)));
    }

    if (action === "improve") {
      const { content, instruction } = data;
      const prompt = `
  You are editing a blog post for Nexus AI, an AI productivity platform.
  Instruction: ${instruction}
  
  Rewrite the following content following the instruction. Keep it in markdown. Return only the improved content, no explanations.
  
  Content:
  ${content}`;

      const response = await generateWithAI(prompt, false);
      return NextResponse.json({ content: response });
    }

    if (action === "seo") {
      const { title, content } = data;
      const prompt = `
  Analyze this blog post for Nexus AI and return SEO suggestions.
  Title: ${title}
  Content: ${content}
  
  Return a JSON object:
  {
    "metaDescription": "SEO meta description under 160 chars",
    "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "titleSuggestion": "Improved SEO title if needed, or same title if fine",
    "score": 85,
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  }
  Return only valid JSON. No markdown code fences.`;

      const response = await generateWithAI(prompt, true);
      return NextResponse.json(JSON.parse(cleanAIJSON(response)));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI Blog Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI generation failed" }, { status: 500 });
  }
}
