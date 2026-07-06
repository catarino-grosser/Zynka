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
    const query = event.queryStringParameters?.q || 'Brazil OR Brasil';
    const timespan = event.queryStringParameters?.timespan || '3d';
    const maxrecords = event.queryStringParameters?.maxrecords || '18';

    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', query);
    url.searchParams.set('mode', 'ArtList');
    url.searchParams.set('format', 'json');
    url.searchParams.set('maxrecords', maxrecords);
    url.searchParams.set('sort', 'HybridRel');
    url.searchParams.set('timespan', timespan);

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'RevistaDigital/1.1 Netlify Function' }
    });

    const text = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Falha ao consultar notícias.', detail: text.slice(0, 300) })
      };
    }

    return { statusCode: 200, headers, body: text };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno ao buscar notícias.', detail: error.message })
    };
  }
};
