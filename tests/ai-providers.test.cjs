const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')
const { EventEmitter } = require('node:events')

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'Node16', moduleResolution: 'Node16' },
})
const resolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(__dirname, '..', request.slice(2)) : request, parent, ...args)
}

process.env.OPENAI_API_KEY = 'unit-test-openai-key'
process.env.GOOGLE_GENAI_API_KEY = 'unit-test-google-key'
for (const key of ['OPENAI_TEXT_MODEL', 'OPENAI_IMAGE_MODEL', 'OPENAI_AUDIO_MODEL', 'GOOGLE_TEXT_MODEL', 'GOOGLE_IMAGE_MODEL', 'GOOGLE_AUDIO_MODEL']) delete process.env[key]
let handleFetch
global.fetch = (...args) => handleFetch(...args)
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const { runAgent } = require('../agents/base.ts')
const { generateImage } = require('../lib/ai-images.ts')
const { geminiTextToSpeech } = require('../lib/gemini-tts.ts')
const { concatenateWav, pcmToWav } = require('../lib/audio.ts')

class FakeSocket extends EventEmitter {
  static instances = []
  static responseStatus = 'completed'
  constructor(url, options) {
    super()
    this.url = url
    this.options = options
    this.sent = []
    FakeSocket.instances.push(this)
    queueMicrotask(() => this.event({ type: 'session.created' }))
  }
  event(event) { this.emit('message', Buffer.from(JSON.stringify(event))) }
  send(raw) {
    const event = JSON.parse(raw)
    this.sent.push(event)
    if (event.type === 'session.update') queueMicrotask(() => this.event({ type: 'session.updated' }))
    if (event.type === 'response.create') queueMicrotask(() => {
      this.event({ type: 'response.output_audio.delta', delta: Buffer.from([0, 1, 2, 3]).toString('base64') })
      this.event({ type: 'response.done', response: { status: FakeSocket.responseStatus } })
    })
  }
  close() { queueMicrotask(() => this.emit('close')) }
}
const load = Module._load
Module._load = function (request, ...args) { return request === 'ws' ? FakeSocket : load.call(this, request, ...args) }
const { openaiTextToSpeech } = require('../lib/openai-tts.ts')
Module._load = load

test('Luna sends high reasoning through Responses and omits sampling parameters even when requested', async () => {
  let body
  handleFetch = async (url, init) => {
    assert.match(String(url), /\/v1\/responses$/)
    body = JSON.parse(init.body)
    return json({ object: 'response', id: 'resp_test', status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'OK', annotations: [] }] }], usage: { input_tokens: 12, output_tokens: 6 } })
  }
  const result = await runAgent({ provider: 'openai', textModel: 'gpt-6-luna', maxTokens: 300, streaming: false }, 'Return JSON like {"ok": true}.', 'Be concise.', { prompt: 'Check', context: 'Context', temperature: 1.5 })
  assert.equal(body.model, 'gpt-6-luna')
  assert.deepEqual(body.reasoning, { effort: 'high' })
  for (const key of ['temperature', 'top_p', 'top_logprobs', 'logprobs', 'max_tokens', 'max_completion_tokens']) assert.equal(key in body, false, key)
  assert.ok(body.max_output_tokens >= 8192 + 300)
  assert.equal(body.store, false)
  assert.match(body.instructions, /\{"ok": true\}/)
  assert.equal(result.text, 'OK')
  assert.deepEqual(result.usage, { inputTokens: 12, outputTokens: 6 })
})

test('Luna reports incomplete responses rather than treating truncated output as success', async () => {
  handleFetch = async () => json({ object: 'response', id: 'resp_test', status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [] })
  await assert.rejects(() => runAgent({ provider: 'openai', textModel: 'gpt-6-luna', maxTokens: 300, streaming: false }, 'Write', '', { prompt: 'Check' }), /max_output_tokens/)
})

test('configured Gemini text fallback handles OpenAI quota failures with the original instructions', async () => {
  let geminiCalls = 0
  handleFetch = async (url, init) => {
    if (String(url).includes('/v1/responses')) return json({ error: { message: 'Spend limit reached', type: 'insufficient_quota', code: 'insufficient_quota' } }, 429)
    geminiCalls++
    const body = JSON.parse(init.body)
    assert.match(JSON.stringify(body), /Preserve these instructions/)
    assert(body.generationConfig.maxOutputTokens >= 4096)
    return json({ candidates: [{ content: { role: 'model', parts: [{ text: 'Fallback OK' }] }, finishReason: 'STOP', index: 0 }], usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 3, totalTokenCount: 15 } })
  }
  const result = await runAgent({ provider: 'openai', textModel: 'gpt-6-luna', maxTokens: 300, streaming: false }, 'Preserve these instructions', 'Do not invent content.', { prompt: 'Check', context: 'Source text' })
  assert.equal(result.provider, 'gemini')
  assert.equal(result.text, 'Fallback OK')
  assert.equal(geminiCalls, 1)
})

