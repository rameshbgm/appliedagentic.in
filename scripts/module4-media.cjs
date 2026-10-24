#!/usr/bin/env node
// Reuses the application's configured image, narration and speech API clients.
// dotenv -e .env.production -- node scripts/module4-media.cjs [--images|--audio]
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const courseNumbers = process.env.COURSE_MODULES?.split(',').map(Number);
const adapter = courseNumbers ? require('./course-content.cjs').mediaAdapter(courseNumbers) : require('./import-module4.cjs');
const { buildPlan, checkContent, readModule, work, root, sha } = adapter;
const { normalizeText, prepareNarration } = require('./course-text.cjs');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' } });
require('tsconfig-paths').register({ baseUrl: root, paths: { '@/*': ['./*'] } });

const { generateImage } = require('../lib/ai-images');
const { runImagePrompter } = require('../agents/image-prompter/agent');
const { runAudioNarrator, ttsConfig } = require('../agents/audio-narrator/agent');
const { openaiTextToSpeech } = require('../lib/openai-tts');
const { geminiTextToSpeech, isGeminiVoice, GEMINI_TTS_MODEL } = require('../lib/gemini-tts');
const { concatenateWav } = require('../lib/audio');
const { prepareAsset } = require('../lib/storage');
const sharp = require('sharp');

const p = new PrismaClient();
const plan = buildPlan();
const failures = [];
fs.mkdirSync(work, { recursive: true });
function log(event, details = {}) {
  const row = { at: new Date().toISOString(), event, ...details };
  fs.appendFileSync(path.join(work, 'media-events.jsonl'), JSON.stringify(row) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(row));
}
function safeError(e) {
  let message = String(e.message || e);
  for (const value of [process.env.OPENAI_API_KEY, process.env.GOOGLE_GENAI_API_KEY]) if (value) message = message.split(value).join('[REDACTED]');
  return message.slice(0, 600);
}
async function workers(items, count, fn) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(count, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      try { await fn(item); }
      catch (e) { const failure = { task: item.slug || item.id, error: safeError(e) }; failures.push(failure); log('failed', failure); }
    }
  }));
}
function audioDuration(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Invalid WAV header');
  const bytesPerSecond = buffer.readUInt32LE(28);
  return (buffer.length - 44) / bytesPerSecond;
}

async function covers(articles) {
  const style = 'Professional landscape 3:2 editorial cover illustration for an AI business education course. Deep midnight blue background, violet and cyan/teal accents, restrained amber risk highlights, clean modern digital concept art, subtle gradients, cinematic lighting, one clear focal point. No text, labels, letters, watermarks, real identifiable people, hacker hoodies or software screenshots. ';
  await workers(articles, 2, async a => {
    if (a.coverImageId) { log('cover-skipped-existing', { articleId: a.id }); return; }
    const expected = plan.articles.find(x => x.slug === a.slug);
    const dir = path.join(work, 'covers');
    fs.mkdirSync(dir, { recursive: true });
    const imagePath = path.join(dir, `${a.slug}.png`);
    const promptPath = path.join(dir, `${a.slug}.prompt.txt`);
    const modelPath = path.join(dir, `${a.slug}.model.txt`);
    let prompt = style + expected.coverConcept;
    let model;
    let buffer;
    if (fs.existsSync(imagePath) && fs.existsSync(promptPath) && fs.existsSync(modelPath)) {
      buffer = fs.readFileSync(imagePath); prompt = fs.readFileSync(promptPath, 'utf8'); model = fs.readFileSync(modelPath, 'utf8').trim();
    } else {
      log('cover-generation-started', { articleId: a.id, slug: a.slug, provider: 'openai' });
      try {
        const enhanced = await runImagePrompter({ prompt, target: 'openai', aspectRatio: '3:2' });
        if (enhanced.imagePrompt?.trim()) prompt = normalizeText(enhanced.imagePrompt);
      } catch (e) { log('cover-prompt-fallback', { articleId: a.id, error: safeError(e) }); }
      const generated = await generateImage({ provider: 'openai', prompt, size: '1536x1024', quality: 'medium' });
      buffer = generated.buffer; model = generated.model;
      const parsed = await sharp(buffer).metadata();
      if (parsed.format !== 'png') buffer = await sharp(buffer).png().toBuffer();
      fs.writeFileSync(imagePath, buffer);
      fs.writeFileSync(promptPath, prompt);
      fs.writeFileSync(modelPath, model);
    }
    const dims = await sharp(buffer).metadata();
    if (!dims.width || !dims.height || dims.width <= dims.height) throw new Error('Expected a valid landscape cover');
    const { url, filename } = prepareAsset({ mimeType: 'image/png', subDir: 'ai' });
    const asset = await p.$transaction(async tx => {
      const current = await tx.article.findUniqueOrThrow({ where: { id: a.id }, select: { coverImageId: true } });
      if (current.coverImageId) return { id: current.coverImageId, url: null };
      const asset = await tx.mediaAsset.create({ data: { filename, url, type: 'IMAGE', mimeType: 'image/png', data: buffer, sizeBytes: buffer.length,
        width: dims.width, height: dims.height, altText: expected.coverAlt, aiPrompt: prompt, createdByUserId: a.authorId } });
      await tx.article.update({ where: { id: a.id }, data: { coverImageId: asset.id } });
      await tx.aIUsageLog.create({ data: { userId: a.authorId, articleId: a.id, type: 'IMAGE_GENERATION', model, promptSnippet: prompt.slice(0, 200), status: 'success' } });
      return { id: asset.id, url: asset.url };
    }, { timeout: 30000 });
    log('cover-attached', { articleId: a.id, mediaAssetId: asset.id, url: asset.url, width: dims.width, height: dims.height, model, file: imagePath });
  });
}

