const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const VEO_MODEL = process.env.VEO_MODEL || 'veo-3.1-generate-preview';
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const JOB_PROMPT = `Create an 8-second vertical premium social media product advertisement.
Use the first reference image as the exact adult presenter and preserve their recognizable facial identity, natural skin tone, hairstyle, and appearance.
Use the second reference image as the exact product and preserve its packaging, proportions, colors, logo, and label without redesigning it.
The presenter confidently holds and naturally showcases the product toward the camera in a bright, elegant studio with warm golden accents. Use smooth cinematic camera movement, flattering commercial lighting, realistic hand placement, and an upbeat instrumental soundtrack.
Do not add captions, floating text, new logos, medical claims, health claims, before-and-after imagery, or spoken claims. Do not alter the product label.`;

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function isEnabled() {
  return process.env.VIDEO_STUDIO_ENABLED === 'true';
}

function parseImage(dataUrl, fieldName) {
  if (typeof dataUrl !== 'string') {
    throw new Error(`${fieldName} is required`);
  }

  const match = dataUrl.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !ALLOWED_IMAGE_TYPES.has(match[1])) {
    throw new Error(`${fieldName} must be a JPEG or PNG image`);
  }

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`${fieldName} must be no larger than 6 MB`);
  }

  return { mimeType: match[1], data: match[2] };
}

function getRequesterHash(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || '')
    .split(',')[0]
    .trim();
  const secret = process.env.VIDEO_STUDIO_RATE_LIMIT_SECRET || 'sky-online-video-studio';
  return crypto.createHash('sha256').update(`${secret}:${ip}`).digest('hex');
}

async function checkRateLimit(requesterHash) {
  const configured = Number.parseInt(process.env.VIDEO_STUDIO_MAX_JOBS_PER_HOUR || '2', 10);
  const limit = Number.isFinite(configured) && configured > 0 ? configured : 2;
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM video_generation_jobs
     WHERE requester_hash = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [requesterHash]
  );
  return { allowed: result.rows[0].count < limit, limit };
}

