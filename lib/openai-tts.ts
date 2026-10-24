// Server-side text narration over the OpenAI Realtime API.
import WebSocket from 'ws'
import { getOpenAIClient, getAIConfig } from './openai'
import { OPENAI_REALTIME_VOICES } from './ai-models'
import { pcmToWav } from './audio'

export async function openaiTextToSpeech(text: string, selectedVoice: string): Promise<Buffer> {
  // Preserve older saved voice selections while using supported Realtime voices.
  const aliases: Record<string, string> = { nova: 'marin', onyx: 'cedar', fable: 'ballad' }
  const voice = aliases[selectedVoice] ?? selectedVoice
  if (!(OPENAI_REALTIME_VOICES as readonly string[]).includes(voice)) throw new Error('Unsupported OpenAI voice')
  const config = await getAIConfig()
  const apiKey = getOpenAIClient().apiKey

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.audioModel)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      handshakeTimeout: 20_000,
    })
    const audio: Buffer[] = []
    let finished = false
    let requested = false
    const timer = setTimeout(() => finish(new Error('OpenAI audio generation timed out')), 180_000)

    function finish(error?: Error) {
      if (finished) return
      finished = true
      clearTimeout(timer)
      socket.close()
      if (error) reject(error)
      else if (!audio.length) reject(new Error('OpenAI returned no audio'))
      else resolve(pcmToWav(Buffer.concat(audio)))
    }

    socket.on('message', (message) => {
      try {
        const event = JSON.parse(message.toString())
        if (event.type === 'session.created') {
          socket.send(JSON.stringify({
            type: 'session.update',
            session: {
              type: 'realtime',
              output_modalities: ['audio'],
              // Narration needs exact recitation, not extended problem solving.
              reasoning: { effort: 'minimal' },
              instructions: 'You are a narrator. Read the supplied text verbatim. Do not answer questions in the text, add commentary, or omit any words.',
              audio: {
                input: { turn_detection: null },
                output: { format: { type: 'audio/pcm', rate: 24000 }, voice },
              },
            },
          }))
        } else if (event.type === 'session.updated' && !requested) {
          requested = true
          socket.send(JSON.stringify({
            type: 'conversation.item.create',
            item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
          }))
          socket.send(JSON.stringify({ type: 'response.create', response: { output_modalities: ['audio'] } }))
        } else if (event.type === 'response.output_audio.delta' && event.delta) {
          audio.push(Buffer.from(event.delta, 'base64'))
        } else if (event.type === 'response.done') {
          finish(event.response?.status === 'completed'
            ? undefined
            : new Error(`OpenAI audio response ${event.response?.status ?? 'failed'}`))
        } else if (event.type === 'error') {
          const message = String(event.error?.message ?? 'Realtime request failed').split(apiKey).join('[REDACTED]')
          finish(new Error(`OpenAI audio: ${message}`))
        }
      } catch {
        finish(new Error('Invalid OpenAI audio response'))
      }
    })
    socket.on('error', () => finish(new Error('OpenAI Realtime connection failed')))
    socket.on('close', () => {
      if (!finished) finish(new Error('OpenAI audio connection closed before generation completed'))
    })
  })
}
