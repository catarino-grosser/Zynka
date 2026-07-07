const https = require('https');

const CACHE_TTL = 1000 * 60 * 10;
const cache = new Map();

function fetchText(url){
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'ZynkaMagazine/2.0 (+https://netlify.app)',
        'Accept': 'application/rss+xml, text/xml, */*'
      },
      timeout: 12000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if(res.statusCode < 200 || res.statusCode >= 300){
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        resolve(data);
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

function decodeHtml(str = ''){
  return String(str)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function stripTags(html = ''){
  return decodeHtml(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function tag(block, name){
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = block.match(re);
  return m ? decodeHtml(m[1]).trim() : '';
}

function attrImage(block){
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i) || block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  return media ? decodeHtml(media[1]) : '';
}

function parseGoogleNews(xml){
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return matches.slice(0, 18).map(m => {
    const block = m[1];
    const titleRaw = stripTags(tag(block, 'title'));
    const description = stripTags(tag(block, 'description'));
    const link = tag(block, 'link');
    const pubDate = tag(block, 'pubDate');
    const source = stripTags(tag(block, 'source')) || 'Google News';
    return {
      title: titleRaw.replace(/\s+-\s+[^-]+$/,'').trim() || titleRaw,
      description: description.slice(0, 220),
      link,
      source,
      publishedAt: pubDate,
      image: attrImage(block)
    };
  }).filter(item => item.title && item.link);
}

exports.handler = async function(event){
  const q = (event.queryStringParameters && event.queryStringParameters.q) || 'Brasil';
  const force = event.queryStringParameters && event.queryStringParameters.force === '1';
  const key = q.toLowerCase().trim();
  const now = Date.now();

  if(!force && cache.has(key)){
    const saved = cache.get(key);
    if(now - saved.time < CACHE_TTL){
      return json({ cached: true, query: q, items: saved.items });
    }
  }

  try{
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const xml = await fetchText(rssUrl);
    const items = parseGoogleNews(xml);
    cache.set(key, { time: now, items });
    return json({ cached: false, query: q, items });
  }catch(err){
    if(cache.has(key)){
      const saved = cache.get(key);
      return json({ cached: true, stale: true, query: q, items: saved.items });
    }
    return json({ error: 'Erro ao buscar notícias.', detail: err.message, items: [] }, 500);
  }
};

function json(body, statusCode = 200){
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  };
}
