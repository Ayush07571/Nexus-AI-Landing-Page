import { NextRequest, NextResponse } from "next/server";
import { generateWithAI, cleanAIJSON } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { name, company, message, tone } = await req.json();

    const prompt = `
  Write a follow-up email reply to a lead who contacted Nexus AI (an AI productivity platform).
  
  Lead details:
  - Name: ${name}
  - Company: ${company}
  - Their message: "${message}"
  - Reply tone: ${tone}
  
  Return a JSON object:
  {
    "subject": "Email subject line",
    "body": "Full email body (no HTML, plain text, include greeting and sign-off as 'The Nexus AI Team')"
  }
  Return only valid JSON. No markdown code fences.`;

    const response = await generateWithAI(prompt, true);
    return NextResponse.json(JSON.parse(cleanAIJSON(response)));
  } catch (error) {
    console.error("AI Lead Reply Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
