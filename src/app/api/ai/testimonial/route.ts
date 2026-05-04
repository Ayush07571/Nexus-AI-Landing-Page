import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { name, company, role, productUsed, outcome } = await req.json();

    const prompt = `
  Write a genuine-sounding customer testimonial for Nexus AI, an AI productivity platform.
  
  Customer details:
  - Name: ${name}
  - Role: ${role} at ${company}
  - Product/feature used: ${productUsed}
  - Outcome/benefit they experienced: ${outcome}
  
  Return a JSON object:
  {
    "quote": "The testimonial (2-4 sentences, first person, specific and believable, no generic praise)",
    "rating": 5
  }
  Return only valid JSON. No markdown code fences.`;

    const response = await generateWithAI(prompt);
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error("AI Testimonial Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
