import Anthropic from '@anthropic-ai/sdk'

let anthropicClient: Anthropic | undefined

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
}

export type ModelTier = 'fast' | 'balanced' | 'premium'

const MODEL_MAP: Record<ModelTier, string> = {
  fast: 'claude-haiku-4-5',
  balanced: 'claude-sonnet-4-6',
  premium: 'claude-opus-4-7',
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResult {
  content: string
  tokens: {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  model: string
}

export async function chat(
  systemPrompt: string,
  messages: AIMessage[],
  options: {
    tier?: ModelTier
    maxTokens?: number
    cacheSystem?: boolean
  } = {}
): Promise<AIResult> {
  const { tier = 'balanced', maxTokens = 500, cacheSystem = true } = options
  const client = getClient()
  const model = MODEL_MAP[tier]

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: cacheSystem
      ? [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
      : systemPrompt,
    messages,
  }, {
    headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
  })

  const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const usage = response.usage as Anthropic.Usage & {
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
  }

  return {
    content,
    tokens: {
      input: usage.input_tokens,
      output: usage.output_tokens,
      cacheRead: usage.cache_read_input_tokens ?? 0,
      cacheWrite: usage.cache_creation_input_tokens ?? 0,
      total: usage.input_tokens + usage.output_tokens,
    },
    model,
  }
}

export async function chatStream(
  systemPrompt: string,
  messages: AIMessage[],
  options: {
    tier?: ModelTier
    maxTokens?: number
    cacheSystem?: boolean
  } = {}
): Promise<ReadableStream<string>> {
  const { tier = 'balanced', maxTokens = 500, cacheSystem = true } = options
  const client = getClient()
  const model = MODEL_MAP[tier]

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: cacheSystem
      ? [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
      : systemPrompt,
    messages,
  }, {
    headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
  })

  return new ReadableStream<string>({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(event.delta.text)
        }
      }
      controller.close()
    },
  })
}

export async function chatWithRetry(
  systemPrompt: string,
  messages: AIMessage[],
  options: Parameters<typeof chat>[2] & { retries?: number } = {}
): Promise<AIResult> {
  const { retries = 2, ...chatOptions } = options
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await chat(systemPrompt, messages, chatOptions)
    } catch (err) {
      lastErr = err
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastErr
}
