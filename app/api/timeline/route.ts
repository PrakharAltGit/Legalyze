import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const OLLAMA_URL = (process.env.OLLAMA_URL || 'https://chastity-operative-purifier.ngrok-free.dev').replace(/\/$/, '');
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

async function ollamaRequest(body: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  return response.text();
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const truncatedText = text.length > 10000
      ? text.substring(0, 10000) + '\n\n[Document truncated...]'
      : text;

    const prompt = `You are a legal case analyst. Extract all chronological events from this legal document and build a complete timeline of the case.

For each event, extract:
1. The date (as specific as possible — day/month/year if available, otherwise month/year or just year)
2. A short title for the event (e.g. "Crime Occurred", "FIR Filed", "Arrest Made", "Bail Hearing", "Trial Begins", "Witness Examined", "Verdict Pronounced", etc.)
3. A brief description of what happened (2-3 sentences max)
4. The category: one of: incident | filing | hearing | evidence | verdict | other

Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks. Just raw JSON like this:
[
  {
    "date": "15 March 1995",
    "title": "Crime Occurred",
    "description": "The alleged crime took place at the specified location. The victim filed a complaint the same day.",
    "category": "incident"
  },
  {
    "date": "20 March 1995",
    "title": "FIR Registered",
    "description": "A First Information Report was registered at the local police station.",
    "category": "filing"
  }
]

If you cannot find a specific date, use your best estimate from context (e.g. "circa 1995" or "Early 1996").
Extract ALL events you can find — aim for 5 to 12 events covering the full arc of the case.

Document:
${truncatedText}`;

    const requestBody = JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 2048,
      },
    });

    let rawResponse: string;
    try {
      rawResponse = await ollamaRequest(requestBody);
    } catch (err: any) {
      if (err.message === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Cannot connect to Ollama. Make sure it is running: run "ollama serve" in your terminal.' },
          { status: 503 }
        );
      }
      if (err.message === 'TIMEOUT') {
        return NextResponse.json(
          { error: 'Ollama timed out. Try again.' },
          { status: 504 }
        );
      }
      throw err;
    }

    const data = JSON.parse(rawResponse);
    let raw: string = data.response || '';

    // Strip markdown fences if model adds them
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse timeline from AI response. Try again.' },
        { status: 422 }
      );
    }

    const events = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'No timeline events found in document.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ events });

  } catch (error: any) {
    console.error('Timeline error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate timeline.' },
      { status: 500 }
    );
  }
}
