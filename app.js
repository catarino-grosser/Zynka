const noticiasEl = document.getElementById('noticias');
const statusEl = document.getElementById('status');
const buscaEl = document.getElementById('busca');
const btnBuscar = document.getElementById('btnBuscar');
const btnAtualizar = document.getElementById('btnAtualizar');
const botoesCategoria = document.querySelectorAll('.categoria');

let queryAtual = 'Brazil OR Brasil';

function formatarData(dataGdelt) {
  if (!dataGdelt) return 'Data não informada';
  const limpa = String(dataGdelt).replace(/[^0-9]/g, '');
  if (limpa.length < 8) return dataGdelt;
  const ano = limpa.slice(0, 4);
  const mes = limpa.slice(4, 6);
  const dia = limpa.slice(6, 8);
  return `${dia}/${mes}/${ano}`;
}

function imagemFallback() {
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80';
}

function limparTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto || '';
  return div.innerHTML;
}

async function buscarNoticias(query = queryAtual) {
  queryAtual = query;
  noticiasEl.innerHTML = '';
  statusEl.textContent = 'Carregando notícias atuais...';

  const url = new URL('/.netlify/functions/news', window.location.origin);
  url.searchParams.set('q', query);
  url.searchParams.set('maxrecords', '18');
  url.searchParams.set('timespan', '3d');

  try {
    const resposta = await fetch(url.toString());
    if (!resposta.ok) throw new Error('Não foi possível buscar as notícias.');

    const dados = await resposta.json();
    const artigos = dados.articles || [];

    if (!artigos.length) {
      statusEl.textContent = 'Nenhuma notícia encontrada. Tente outro assunto.';
      return;
    }

    statusEl.textContent = `${artigos.length} chamadas encontradas. Clique em “Ler na fonte” para abrir a matéria original.`;

    noticiasEl.innerHTML = artigos.map(artigo => {
      const titulo = limparTexto(artigo.title || 'Sem título');
      const fonte = limparTexto(artigo.domain || 'Fonte não informada');
      const data = formatarData(artigo.seendate);
      const imagem = artigo.socialimage || imagemFallback();
      const link = artigo.url || '#';

      return `
        <article class="card">
          <img src="${imagem}" alt="Imagem da notícia" loading="lazy" onerror="this.src='${imagemFallback()}'" />
          <div class="card-corpo">
            <p class="meta">${fonte} • ${data}</p>
            <h2>${titulo}</h2>
            <a href="${link}" target="_blank" rel="noopener noreferrer">Ler na fonte</a>
          </div>
        </article>
      `;
    }).join('');
  } catch (erro) {
    console.error(erro);
    statusEl.textContent = 'Erro ao carregar notícias. Se estiver testando pelo SPCK/local, publique no Netlify. Esta versão usa uma função Netlify para buscar as notícias sem bloqueio de CORS.';
  }
}

botoesCategoria.forEach(botao => {
  botao.addEventListener('click', () => {
    botoesCategoria.forEach(b => b.classList.remove('ativa'));
    botao.classList.add('ativa');
    buscaEl.value = '';
    buscarNoticias(botao.dataset.query);
  });
});

btnBuscar.addEventListener('click', () => {
  const termo = buscaEl.value.trim();
  if (termo) buscarNoticias(termo);
});

buscaEl.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    const termo = buscaEl.value.trim();
    if (termo) buscarNoticias(termo);
  }
});

btnAtualizar.addEventListener('click', () => buscarNoticias(queryAtual));

buscarNoticias();