async function narration(articles) {
  const voice = ttsConfig.voice;
  const useGemini = isGeminiVoice(voice);
  const model = useGemini ? GEMINI_TTS_MODEL : ttsConfig.openaiModel;
  const pending = [];
  for (const a of articles) {
    const missing = a.sections.filter(s => !s.audioUrl && s.content.trim());
    if (!missing.length) continue;
    await p.audioJob.upsert({ where: { articleId: a.id },
      create: { articleId: a.id, status: 'running', total: missing.length, completed: 0, failed: 0 },
      update: { status: 'running', total: missing.length, completed: 0, failed: 0 } });
    pending.push(...missing.map(s => ({ ...s, authorId: a.authorId, articleId: a.id })));
  }
  log('audio-batch-started', { sections: pending.length, voice, model });
  const concurrency = Math.max(1, Math.min(4, Number(process.env.COURSE_AUDIO_CONCURRENCY) || 2));
  await workers(pending, concurrency, async section => {
    try {
      const dir = path.join(work, 'audio', `section-${section.id}`);
      fs.mkdirSync(dir, { recursive: true });
      const narrationPath = path.join(dir, 'narration.json');
      const fingerprint = sha(section.content);
      let result;
      if (fs.existsSync(narrationPath)) {
        result = JSON.parse(fs.readFileSync(narrationPath, 'utf8'));
        if (result.sourceHash !== fingerprint || result.voice !== voice || result.model !== model) throw new Error('Cached narration no longer matches the source or voice');
      } else {
        log('narration-preparing', { articleId: section.articleId, sectionId: section.id, title: section.title });
        const generated = await runAudioNarrator({ prompt: prepareNarration(section.content) });
        generated.cleanedText = normalizeText(generated.cleanedText);
        generated.chunks = generated.chunks.map(normalizeText);
        if (!generated.chunks?.length || !generated.cleanedText?.trim()) throw new Error('Narration was empty');
        const originalWords = section.content.trim().split(/\s+/).length;
        const spokenWords = generated.cleanedText.trim().split(/\s+/).length;
        if (spokenWords < originalWords * 0.72 || spokenWords > originalWords * 1.5) throw new Error(`Narration length differs too much from the source (${spokenWords}/${originalWords} words)`);
        result = { ...generated, sourceHash: fingerprint, voice, model, originalWords, spokenWords };
        fs.writeFileSync(narrationPath, JSON.stringify(result, null, 2));
      }
      const buffers = [];
      for (let index = 0; index < result.chunks.length; index++) {
        const chunk = result.chunks[index];
        const chunkPath = path.join(dir, `chunk-${index}-${sha(chunk).slice(0, 10)}.wav`);
        let buffer;
        if (fs.existsSync(chunkPath)) buffer = fs.readFileSync(chunkPath);
        else {
          log('audio-chunk-generating', { articleId: section.articleId, sectionId: section.id, chunk: index + 1, chunks: result.chunks.length });
          buffer = useGemini ? await geminiTextToSpeech(chunk, voice) : await openaiTextToSpeech(chunk, voice);
          const duration = audioDuration(buffer);
          const words = chunk.trim().split(/\s+/).length;
          if (duration < words / 7 || duration > words * 1.5) throw new Error(`Audio duration does not match the narration length (${duration.toFixed(1)} seconds, ${words} words)`);
          fs.writeFileSync(chunkPath, buffer);
        }
        buffers.push(buffer);
      }
      const combined = concatenateWav(buffers);
      const duration = audioDuration(combined);
      fs.writeFileSync(path.join(dir, 'complete.wav'), combined);
      const { url, filename } = prepareAsset({ mimeType: 'audio/wav', subDir: 'audio' });
      const asset = await p.$transaction(async tx => {
        const current = await tx.articleSection.findUniqueOrThrow({ where: { id: section.id }, select: { content: true, audioUrl: true } });
        if (current.content !== section.content) throw new Error('Section changed during audio generation; refusing to attach stale audio');
        if (current.audioUrl) return { id: null, url: current.audioUrl };
        const asset = await tx.mediaAsset.create({ data: { filename, url, type: 'AUDIO', mimeType: 'audio/wav', data: combined, sizeBytes: combined.length,
          aiPrompt: section.content.slice(0, 200), createdByUserId: section.authorId } });
        await tx.articleSection.update({ where: { id: section.id }, data: { audioUrl: url } });
        await tx.aIUsageLog.create({ data: { userId: section.authorId, articleId: section.articleId, type: 'AUDIO_GENERATION', model, promptSnippet: section.content.slice(0, 200), status: 'success' } });
        await tx.audioJob.update({ where: { articleId: section.articleId }, data: { completed: { increment: 1 } } });
        return { id: asset.id, url: asset.url };
      }, { timeout: 30000 });
      log('audio-attached', { articleId: section.articleId, sectionId: section.id, mediaAssetId: asset.id, url: asset.url, durationSeconds: Math.round(duration), voice, model });
    } catch (e) {
      await p.audioJob.update({ where: { articleId: section.articleId }, data: { failed: { increment: 1 } } });
      throw e;
    }
  });
  for (const a of articles) {
    const job = await p.audioJob.findUnique({ where: { articleId: a.id } });
    if (job?.status === 'running') await p.audioJob.update({ where: { articleId: a.id }, data: { status: job.failed === 0 ? 'done' : 'error' } });
  }
}

async function main() {
  await require('./course-content.cjs').assertProduction(p);
  fs.writeFileSync(path.join(work, 'media-process.json'), JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), modules: courseNumbers || [4] }));
  log('media-worker-started', { pid: process.pid, modules: courseNumbers || [4] });
  const module = await readModule(p, plan);
  checkContent(module, plan);
  const articles = module.articles.map(l => l.article);
  const onlyImages = process.argv.includes('--images');
  const onlyAudio = process.argv.includes('--audio');
  const jobs = [];
  if (!onlyAudio) jobs.push(covers(articles));
  if (!onlyImages) jobs.push(narration(articles));
  const settled = await Promise.allSettled(jobs);
  for (const r of settled) if (r.status === 'rejected') failures.push({ task: 'batch', error: safeError(r.reason) });
  log('media-batch-finished', { failures });
  if (failures.length) process.exitCode = 1;
}
main().catch(e => { log('fatal', { error: safeError(e) }); process.exitCode = 1; }).finally(() => p.$disconnect());
