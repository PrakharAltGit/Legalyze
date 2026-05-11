import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = (process.env.OLLAMA_URL || 'https://chastity-operative-purifier.ngrok-free.dev').replace(/\/$/, '');
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Truncate to avoid overloading context window (keep ~10k chars)
    const truncatedText = text.length > 10000
      ? text.substring(0, 10000) + '\n\n[Document truncated due to length...]'
      : text;

    const prompt = `You are a legal document analyst. Please provide a comprehensive summary of the following legal document.

Create a concise summary paragraph (2-4 sentences) and extract 5-7 key points as bullet points.

Format your response EXACTLY like this (do not add any other text before SUMMARY:):
SUMMARY: [Your summary here]

KEY POINTS:
- [Point 1]
- [Point 2]
- [Point 3]
- [Point 4]
- [Point 5]

Document content:
${truncatedText}`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error:', errorText);
      return NextResponse.json(
        { error: `Ollama API error: ${response.statusText}. Make sure Ollama is running and the model "${MODEL_NAME}" is pulled.` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiResponse: string = data.response || '';

    // Parse summary
    const summaryMatch = aiResponse.match(/SUMMARY:\s*([\s\S]*?)(?=\n\s*KEY POINTS:|$)/i);
    const keyPointsMatch = aiResponse.match(/KEY POINTS:([\s\S]*)/i);

    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : aiResponse.split('\n')[0] || aiResponse.substring(0, 300);

    let keyPoints: string[] = [];
    if (keyPointsMatch) {
      keyPoints = keyPointsMatch[1]
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
        .map((line: string) => line.replace(/^[-•\d.]\s*/, '').trim())
        .filter((point: string) => point.length > 5);
    }

    return NextResponse.json({ summary, keyPoints, rawResponse: aiResponse });

  } catch (error: any) {
    console.error('Error generating summary:', error);

    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to Ollama. Make sure Ollama is running on localhost:11434.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate summary.' },
      { status: 500 }
    );
  }
}
