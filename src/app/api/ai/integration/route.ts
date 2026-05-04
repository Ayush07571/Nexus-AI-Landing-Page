import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { name, category } = await req.json();

    const prompt = `
  Write a short integration description for the Nexus AI platform.
  
  Integration name: ${name}
  Category: ${category}
  
  Write 1-2 sentences explaining what this integration does and the benefit it provides to Nexus AI users. Be specific to the actual tool named. Keep it under 120 characters.
  
  Return only the description text. No JSON. No extra formatting.`;

    const response = await generateWithAI(prompt, false);
    return NextResponse.json({ description: response });
  } catch (error) {
    console.error("AI Integration Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
