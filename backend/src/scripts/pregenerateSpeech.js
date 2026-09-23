// Run with the backend and Next.js site running locally. Generates the exact
// text chunks that the e-book UI will request, then stores compact MP3 files
// in backend/audio-library so they survive Railway redeploys via Git.
require('dotenv').config();

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { BUNDLED_AUDIO_DIRECTORY } = require('../lib/speechFileCache');

const locale = process.argv[2] || 'th';
const verifyOnly = process.argv.includes('--verify');
const siteOrigin = process.env.SPEECH_SITE_ORIGIN || 'http://localhost:3000';
const apiOrigin = process.env.SPEECH_API_ORIGIN || 'http://localhost:5001';
const model = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const voice = process.env.TTS_VOICE || 'Sulafat';
const googleCloudVoice = process.env.GOOGLE_CLOUD_TTS_VOICE || 'th-TH-Chirp3-HD-Sulafat';
const pauseMs = Number(process.env.SPEECH_GENERATION_PAUSE_MS || 1200);
const requestedConcurrency = Number.parseInt(process.env.SPEECH_GENERATION_CONCURRENCY || '2', 10);
const concurrency = Number.isFinite(requestedConcurrency)
  ? Math.max(1, Math.min(12, requestedConcurrency))
  : 2;

function cacheKey(text) {
  const normalized = text.normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const identity = locale === 'th'
    ? `google-cloud-file-v1\0chirp3-hd\0${googleCloudVoice}\0${locale}\0${normalized}`
    : `gemini-file-v2\0${model}\0${voice}\0${locale}\0${normalized}`;
  return crypto.createHash('sha256')
    .update(identity)
    .digest('hex');
}

async function exists(filePath) {
  try {
    return (await fs.stat(filePath)).size > 0;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function convertToMp3(wavPath, mp3Path) {
  const temporary = `${mp3Path}.${process.pid}.tmp`;
  try {
    await new Promise((resolve, reject) => {
      const child = spawn('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-i', wavPath,
        '-codec:a', 'libmp3lame', '-b:a', '64k', '-f', 'mp3', temporary,
      ], { stdio: 'inherit' });
      child.on('error', reject);
      child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
    });
    if (!await exists(temporary)) throw new Error('MP3 conversion produced an empty file');
    await fs.rename(temporary, mp3Path);
    await fs.unlink(wavPath);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

async function requestSpeech(text, id) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(`${apiOrigin}/api/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, text }),
        signal: AbortSignal.timeout(210000),
      });
      if (response.ok) return response;
      const detail = (await response.text()).slice(0, 300);
      lastError = new Error(`${id}: speech API returned ${response.status}: ${detail}`);
      if (![429, 502, 503].includes(response.status)) {
        lastError.nonRetryable = true;
        throw lastError;
      }
      if (attempt === 3) break;
      console.warn(`${lastError.message}; retry ${attempt + 1}/4`);
      await new Promise((resolve) => setTimeout(resolve, response.status === 429 ? 60000 : 15000));
    } catch (error) {
      lastError = error;
      if (error.nonRetryable || attempt === 3) break;
      console.warn(`${id}: ${error.message}; retry ${attempt + 1}/4`);
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }
  throw lastError;
}

async function main() {
  const manifestUrl = `${siteOrigin}/${locale}/encyclopedia?speech_manifest=1`;
  const page = await fetch(manifestUrl);
  if (!page.ok) throw new Error(`Cannot load speech manifest: ${page.status} ${manifestUrl}`);
  const html = await page.text();
  const match = html.match(/<script id="ebook-speech-manifest" type="application\/json">([^<]*)<\/script>/);
  if (!match) throw new Error('Speech manifest was not rendered on the e-book page');
  const manifest = JSON.parse(match[1]);
  if (manifest.locale !== locale || !Array.isArray(manifest.entries)) {
    throw new Error('Speech manifest has an unexpected format or language');
  }

  await fs.mkdir(BUNDLED_AUDIO_DIRECTORY, { recursive: true });
  const unique = [...new Map(manifest.entries.map((entry) => [cacheKey(entry.text), entry])).entries()];
  let created = 0;
  let reused = 0;
  let missing = 0;
  let cursor = 0;
  let stopped = false;
  console.log(`${locale}: ${manifest.entries.length} references, ${unique.length} unique clips`);

  const processEntry = async ([key, entry]) => {
    const mp3Path = path.join(BUNDLED_AUDIO_DIRECTORY, `${key}.mp3`);
    const wavPath = path.join(BUNDLED_AUDIO_DIRECTORY, `${key}.wav`);
    if (await exists(mp3Path)) {
      reused += 1;
      return;
    }
    if (verifyOnly) {
      missing += 1;
      return;
    }
    if (!await exists(wavPath)) {
      const response = await requestSpeech(entry.text, entry.id);
      const audio = Buffer.from(await response.arrayBuffer());
      if (response.headers.get('content-type')?.includes('mpeg')) {
        if (!await exists(mp3Path)) await fs.writeFile(mp3Path, audio, { flag: 'wx' });
        reused += 1;
        return;
      }
      if (!await exists(wavPath)) await fs.writeFile(wavPath, audio, { flag: 'wx' });
    }
    await convertToMp3(wavPath, mp3Path);
    created += 1;
    console.log(`${created + reused}/${unique.length} ${entry.id}`);
    if (pauseMs > 0) await new Promise((resolve) => setTimeout(resolve, pauseMs));
  };

  const worker = async () => {
    while (cursor < unique.length && !stopped) {
      const entry = unique[cursor];
      cursor += 1;
      try {
        await processEntry(entry);
      } catch (error) {
        stopped = true;
        throw error;
      }
    }
  };
  await Promise.all(Array.from({ length: verifyOnly ? 1 : concurrency }, () => worker()));
  console.log(`Done: ${created} created, ${reused} reused, ${missing} missing. Audio: ${BUNDLED_AUDIO_DIRECTORY}`);
  if (missing) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
