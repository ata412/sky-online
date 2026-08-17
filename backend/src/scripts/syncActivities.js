require('dotenv').config();
const pool = require('../db');

const SOURCE_ORIGIN = 'https://skyonline99.com';
const SOURCE_PAGE = `${SOURCE_ORIGIN}/news_article.php`;

const activityDetails = {
  '260628': { date: '2026-06-27', location: 'จังหวัดจันทบุรี' },
  '260507': { date: '2026-05-07', location: 'จังหวัดกาญจนบุรี' },
  '260405': { date: '2026-04-05' },
  '260329': { date: '2026-03-29', location: 'The Toy Beach Resort จังหวัดระยอง' },
  '251026': { date: '2025-10-26', location: 'โรงแรมวัน โอ วัน แกรนด์ จังหวัดร้อยเอ็ด' },
  // The source uses act=251015, but the visible event title says 19 October.
  '251015': { date: '2025-10-19' },
  '251014': { date: '2025-10-11' },
  '250926': { date: '2025-09-26' },
  '240908': { date: '2024-09-08' },
  '241020': { date: '2024-10-20', location: 'จังหวัดร้อยเอ็ด' },
  '241020b': { date: '2024-10-20', location: 'จังหวัดสุราษฎร์ธานี' },
  '240724': { date: '2024-07-27', location: 'แม่น้ำเจ้าพระยา' },
  '231117': { date: '2023-11-17' },
  '231211': { date: '2023-12-11' },
  '240220': { date: '2024-02-20', location: 'จังหวัดร้อยเอ็ด' },
  '240225': { date: '2024-02-25' },
  '240331': { date: '2024-03-31', location: 'จังหวัดร้อยเอ็ด' },
};

function absoluteUrl(path) {
  return new URL(path, `${SOURCE_ORIGIN}/`).toString();
}

function cleanText(value) {
  return value.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SkyOnlineWebsite/1.0' },
  });
  if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  return response.text();
}

function parseActivities(html) {
  const itemPattern = /onclick="window\.open\('news_article\.php\?act=([^']+)'[^>]*>[\s\S]*?<img\s+src="([^"]+)"[^>]*>[\s\S]*?<br\s*\/?>\s*([\s\S]*?)<\/div>/g;
  const activities = [];
  let match;

  while ((match = itemPattern.exec(html)) !== null) {
    const [, sourceId, imagePath, rawTitle] = match;
    if (!activityDetails[sourceId]) continue;
    activities.push({
      sourceId,
      title: cleanText(rawTitle.replace(/<[^>]+>/g, ' ')),
      imageUrl: absoluteUrl(imagePath),
      ...activityDetails[sourceId],
    });
  }

  return activities;
}

function parsePhotoUrls(html, activity) {
  const imagePattern = /(?:src|href)="(news_article\/Images\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi;
  const urls = [];
  let match;

  while ((match = imagePattern.exec(html)) !== null) {
    const url = absoluteUrl(match[1]);
    if (!urls.includes(url)) urls.push(url);
  }

  // One source detail page currently points to another event's album. Keep its
  // correct cover instead of showing unrelated photos.
  const ownAlbum = urls.filter((url) => url.includes(`/Images/${activity.sourceId}/`));
  return ownAlbum.length > 0 ? ownAlbum : [activity.imageUrl];
}

async function loadActivities() {
  const activities = parseActivities(await fetchHtml(SOURCE_PAGE));
  if (activities.length !== Object.keys(activityDetails).length) {
    throw new Error(`Expected ${Object.keys(activityDetails).length} activities, found ${activities.length}`);
  }

  for (const activity of activities) {
    const detailUrl = `${SOURCE_PAGE}?act=${encodeURIComponent(activity.sourceId)}`;
    activity.photos = parsePhotoUrls(await fetchHtml(detailUrl), activity);
  }

  return activities;
}

async function saveActivities(activities) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM activities');

    const photoRows = [];

    for (const activity of activities) {
      const result = await client.query(
        `INSERT INTO activities (title, description, image_url, activity_date, location)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [activity.title, `ภาพกิจกรรมจากเว็บไซต์ Sky Online`, activity.imageUrl, activity.date, activity.location || null]
      );

      for (const [sortOrder, imageUrl] of activity.photos.entries()) {
        photoRows.push([result.rows[0].id, imageUrl, sortOrder]);
      }
    }

    if (photoRows.length > 0) {
      const values = [];
      const placeholders = photoRows.map((row, index) => {
        values.push(...row);
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });
      await client.query(
        `INSERT INTO activity_photos (activity_id, image_url, sort_order)
         VALUES ${placeholders.join(', ')}`,
        values
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function syncActivities() {
  const activities = await loadActivities();
  const photoCount = activities.reduce((total, activity) => total + activity.photos.length, 0);

  if (process.argv.includes('--dry-run')) {
    console.log(`Found ${activities.length} activities and ${photoCount} photos.`);
    return;
  }

  await saveActivities(activities);
  console.log(`Synced ${activities.length} activities and ${photoCount} photos.`);
}

syncActivities()
  .catch((error) => {
    console.error('Activity sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