test('Flare uses supported image parameters and decodes base64 output', async () => {
  handleFetch = async (url, init) => {
    assert.match(String(url), /\/v1\/images\/generations$/)
    const body = JSON.parse(init.body)
    assert.equal(body.model, 'gpt-image-2.5-flare')
    assert.equal(body.size, '1536x1024')
    assert.equal(body.quality, 'medium')
    assert.equal(body.output_format, 'png')
    for (const key of ['style', 'response_format', 'temperature', 'reasoning', 'reasoning_effort']) assert.equal(key in body, false, key)
    return json({ created: 1, data: [{ b64_json: Buffer.from('image').toString('base64') }] })
  }
  const result = await generateImage({ provider: 'openai', prompt: 'An illustration', size: '1536x1024', quality: 'medium' })
  assert.equal(result.buffer.toString(), 'image')
  assert.equal(result.mimeType, 'image/png')
})

test('Nano Banana requests image output and exposes provider blocking reasons', async () => {
  handleFetch = async (url, init) => {
    assert.match(String(url), /gemini-nano-banana-2\.1:generateContent$/)
    const body = JSON.parse(init.body)
    assert.deepEqual(body.generationConfig.responseModalities, ['TEXT', 'IMAGE'])
    assert.equal(body.generationConfig.imageConfig.aspectRatio, '3:2')
    return json({ candidates: [{ finishReason: 'IMAGE_RECITATION', content: {} }] })
  }
  await assert.rejects(() => generateImage({ provider: 'gemini', prompt: 'An illustration', size: '1536x1024', quality: 'medium' }), /IMAGE_RECITATION/)
})

test('Gemini TTS sends the current voice schema and preserves WAV output', async () => {
  const wav = pcmToWav(Buffer.from([0, 1, 2, 3]))
  handleFetch = async (url, init) => {
    assert.match(String(url), /gemini-3\.8-flash-tts:generateContent$/)
    assert.equal(String(url).includes(process.env.GOOGLE_GENAI_API_KEY), false)
    const body = JSON.parse(init.body)
    assert.deepEqual(body.generationConfig.speechConfig.voiceConfig, { voice: 'Kore' })
    return json({ candidates: [{ content: { parts: [{ inlineData: { data: wav.toString('base64'), mimeType: 'audio/wav' } }] } }] })
  }
  assert.deepEqual(await geminiTextToSpeech('Hello', 'Kore'), wav)
})

test('WAV chunks merge under one header and reject incompatible sample formats', () => {
  const first = pcmToWav(Buffer.from([0, 1, 2, 3]))
  const second = pcmToWav(Buffer.from([4, 5]))
  const result = concatenateWav([first, second])
  assert.equal(result.length, 50)
  assert.equal(result.readUInt32LE(40), 6)
  assert.deepEqual(result.subarray(44), Buffer.from([0, 1, 2, 3, 4, 5]))
  assert.throws(() => concatenateWav([first, pcmToWav(Buffer.from([4, 5]), 16000)]), /formats do not match/)
  assert.throws(() => concatenateWav([Buffer.from('not audio')]), /Expected WAV/)
})

test('Realtime narration waits for session configuration and returns PCM WAV', async () => {
  const audio = await openaiTextToSpeech('Read me verbatim.', 'marin')
  const socket = FakeSocket.instances.at(-1)
  assert.match(socket.url, /model=gpt-realtime-2\.1-mini$/)
  assert.equal(socket.options.headers.Authorization, 'Bearer unit-test-openai-key')
  assert.deepEqual(socket.sent.map(e => e.type), ['session.update', 'conversation.item.create', 'response.create'])
  const session = socket.sent[0].session
  assert.equal(session.audio.output.voice, 'marin')
  assert.deepEqual(session.audio.output.format, { type: 'audio/pcm', rate: 24000 })
  assert.equal('temperature' in session, false)
  assert.equal('reasoning_effort' in session, false)
  assert.deepEqual(session.reasoning, { effort: 'minimal' })
  assert.equal(socket.sent[1].item.content[0].text, 'Read me verbatim.')
  assert.equal(audio.toString('ascii', 0, 4), 'RIFF')
})

test('Realtime refuses incomplete audio responses', async () => {
  FakeSocket.responseStatus = 'incomplete'
  await assert.rejects(() => openaiTextToSpeech('Hello', 'marin'), /incomplete/)
  FakeSocket.responseStatus = 'completed'
})

test('All seven agents and default narration select OpenAI', () => {
  for (const agent of ['article-generator', 'audio-narrator', 'content-writer', 'image-prompter', 'seo-optimizer', 'summarizer', 'tags-generator']) {
    const { config } = require(`../agents/${agent}/config.ts`)
    assert.equal(config.provider, 'openai', agent)
    assert.equal(config.textModel, 'gpt-6-luna', agent)
    assert.equal(config.reasoningEffort, 'high', agent)
    assert.equal(config.temperature, undefined, agent)
  }
  const { ttsConfig } = require('../agents/audio-narrator/config.ts')
  assert.equal(ttsConfig.ttsProvider, 'openai')
  assert.equal(ttsConfig.voice, 'marin')
})
