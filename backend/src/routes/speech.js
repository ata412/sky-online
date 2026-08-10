const crypto = require('crypto');
const express = require('express');
const { EdgeTTS } = require('@seepine/edge-tts');

const router = express.Router();

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const TTS_VOICE = process.env.TTS_VOICE || 'Sulafat';
const EDGE_TTS_ENABLED = process.env.EDGE_TTS_ENABLED !== 'false';
const EDGE_TTS_TIMEOUT_MS = 8000;
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
const EDGE_TTS_VOICES = {
  th: 'th-TH-PremwadeeNeural',
  en: 'en-US-AriaNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  lo: 'lo-LA-KeomanyNeural',
  my: 'my-MM-NilarNeural',
  vi: 'vi-VN-HoaiMyNeural',
};
const EDGE_TTS_LOCALES = {
  th: 'th-TH',
  en: 'en-US',
  zh: 'zh-CN',
  lo: 'lo-LA',
  my: 'my-MM',
  vi: 'vi-VN',
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
  return crypto
    .createHash('sha256')
    .update(`edge-mp3-v1\0${EDGE_TTS_ENABLED}\0${EDGE_TTS_VOICES[locale]}\0${TTS_MODEL}\0${TTS_VOICE}\0${locale}\0${text}`)
    .digest('hex');
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

async function requestEdgeAudio(text, locale) {
  const tts = new EdgeTTS({
    voice: EDGE_TTS_VOICES[locale],
    lang: EDGE_TTS_LOCALES[locale],
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    timeout: EDGE_TTS_TIMEOUT_MS,
  });
  const response = await tts.call(text);
  const audio = Buffer.from(response.data);
  if (!audio.length) throw new Error('Edge speech generation returned empty audio');
  return { audio, mimeType: 'audio/mpeg', provider: 'edge' };
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
      signal: AbortSignal.timeout(45000),
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
    let result;
    if (EDGE_TTS_ENABLED) {
      try {
        result = await requestEdgeAudio(text, locale);
      } catch (error) {
        console.warn(
          '[speech] Edge TTS unavailable; using Gemini fallback',
          error?.message || String(error)
        );
      }
    }
    if (!result) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini speech fallback is not configured');
      }
      const audio = await requestGeminiAudio(text, locale);
      result = { audio, mimeType: 'audio/wav', provider: 'gemini' };
    }
    cacheAudio(key, result);
    return result;
  })()
    .finally(() => pendingAudio.delete(key));
  pendingAudio.set(key, generation);
  return generation;
}

router.post('/', async (req, res) => {
  if (!EDGE_TTS_ENABLED && !process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Speech generation is not configured' });
  }

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
