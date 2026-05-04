import { NextRequest, NextResponse } from "next/server";
import { generateWithAI, cleanAIJSON } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { planName, targetAudience, monthlyPrice } = await req.json();

    const prompt = `
  Write pricing copy for a plan on Nexus AI (an AI productivity platform).
  
  Plan details:
  - Plan name: ${planName}
  - Target audience: ${targetAudience}
  - Monthly price: $${monthlyPrice}
  
  Return a JSON object:
  {
    "description": "One sentence plan description (max 100 chars)",
    "badge": "Short badge label like 'Most Popular' or 'Best Value' or null if not needed",
    "cta": "Call to action button text (max 20 chars)",
    "features": [
      "Feature bullet point 1",
      "Feature bullet point 2",
      "Feature bullet point 3",
      "Feature bullet point 4",
      "Feature bullet point 5"
    ]
  }
  Return only valid JSON. No markdown code fences.`;

    const response = await generateWithAI(prompt, true);
    return NextResponse.json(JSON.parse(cleanAIJSON(response)));
  } catch (error) {
    console.error("AI Pricing Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
