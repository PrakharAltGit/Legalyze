import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const OLLAMA_URL = (process.env.OLLAMA_URL || 'https://chastity-operative-purifier.ngrok-free.dev')
                    .replace(/\/$/, '');

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

    const prompt = `You are a legal analyst specializing in Indian law. Extract every legal section, act, and provision mentioned or applied in this case document.

For each section found, extract:
1. "section" — the section number and act name (e.g. "Section 302 IPC", "Section 376 IPC", "Section 420 IPC", "Section 498A IPC", "Section 4 POCSO Act", etc.)
2. "actName" — full name of the act (e.g. "Indian Penal Code", "Code of Criminal Procedure", "POCSO Act", "IT Act", etc.)
3. "shortDescription" — what this section defines or covers in one sentence
4. "appliedTo" — the name(s) of the accused/party this section was applied to (e.g. "Accused Ramesh Kumar", "All accused", "Appellant")
5. "reason" — why this section was applied in this specific case (1-2 sentences based on the facts)
6. "outcome" — what happened with this charge: "convicted", "acquitted", "charges framed", "under trial", or "not specified"

Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks. Raw JSON only.

Document:
${truncatedText}`;

    const requestBody = JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 2048 },
    });

    let rawResponse: string;
    try {
      rawResponse = await ollamaRequest(requestBody);
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Cannot connect to Ollama. Make sure Ollama + ngrok is running.' }, 
        { status: 503 }
      );
    }

    const data = JSON.parse(rawResponse);
    let raw: string = data.response || '';
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse IPC sections from response. Try again.' }, { status: 422 });
    }

    const sections = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'Invalid response format.' }, { status: 422 });
    }

    return NextResponse.json({ sections });

  } catch (error: any) {
    console.error('IPC route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract IPC sections.' }, { status: 500 });
  }
}
