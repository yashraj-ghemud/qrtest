/**
 * AI client — STRICTLY uses only the models the user authorized.
 *
 * Groq (https://api.groq.com/openai/v1):
 *   - gpt-oss-120b
 *   - gpt-oss-20b
 *   - qwen-3.6-27b
 *
 * OpenRouter (https://openrouter.ai/api/v1):
 *   - nvidia/nemotron-3-ultra-550b-a55b:free
 *   - google/gemma-4-31b-it (vision)
 *
 * Server-side only. Keys are read from env vars:
 *   GROQ_API_KEY, OPENROUTER_API_KEY
 */

export type AIProvider = 'groq' | 'openrouter';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  /** Whether this model supports image input (vision). */
  vision?: boolean;
}

// Hard-coded list — user's explicit instruction: use ONLY these, nothing else.
export const ALLOWED_MODELS: AIModelConfig[] = [
  { provider: 'groq', model: 'openai/gpt-oss-120b' },
  { provider: 'groq', model: 'openai/gpt-oss-20b' },
  { provider: 'groq', model: 'qwen/qwen3.6-27b' },
  { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free' },
  { provider: 'openrouter', model: 'google/gemma-4-31b-it', vision: true },
];

// Default routing per task
export const MODEL_ROUTING = {
  /** Quick conversational tasks / conversation memory / NL QR parsing */
  fast: { provider: 'groq' as const, model: 'openai/gpt-oss-20b' },
  /** Heavier reasoning (analytics insights, design suggestions) */
  reasoning: { provider: 'groq' as const, model: 'openai/gpt-oss-120b' },
  /** Longer context / general fallback */
  balanced: { provider: 'groq' as const, model: 'qwen/qwen3.6-27b' },
  /** Vision tasks (image-to-QR OCR) */
  vision: {
    provider: 'openrouter' as const,
    model: 'google/gemma-4-31b-it',
    vision: true,
  },
  /** Free-tier fallback for heavy reasoning */
  free: {
    provider: 'openrouter' as const,
    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  },
} satisfies Record<string, AIModelConfig>;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** For vision models: array of { type: 'text', text } | { type: 'image_url', image_url: { url } } */
  contentParts?: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** Optional JSON-mode response (object schema not enforced). */
  jsonMode?: boolean;
  /** Force a specific model from ALLOWED_MODELS. */
  forceModel?: AIModelConfig;
}

function getEndpoint(provider: AIProvider): string {
  return provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';
}

function getApiKey(provider: AIProvider): string {
  const key =
    provider === 'groq'
      ? process.env.GROQ_API_KEY
      : process.env.OPENROUTER_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error(
      `Missing or empty API key for ${provider}. Set ${provider === 'groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY'} in .env file`,
    );
  }
  return key.trim();
}

function getHeaders(provider: AIProvider): Record<string, string> {
  const key = getApiKey(provider);
  if (provider === 'groq') {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    };
  }
  // OpenRouter
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    'HTTP-Referer': 'https://qrcraft.app',
    'X-Title': 'QRcraft',
  };
}

/**
 * Low-level chat completion call with automatic fallback.
 * Returns the assistant message string.
 * 
 * Fallback strategy:
 * 1. Try primary model (Groq by default)
 * 2. If Groq fails (401, 403, 5xx, or missing key), automatically fallback to OpenRouter
 * 3. If both fail, throw error
 */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  const primaryModel = opts.forceModel ?? MODEL_ROUTING.balanced;

  // Define fallback model (OpenRouter free tier)
  const fallbackModel = MODEL_ROUTING.free;

  // Try primary model first
  try {
    return await chatWithModel(messages, primaryModel, opts);
  } catch (primaryError) {
    const errorMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
    console.warn(`[AI] Primary model (${primaryModel.provider}/${primaryModel.model}) failed: ${errorMsg}`);

    // Check if error is recoverable (API key issues, rate limits, server errors)
    const shouldFallback =
      errorMsg.includes('401') ||
      errorMsg.includes('403') ||
      errorMsg.includes('Invalid API Key') ||
      errorMsg.includes('Missing API key') ||
      errorMsg.includes('5') || // 5xx errors
      errorMsg.includes('rate limit');

    if (shouldFallback && primaryModel.provider !== fallbackModel.provider) {
      console.log(`[AI] Attempting fallback to ${fallbackModel.provider}/${fallbackModel.model}...`);
      try {
        return await chatWithModel(messages, fallbackModel, opts);
      } catch (fallbackError) {
        const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`[AI] Fallback model also failed: ${fallbackMsg}`);
        throw new Error(`Both primary and fallback AI models failed. Primary: ${errorMsg}. Fallback: ${fallbackMsg}`);
      }
    }

    // If no fallback or same provider, just throw original error
    throw primaryError;
  }
}

/**
 * Internal function to call a specific model without fallback logic.
 */
async function chatWithModel(
  messages: ChatMessage[],
  model: AIModelConfig,
  opts: ChatOptions = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model: model.model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.contentParts ?? m.content,
    })),
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048, // Increased from 1024 to 2048
  };

  // Only add JSON mode for providers/models that support it
  // OpenRouter may not support response_format for all models
  if (opts.jsonMode) {
    if (model.provider === 'groq') {
      body.response_format = { type: 'json_object' };
    } else if (model.provider === 'openrouter') {
      // For OpenRouter, we rely on prompt engineering instead
      // Some OpenRouter models don't support response_format
      console.log('[AI] JSON mode requested for OpenRouter - relying on prompt');
    }
  }

  const res = await fetch(getEndpoint(model.provider), {
    method: 'POST',
    headers: getHeaders(model.provider),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `${model.provider} API error ${res.status}: ${text.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${model.provider} returned empty content`);
  }
  return content;
}

/**
 * Vision call with automatic fallback — sends an image (base64 data URL) + text prompt.
 * Uses the OpenRouter Gemma-4-31B-IT vision model.
 * If vision model fails, returns a helpful error message.
 */
export async function chatVision(
  prompt: string,
  imageDataUrl: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const model = MODEL_ROUTING.vision;

  try {
    return await chatVisionWithModel(prompt, imageDataUrl, model, opts);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[AI Vision] Failed: ${errorMsg}`);

    // Vision models are harder to fallback, so we just throw a better error
    const keyName = model.provider === 'openrouter' ? 'OPENROUTER_API_KEY' : 'GROQ_API_KEY';
    throw new Error(
      `Vision AI failed. Please check your ${keyName} in .env file. Original error: ${errorMsg}`
    );
  }
}

/**
 * Internal function for vision calls without fallback logic.
 */
async function chatVisionWithModel(
  prompt: string,
  imageDataUrl: string,
  model: AIModelConfig,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const body = {
    model: model.model,
    messages: [
      {
        role: 'user' as const,
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1024,
  };

  const res = await fetch(getEndpoint(model.provider), {
    method: 'POST',
    headers: getHeaders(model.provider),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Vision API error ${res.status}: ${text.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? '';
}

/** Helper: safe JSON parse for jsonMode responses. */
export function safeJsonParse<T = unknown>(s: string): T | null {
  try {
    // Strip ```json fences if present
    const cleaned = s
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
