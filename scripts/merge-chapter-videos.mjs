// Разовый скрипт: сливает src/data/chapter-videos.{foundation-a,mobile,blockchain}.json
// (параллельно подобранные подагентами) в src/data/chapter-videos.json.
import fs from 'node:fs';

const parts = ['chapter-videos.foundation-a.json', 'chapter-videos.mobile.json', 'chapter-videos.blockchain.json'];
const merged = {};
const seenIds = new Set();

for (const part of parts) {
  const path = `src/data/${part}`;
  if (!fs.existsSync(path)) {
    console.error(`missing ${path}`);
    process.exitCode = 1;
    continue;
  }
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const [chapterId, videos] of Object.entries(data)) {
    if (merged[chapterId]) console.error(`duplicate chapterId across parts: ${chapterId}`);
    merged[chapterId] = videos;
    for (const v of videos) {
      if (seenIds.has(v.videoId)) console.error(`duplicate videoId ${v.videoId} in ${chapterId}`);
      seenIds.add(v.videoId);
      if (!/^[a-zA-Z0-9_-]{11}$/.test(v.videoId)) console.error(`bad videoId shape: ${chapterId}: ${v.videoId}`);
      if (videos.length < 4 || videos.length > 5) console.error(`${chapterId}: ${videos.length} videos (expected 4-5)`);
    }
  }
}

fs.writeFileSync('src/data/chapter-videos.json', JSON.stringify(merged, null, 2) + '\n');
console.log(`merged ${Object.keys(merged).length} chapters, ${seenIds.size} unique videos`);
