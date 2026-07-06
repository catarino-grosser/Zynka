const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 RevistaDigital/1.2',
        'Accept': 'application/json,text/plain,*/*'
      }
    }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Resposta não era JSON válido: ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Tempo esgotado ao consultar a fonte de notícias.'));
    });

    req.on('error', reject);
  });
}

function normalizeArticle(article) {
  return {
    title: article.title || 'Sem título',
    url: article.url || '#',
    domain: article.domain || 'Fonte não informada',
    seendate: article.seendate || '',
    socialimage: article.socialimage || ''
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const query = event.queryStringParameters?.q || 'Brasil';
    const timespan = event.queryStringParameters?.timespan || '7d';
    const maxrecords = event.queryStringParameters?.maxrecords || '18';

    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', query);
    url.searchParams.set('mode', 'ArtList');
    url.searchParams.set('format', 'json');
    url.searchParams.set('maxrecords', maxrecords);
    url.searchParams.set('sort', 'HybridRel');
    url.searchParams.set('timespan', timespan);

    const data = await getJson(url.toString());
    const articles = Array.isArray(data.articles) ? data.articles.map(normalizeArticle) : [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ articles, source: 'GDELT', query, total: articles.length })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: 'A função Netlify abriu, mas não conseguiu consultar a fonte externa de notícias.',
        detail: error.message,
        dica: 'Faça novo deploy limpando o cache. Se persistir, a fonte GDELT pode estar bloqueando a chamada naquele momento.'
      })
    };
  }
};
