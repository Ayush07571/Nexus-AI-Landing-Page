import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { stats } = await req.json();
    const { totalVisits, weekVisits, totalLeads, conversionRate, topDays, leadStatus } = stats;

    const prompt = `
  You are an analytics assistant for Nexus AI admin panel.
  
  Here is the current analytics data:
  - Total visits: ${totalVisits}
  - Visits this week: ${weekVisits}
  - Total leads: ${totalLeads}
  - Conversion rate: ${conversionRate}%
  - Lead Status Breakdown: New: ${leadStatus.new}, Contacted: ${leadStatus.contacted}, Closed: ${leadStatus.closed}
  
  Write a short, insightful summary (3-4 sentences) highlighting what's going well, what needs attention, and one actionable recommendation. Be specific and data-driven. Do not use bullet points — write in natural flowing sentences.
  
  Return only the summary text. No JSON.`;

    const response = await generateWithAI(prompt, false);
    return NextResponse.json({ summary: response });
  } catch (error) {
    console.error("AI Analytics Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
