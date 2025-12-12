// src/pages/api/askcoach.ts
import type { APIRoute } from 'astro';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateObject } from 'ai';
import { z } from 'zod';

const CoachSchema = z.object({
  score: z.number().min(0).max(10),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  suggestedRewrite: z.string(),
});

const DEEPSEEK_API_KEY =
  import.meta.env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY;

const deepseek = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY || '',
});

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  if (!raw) {
    return new Response(JSON.stringify({ error: 'Empty body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { scenarioId, scenarioText, ask } = payload ?? {};

  if (!scenarioId || !ask) {
    return new Response(
      JSON.stringify({ error: 'scenarioId and ask are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const scenarioDescription =
    scenarioText && typeof scenarioText === 'string'
      ? scenarioText
      : `Scenario ID: ${scenarioId}`;

  const prompt = `
You are an "Asking Coach" for first-time entrepreneurs.

Use the "Art of Asking" principles:
- Know the exact, specific ask.
- Be clear, specific, and direct about what is requested, how much time/effort it takes, and by when.
- Explain briefly why the ask matters (the purpose/impact).
- Respect the other person's time and context.
- Avoid vague "pick your brain" or open-ended mentorship asks.
- Be kind, appreciative, and easy to say a confident yes to.

Scenario description:
"""${scenarioDescription}"""

User Ask (as written by the user):
"""${ask}"""

Your job:
1. Evaluate ONLY the quality of the ask (clarity, specificity, feasibility, respect for time, kindness), not whether the idea/startup is “good”.
2. Give concise, practical feedback.

Return JSON with:
- score: number from 0 to 10 (0 = terrible ask, 10 = excellent ask).
- summary: one short sentence summarising how good this ask is.
- strengths: 2–4 bullet points of what the user did well.
- improvements: 2–4 bullet points with specific, actionable suggestions to make the ask stronger.
- suggestedRewrite: a single improved version of the ask, written as a short message/email (2–5 sentences), clear, specific, respectful of time, and following the Art of Asking principles.
`;

  const { object } = await generateObject({
    model: deepseek('deepseek-chat'),
    schema: CoachSchema,
    prompt,
  });

  return new Response(JSON.stringify(object), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
