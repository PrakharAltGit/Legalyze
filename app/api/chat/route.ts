import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = (process.env.OLLAMA_URL || 'https://chastity-operative-purifier.ngrok-free.dev').replace(/\/$/, '');
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { question, context, history } = await request.json();

    if (!question || !context) {
      return NextResponse.json(
        { error: 'Question and context are required' },
        { status: 400 }
      );
    }

    // Build conversation history string (last 6 messages to avoid token overflow)
    const recentHistory: Message[] = Array.isArray(history) ? history.slice(-6) : [];
    const conversationHistory = recentHistory.length > 0
      ? recentHistory
          .map((msg: Message) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      : '';

    // Truncate context to avoid overflowing context window
    const truncatedContext = context.length > 12000
      ? context.substring(0, 12000) + '\n\n[Document truncated...]'
      : context;

    const prompt = `You are a helpful AI legal assistant analyzing a document. Answer the user's question based ONLY on the provided document context. If the answer cannot be found in the document, clearly say so rather than guessing.

Document Context:
${truncatedContext}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User Question: ${question}

Provide a clear, concise answer based on the document. Where relevant, reference specific parts of the document to support your answer.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
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

    return NextResponse.json({
      answer: (data.response || '').trim()
    });

  } catch (error: any) {
    console.error('Error in chat:', error);

    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to Ollama. Make sure Ollama is running on localhost:11434.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get answer.' },
      { status: 500 }
    );
  }
}
