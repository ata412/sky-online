const crypto = require('crypto');
const express = require('express');
const { readAudioFile, saveAudioFile } = require('../lib/speechFileCache');

const router = express.Router();

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const TTS_VOICE = process.env.TTS_VOICE || 'Sulafat';
const GOOGLE_CLOUD_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const GOOGLE_CLOUD_TTS_VOICE = process.env.GOOGLE_CLOUD_TTS_VOICE || 'th-TH-Chirp3-HD-Sulafat';
const MAX_TEXT_LENGTH = 1600;
const CACHE_MAX_ITEMS = 80;
const CACHE_MAX_BYTES = 64 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const SUPPORTED_LOCALES = {
  th: 'Thai',
  en: 'English',
  zh: 'Mandarin Chinese',
  lo: 'Lao',
  my: 'Burmese',
  vi: 'Vietnamese',
};
const audioCache = new Map();
const pendingAudio = new Map();
const requestHistory = new Map();
let cachedBytes = 0;

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createCacheKey(text, locale) {
  if (locale === 'th') {
    return crypto
      .createHash('sha256')
      .update(`google-cloud-file-v1\0chirp3-hd\0${GOOGLE_CLOUD_TTS_VOICE}\0${locale}\0${text}`)
      .digest('hex');
  }
  return crypto
    .createHash('sha256')
    .update(`gemini-file-v2\0${TTS_MODEL}\0${TTS_VOICE}\0${locale}\0${text}`)
    .digest('hex');
}

function splitGoogleCloudText(text, maxBytes = 350) {
  const chunks = [];
  let current = '';
  for (const character of text) {
    if (Buffer.byteLength(current + character, 'utf8') <= maxBytes) {
      current += character;
      continue;
    }

    let cutAt = -1;
    for (let index = current.length - 1; index >= Math.floor(current.length / 2); index -= 1) {
      if (/[\s.!?。！？,;:/()\-–—]/u.test(current[index])) {
        cutAt = index + 1;
        break;
      }
    }
    if (cutAt < 1) cutAt = current.length;
    const completed = current.slice(0, cutAt).trim();
    if (completed) chunks.push(completed);
    current = `${current.slice(cutAt).trimStart()}${character}`;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function extractWavPcm(wav) {
  const dataOffset = wav.indexOf(Buffer.from('data'));
  if (dataOffset < 0 || dataOffset + 8 > wav.length) {
    throw new Error('Google Cloud speech generation returned invalid WAV audio');
  }
  const declaredLength = wav.readUInt32LE(dataOffset + 4);
  const pcmStart = dataOffset + 8;
  return wav.subarray(pcmStart, Math.min(pcmStart + declaredLength, wav.length));
}

async function performGoogleCloudAudioRequest(text, locale) {
  const wavSegments = await Promise.all(splitGoogleCloudText(text).map(async (segment) => {
    const response = await fetch(GOOGLE_CLOUD_TTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GOOGLE_CLOUD_TTS_ACCESS_TOKEN}`,
        ...(process.env.GOOGLE_CLOUD_PROJECT
          ? { 'x-goog-user-project': process.env.GOOGLE_CLOUD_PROJECT }
          : {}),
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        input: { text: segment },
        voice: {
          languageCode: locale === 'th' ? 'th-TH' : locale,
          name: GOOGLE_CLOUD_TTS_VOICE,
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',
          speakingRate: 0.95,
        },
      }),
      signal: AbortSignal.timeout(180000),
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data?.error?.message || 'Google Cloud speech service is unavailable');
      error.status = response.status;
      throw error;
    }

    const wav = Buffer.from(data?.audioContent || '', 'base64');
    if (!wav.length) throw new Error('Google Cloud speech generation returned empty audio');
    return wav;
  }));
  return pcmToWav(Buffer.concat(wavSegments.map(extractWavPcm)), 24000);
}

function getCachedAudio(key) {
  const entry = audioCache.get(key);
  if (!entry) return null;
  audioCache.delete(key);
  audioCache.set(key, entry);
  return entry.result;
}

function cacheAudio(key, result) {
  const previous = audioCache.get(key);
  if (previous) {
    cachedBytes -= previous.result.audio.length;
    audioCache.delete(key);
  }
  audioCache.set(key, { result });
  cachedBytes += result.audio.length;

  while (audioCache.size > CACHE_MAX_ITEMS || cachedBytes > CACHE_MAX_BYTES) {
    const oldestKey = audioCache.keys().next().value;
    if (!oldestKey) break;
    const oldest = audioCache.get(oldestKey);
    cachedBytes -= oldest.result.audio.length;
    audioCache.delete(oldestKey);
  }
}

function getRequesterKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || '')
    .split(',')[0]
    .trim();
  const secret = process.env.TTS_RATE_LIMIT_SECRET || 'sky-online-tts';
  return crypto.createHash('sha256').update(`${secret}:${ip}`).digest('hex');
}

function consumeRateLimit(req) {
  const configuredLimit = Number.parseInt(process.env.TTS_MAX_REQUESTS_PER_HOUR || '120', 10);
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 120;
  const requesterKey = getRequesterKey(req);
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const recentRequests = (requestHistory.get(requesterKey) || [])
    .filter((timestamp) => timestamp > cutoff);
  if (recentRequests.length >= limit) {
    requestHistory.set(requesterKey, recentRequests);
    return { allowed: false, limit };
  }
  recentRequests.push(Date.now());
  requestHistory.set(requesterKey, recentRequests);
  return { allowed: true, limit };
}

function pcmToWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function buildPrompt(text, locale) {
  const language = SUPPORTED_LOCALES[locale];
  return `Generate speech that reads the transcript below exactly as written in ${language}. Use a clear, warm, natural product encyclopedia narration at a moderate pace. Do not translate, add, omit, summarize, or describe the transcript.\n\nTranscript:\n${text}`;
}

async function performGeminiAudioRequest(text, locale) {
  const response = await fetch(
    `${GEMINI_BASE_URL}/models/${encodeURIComponent(TTS_MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text, locale) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: TTS_VOICE },
            },
          },
        },
      }),
      signal: AbortSignal.timeout(90000),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Speech generation service is unavailable');
    error.status = response.status;
    throw error;
  }

  const parts = data?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) || [];
  const audioPart = parts.find((part) => part?.inlineData?.data);
  if (!audioPart) throw new Error('Speech generation returned no audio');

  const audio = Buffer.from(audioPart.inlineData.data, 'base64');
  if (!audio.length) throw new Error('Speech generation returned empty audio');
  const mimeType = String(audioPart.inlineData.mimeType || '').toLowerCase();
  if (mimeType.includes('wav')) return audio;
  const sampleRate = Number.parseInt(mimeType.match(/rate=(\d+)/)?.[1] || '24000', 10);
  return pcmToWav(audio, sampleRate);
}

