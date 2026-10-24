// Public model identifiers only. Credentials belong in server environment variables.
export const AI_MODELS = {
  gemini: {
    text: 'gemini-3.8-flash',
    image: 'gemini-nano-banana-2.1',
    audio: 'gemini-3.8-flash-tts',
  },
  openai: {
    text: 'gpt-6-luna',
    image: 'gpt-image-2.5-flare',
    audio: 'gpt-realtime-2.1-mini',
  },
} as const

export const OPENAI_REALTIME_VOICES = [
  'marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse',
] as const
