export function cleanAIJSON(text: string): string {
  // Remove markdown code fences if present (e.g., ```json or ```)
  return text.replace(/```(?:json|JSON)?\n?|```\n?/g, "").trim();
}

export async function generateWithAI(prompt: string, json: boolean = false): Promise<string> {
  const body: any = {
    model: 'openrouter/free',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  };

  if (json) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nexus-ai.com',
      'X-Title': 'Nexus AI Admin Panel',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let errorMessage = "AI service error";
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || errorMessage;
      if (response.status === 429) {
        errorMessage = "The AI model is currently busy (rate-limited). Please wait a moment or try again later.";
      }
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("AI returned an empty or invalid response");
  }
  return data.choices[0].message.content.trim();
}
