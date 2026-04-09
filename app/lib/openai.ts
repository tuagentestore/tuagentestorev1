import OpenAI from 'openai'

let openaiClient: OpenAI | undefined

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  content: string
  tokens: { input: number; output: number; total: number }
  model: string
}

export async function chat(
  messages: ChatMessage[],
  model = process.env.OPENAI_DEFAULT_MODEL ?? 'gpt-4o-mini',
  maxTokens = 500
): Promise<ChatResult> {
  const client = getClient()
  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  })

  const choice = response.choices[0]
  return {
    content: choice.message.content ?? '',
    tokens: {
      input: response.usage?.prompt_tokens ?? 0,
      output: response.usage?.completion_tokens ?? 0,
      total: response.usage?.total_tokens ?? 0,
    },
    model: response.model,
  }
}

export async function chatWithRetry(
  messages: ChatMessage[],
  model?: string,
  maxTokens?: number,
  retries = 2
): Promise<ChatResult> {
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await chat(messages, model, maxTokens)
    } catch (err) {
      lastErr = err
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }
  throw lastErr
}
