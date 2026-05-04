import { NextRequest, NextResponse } from "next/server";
import { generateWithAI, cleanAIJSON } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { description, count = 5 } = await req.json();

    const prompt = `
  Generate ${count} frequently asked questions with answers for Nexus AI based on this description:
  "${description}"
  
  Nexus AI is an AI-powered productivity platform for teams.
  
  Return a JSON array:
  [
    { "question": "Question here?", "answer": "Detailed answer here." },
    ...
  ]
  Return only valid JSON array. No markdown code fences. No extra text.`;

    const response = await generateWithAI(prompt, true);
    return NextResponse.json(JSON.parse(cleanAIJSON(response)));
  } catch (error) {
    console.error("AI FAQ Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