async function requestGeminiAudio(text, locale) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await performGeminiAudioRequest(text, locale);
    } catch (error) {
      lastError = error;
      const retryable = !error.status || error.status >= 500;
      if (!retryable || attempt === 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError;
}

async function generateAudio(text, locale, key) {
  const existing = pendingAudio.get(key);
  if (existing) return existing;

  const generation = (async () => {
    const useGoogleCloud = locale === 'th';
    const audio = useGoogleCloud
      ? await performGoogleCloudAudioRequest(text, locale)
      : await requestGeminiAudio(text, locale);
    const result = {
      audio,
      mimeType: 'audio/wav',
      provider: useGoogleCloud ? 'google-cloud-chirp3-hd' : 'gemini',
    };
    await saveAudioFile(key, result);
    cacheAudio(key, result);
    return result;
  })()
    .finally(() => pendingAudio.delete(key));
  pendingAudio.set(key, generation);
  return generation;
}

router.post('/', async (req, res) => {
  const locale = typeof req.body?.locale === 'string' ? req.body.locale.toLowerCase() : '';
  const text = normalizeText(req.body?.text);
  if (!SUPPORTED_LOCALES[locale]) {
    return res.status(400).json({ error: 'Unsupported speech language' });
  }
  if (!text || !/[\p{L}\p{N}]/u.test(text)) {
    return res.status(400).json({ error: 'Speech text is required' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `Speech text must not exceed ${MAX_TEXT_LENGTH} characters` });
  }

  const key = createCacheKey(text, locale);
  const cached = getCachedAudio(key);
  if (cached) {
    res.setHeader('X-TTS-Cache', 'HIT');
    res.setHeader('X-TTS-Provider', cached.provider);
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.type(cached.mimeType);
    return res.send(cached.audio);
  }

  try {
    const stored = await readAudioFile(key);
    if (stored) {
      cacheAudio(key, stored);
      res.setHeader('X-TTS-Cache', 'FILE');
      res.setHeader('X-TTS-Provider', stored.provider);
      res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
      res.type(stored.mimeType);
      return res.send(stored.audio);
    }
  } catch (error) {
    console.error('[speech] unable to read saved audio', error);
    return res.status(503).json({ error: 'Saved speech audio is unavailable' });
  }

  if (process.env.SPEECH_GENERATION_ENABLED !== 'true') {
    return res.status(404).json({ error: 'Saved speech audio is not available for this text' });
  }

  const generationConfigured = locale === 'th'
    ? process.env.GOOGLE_CLOUD_TTS_ACCESS_TOKEN
    : process.env.GEMINI_API_KEY;
  if (!generationConfigured) {
    return res.status(503).json({ error: 'Speech generation is not configured' });
  }

  const rateLimit = consumeRateLimit(req);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Speech generation limit reached (${rateLimit.limit} per hour)`,
    });
  }

  try {
    const result = await generateAudio(text, locale, key);
    res.setHeader('X-TTS-Cache', 'MISS');
    res.setHeader('X-TTS-Provider', result.provider);
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.type(result.mimeType);
    return res.send(result.audio);
  } catch (error) {
    console.error('[speech] generation error', error.message);
    const status = error.status === 429 ? 429 : 502;
    return res.status(status).json({ error: 'Speech generation is temporarily unavailable' });
  }
});

module.exports = router;
