// Server-only Gemini REST transport. Never put API keys in request URLs.
export interface GeminiPart {
  text?: string
  inlineData?: { data: string; mimeType: string }
}

export interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[]
  error?: { message?: string }
}

export async function generateGeminiContent(model: string, body: object): Promise<GeminiResponse> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GENAI_API_KEY is not configured')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    },
  )
  const data: GeminiResponse = await response.json()
  if (!response.ok) {
    const message = (data.error?.message ?? 'Request failed').split(apiKey).join('[REDACTED]')
    throw new Error(`Gemini API (HTTP ${response.status}): ${message}`)
  }
  return data
}
