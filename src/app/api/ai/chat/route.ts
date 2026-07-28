/**
 * AI #10 — Conversation memory for repeat users.
 *
 * This route is a chat endpoint that:
 *  - Persists messages to the DB (Conversation + Message models)
 *  - Remembers the user's previous QR configurations
 *  - Can suggest QR configs from natural-language requests
 *
 * Uses gpt-oss-20b (fast) for the main chat loop.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chat, type ChatMessage, safeJsonParse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `You are QRcraft Assistant — a helpful, friendly assistant inside a creative QR code generator app.

Your job: help users create QR codes through natural conversation.

You can:
1. Suggest a QR configuration from a user's natural-language request (e.g. "make a QR for my home WiFi" → WiFi category with placeholder fields)
2. Remember the user's previous QRs (provided to you in context) and offer to regenerate variations
3. Explain QR best practices briefly
4. Suggest creative design ideas (colors, templates)

When the user asks for a QR code, ALWAYS respond with TWO things:
A) A short friendly message (1-2 sentences) in plain text.
B) A JSON block (in a fenced \`\`\`json code block) with this exact schema:
{
  "suggestedCategory": "<one of: text|url|instagram|whatsapp|email|phone|sms|wifi|vcard|location|youtube|twitter|linkedin|bizcard|image|file>",
  "suggestedFields": { "fieldId": "value", ... },
  "suggestedCustomization": {
    "foreground": "#hex",
    "background": "#hex",
    "template": "classic|rounded|dots|gradient",
    "gradientFrom": "#hex (optional)",
    "gradientTo": "#hex (optional)"
  },
  "intent": "create|modify|explain|chat"
}

If the user is just chatting or asking a question (not requesting a QR), set intent to "explain" or "chat" and omit suggestedFields/suggestedCustomization.

Keep your message under 80 words. Be warm, never robotic. Use second person ("you"). Match the user's language (if they write in Hindi, reply in Hindi using Roman script).`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sessionId: string;
      message: string;
    };

    if (!body.sessionId || !body.message?.trim()) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 },
      );
    }

    // Upsert conversation
    let conversation = await db.conversation.findUnique({
      where: { sessionId: body.sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: { sessionId: body.sessionId },
        include: { messages: true },
      });
    }

    // Persist user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: body.message,
      },
    });

    // Build chat context — last 20 messages
    const recentMessages = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    // Call the model — strict: only use the user-authorized models
    const raw = await chat(chatMessages, {
      maxTokens: 1600, // Increased for complete responses
      temperature: 0.7,
    });

    console.log('[chat] Raw AI response:', raw);

    // Parse out JSON block (if any)
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
    let parsed: unknown = null;
    let cleanMessage = raw;
    if (jsonMatch) {
      parsed = safeJsonParse(jsonMatch[1]);
      cleanMessage = raw.replace(/```json[\s\S]*?```/, '').trim();
      console.log('[chat] Found JSON block, parsed:', parsed);
    } else {
      console.log('[chat] No JSON block found in response');
    }

    // Persist assistant message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: cleanMessage,
        metaJson: parsed ? JSON.stringify(parsed) : null,
      },
    });

    console.log('[chat] Response sent to client:', {
      message: cleanMessage,
      suggestion: parsed,
      hasSuggestion: !!parsed
    });

    return NextResponse.json({
      message: cleanMessage,
      suggestion: parsed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat] error:', msg);
    return NextResponse.json(
      {
        error: msg,
        fallback:
          "I couldn't reach the AI service. Please check API keys and try again.",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }
  const conversation = await db.conversation.findUnique({
    where: { sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  return NextResponse.json({ conversation });
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }
  await db.conversation.deleteMany({ where: { sessionId } });
  return NextResponse.json({ ok: true });
}
