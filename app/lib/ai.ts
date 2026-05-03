import OpenAI from 'openai'

let client: OpenAI | undefined

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}

export type ModelTier = 'fast' | 'balanced' | 'premium'

const MODEL_MAP: Record<ModelTier, string> = {
  fast:     process.env.OPENAI_DEFAULT_MODEL  ?? 'gpt-4o-mini',
  balanced: process.env.OPENAI_PREMIUM_MODEL  ?? 'gpt-4o',
  premium:  process.env.OPENAI_PREMIUM_MODEL  ?? 'gpt-4o',
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
  const { tier = 'balanced', maxTokens = 500 } = options
  const model = MODEL_MAP[tier]

  const response = await getClient().chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const usage = response.usage

  return {
    content,
    tokens: {
      input:      usage?.prompt_tokens     ?? 0,
      output:     usage?.completion_tokens ?? 0,
      cacheRead:  0,
      cacheWrite: 0,
      total:      usage?.total_tokens      ?? 0,
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
  const { tier = 'balanced', maxTokens = 500 } = options
  const model = MODEL_MAP[tier]

  const stream = await getClient().chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) controller.enqueue(text)
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
