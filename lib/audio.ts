/** Package mono 24 kHz, signed 16-bit PCM as a WAV file. */
export function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * channels * bitDepth / 8, 28)
  header.writeUInt16LE(channels * bitDepth / 8, 32)
  header.writeUInt16LE(bitDepth, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

/** Merge audio data, not whole WAV files (which would leave embedded headers). */
export function concatenateWav(buffers: Buffer[]): Buffer {
  if (!buffers.length) throw new Error('No audio was generated')
  let format: Buffer | undefined
  const pcm: Buffer[] = []
  for (const buffer of buffers) {
    if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
      throw new Error('Expected WAV audio')
    }
    let chunkFormat: Buffer | undefined
    let audio: Buffer | undefined
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const name = buffer.toString('ascii', offset, offset + 4)
      const length = buffer.readUInt32LE(offset + 4)
      if (offset + 8 + length > buffer.length) throw new Error('Truncated WAV audio')
      const data = buffer.subarray(offset + 8, offset + 8 + length)
      if (name === 'fmt ') chunkFormat = data
      if (name === 'data') audio = data
      offset += 8 + length + (length % 2)
    }
    if (!chunkFormat || chunkFormat.length < 16 || !audio?.length) throw new Error('WAV is missing format or audio data')
    if (chunkFormat.readUInt16LE(0) !== 1) throw new Error('Expected PCM WAV audio')
    if (format && !format.subarray(0, 16).equals(chunkFormat.subarray(0, 16))) throw new Error('Audio chunk formats do not match')
    format = chunkFormat
    pcm.push(audio)
  }
  return pcmToWav(Buffer.concat(pcm), format!.readUInt32LE(4), format!.readUInt16LE(2), format!.readUInt16LE(14))
}