async function geminiRequest(path, init = {}) {
  const response = await fetch(`${GEMINI_BASE_URL}/${path}`, {
    ...init,
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || 'Video generation service is unavailable';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function publicJob(row) {
  return {
    id: row.public_id,
    status: row.status,
    error: row.error_message || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    video_url: row.status === 'completed'
      ? `/api/video-studio/jobs/${row.public_id}/video`
      : null,
  };
}

router.post('/jobs', asyncRoute(async (req, res) => {
  if (!isEnabled()) {
    return res.status(503).json({ error: 'Video Studio is not enabled' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
  }
  if (req.body?.consent !== true) {
    return res.status(400).json({ error: 'You must confirm image ownership and adult consent' });
  }

  let personImage;
  let productImage;
  try {
    personImage = parseImage(req.body.person_image, 'person_image');
    productImage = parseImage(req.body.product_image, 'product_image');
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const requesterHash = getRequesterHash(req);
  const rateLimit = await checkRateLimit(requesterHash);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Video generation limit reached (${rateLimit.limit} per hour)`,
    });
  }

  const publicId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO video_generation_jobs (public_id, status, prompt, requester_hash)
     VALUES ($1, 'submitting', $2, $3)`,
    [publicId, JOB_PROMPT, requesterHash]
  );

  try {
    const operation = await geminiRequest(`models/${encodeURIComponent(VEO_MODEL)}:predictLongRunning`, {
      method: 'POST',
      body: JSON.stringify({
        instances: [{
          prompt: JOB_PROMPT,
          referenceImages: [
            {
              image: { inlineData: personImage },
              referenceType: 'asset',
            },
            {
              image: { inlineData: productImage },
              referenceType: 'asset',
            },
          ],
        }],
        parameters: {
          aspectRatio: '9:16',
          durationSeconds: '8',
          resolution: '720p',
          numberOfVideos: 1,
          personGeneration: 'allow_adult',
        },
      }),
    });

    if (!operation.name || !operation.name.startsWith('operations/')) {
      throw new Error('Video service returned an invalid operation');
    }

    const result = await pool.query(
      `UPDATE video_generation_jobs
       SET operation_name = $1, status = 'processing', updated_at = NOW()
       WHERE public_id = $2
       RETURNING *`,
      [operation.name, publicId]
    );
    return res.status(202).json({ job: publicJob(result.rows[0]) });
  } catch (error) {
    await pool.query(
      `UPDATE video_generation_jobs
       SET status = 'failed', error_message = $1, updated_at = NOW()
       WHERE public_id = $2`,
      [error.message, publicId]
    );
    console.error('[video-studio] submit error', error);
    return res.status(502).json({ error: error.message });
  }
}));

router.get('/jobs/:id', asyncRoute(async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid video job ID' });
  }
  const result = await pool.query(
    'SELECT * FROM video_generation_jobs WHERE public_id = $1',
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Video job not found' });
  }

  let job = result.rows[0];
  if (job.status !== 'processing') {
    return res.json({ job: publicJob(job) });
  }

  try {
    const operation = await geminiRequest(job.operation_name);
    if (!operation.done) {
      return res.json({ job: publicJob(job) });
    }

    if (operation.error) {
      const message = operation.error.message || 'Video generation failed';
      const failed = await pool.query(
        `UPDATE video_generation_jobs
         SET status = 'failed', error_message = $1, updated_at = NOW()
         WHERE public_id = $2 RETURNING *`,
        [message, job.public_id]
      );
      return res.json({ job: publicJob(failed.rows[0]) });
    }

    const videoUri = operation?.response?.generateVideoResponse
      ?.generatedSamples?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error('Completed video response did not contain a video');
    }

    const completed = await pool.query(
      `UPDATE video_generation_jobs
       SET status = 'completed', video_uri = $1, updated_at = NOW()
       WHERE public_id = $2 RETURNING *`,
      [videoUri, job.public_id]
    );
    job = completed.rows[0];
    return res.json({ job: publicJob(job) });
  } catch (error) {
    console.error('[video-studio] status error', error);
    return res.status(502).json({ error: 'Unable to check video status. Please try again.' });
  }
}));

router.get('/jobs/:id/video', asyncRoute(async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid video job ID' });
  }
  const result = await pool.query(
    `SELECT video_uri FROM video_generation_jobs
     WHERE public_id = $1 AND status = 'completed'`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Video is not ready' });
  }

  try {
    const videoUrl = new URL(result.rows[0].video_uri);
    const isGoogleApiHost = videoUrl.hostname === 'googleapis.com'
      || videoUrl.hostname.endsWith('.googleapis.com');
    if (videoUrl.protocol !== 'https:' || !isGoogleApiHost) {
      throw new Error('Unexpected video host');
    }

    const videoResponse = await fetch(videoUrl, {
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        ...(req.headers.range ? { Range: req.headers.range } : {}),
      },
      redirect: 'follow',
    });
    if (!videoResponse.ok || !videoResponse.body) {
      throw new Error('Generated video is no longer available');
    }

    res.status(videoResponse.status);
    res.setHeader('Content-Type', videoResponse.headers.get('content-type') || 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="sky-online-${req.params.id}.mp4"`
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');
    for (const header of ['accept-ranges', 'content-range', 'content-length']) {
      const value = videoResponse.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    const reader = videoResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(Buffer.from(value))) {
        await new Promise((resolve) => res.once('drain', resolve));
      }
    }
    return res.end();
  } catch (error) {
    console.error('[video-studio] video proxy error', error);
    if (!res.headersSent) {
      return res.status(502).json({ error: error.message });
    }
    return res.end();
  }
}));

router.use((error, req, res, next) => {
  console.error('[video-studio] unhandled error', error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: 'Video Studio request failed' });
});

module.exports = router;
