require('dotenv').config();

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { BUNDLED_AUDIO_DIRECTORY } = require('../lib/speechFileCache');

const locale = process.argv[2] || 'th';
const siteOrigin = process.env.SPEECH_SITE_ORIGIN || 'http://localhost:3000';
const model = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const voice = process.env.TTS_VOICE || 'Sulafat';

function normalizeText(value) {
  return String(value || '').normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cacheKey(text) {
  return crypto.createHash('sha256')
    .update(`gemini-file-v2\0${model}\0${voice}\0${locale}\0${normalizeText(text)}`)
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

async function runFfmpeg(argumentsList) {
  await new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', argumentsList, { stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = '';
    child.stderr.on('data', (chunk) => { errors += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0
      ? resolve()
      : reject(new Error(errors.trim() || `ffmpeg exited ${code}`)));
  });
}

async function main() {
  const page = await fetch(`${siteOrigin}/${locale}/encyclopedia?speech_manifest=1`);
  if (!page.ok) throw new Error(`Cannot load speech manifest: ${page.status}`);
  const html = await page.text();
  const match = html.match(/<script id="ebook-speech-manifest" type="application\/json">([^<]*)<\/script>/);
  if (!match) throw new Error('Speech manifest was not rendered');
  const manifest = JSON.parse(match[1]);
  const pages = new Map();
  manifest.entries.forEach((entry) => {
    const pageId = entry.id.replace(/-\d+$/, '');
    if (!pages.has(pageId)) pages.set(pageId, []);
    pages.get(pageId).push(entry);
  });

  let created = 0;
  let alreadyComplete = 0;
  let unavailable = 0;
  for (const [pageId, entries] of pages) {
    const fullText = entries.map((entry) => entry.text).join(' ');
    const destination = path.join(BUNDLED_AUDIO_DIRECTORY, `${cacheKey(fullText)}.mp3`);
    if (await exists(destination)) {
      alreadyComplete += 1;
      continue;
    }
    const sources = entries.map((entry) => (
      path.join(BUNDLED_AUDIO_DIRECTORY, `${cacheKey(entry.text)}.mp3`)
    ));
    if (!(await Promise.all(sources.map(exists))).every(Boolean)) {
      unavailable += 1;
      continue;
    }
    if (sources.length === 1) {
      await fs.copyFile(sources[0], destination);
    } else {
      const temporary = `${destination}.${process.pid}.tmp.mp3`;
      const concatInput = `concat:${sources.map((source) => source.replace(/([|\\])/g, '\\$1')).join('|')}`;
      try {
        await runFfmpeg([
          '-hide_banner', '-loglevel', 'error', '-y',
          '-i', concatInput, '-codec', 'copy', temporary,
        ]);
        await fs.rename(temporary, destination);
      } catch (error) {
        await fs.rm(temporary, { force: true });
        throw new Error(`${pageId}: ${error.message}`);
      }
    }
    created += 1;
  }
  console.log(`Pages: ${pages.size}; stitched: ${created}; existing: ${alreadyComplete}; incomplete: ${unavailable}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
