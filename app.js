const statusEl = document.getElementById('status');
const gridEl = document.getElementById('newsGrid');
const featuredEl = document.getElementById('featured');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tabs = document.querySelectorAll('.tab');

let currentQuery = 'Brasil';

function escapeHTML(text = '') {
  return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function formatDate(value){
  if(!value) return '';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
}

function cardTemplate(item){
  const img = item.image || `https://source.unsplash.com/800x500/?news,magazine`;
  return `
    <article class="card">
      <img src="${escapeHTML(img)}" alt="Imagem da notícia" loading="lazy" onerror="this.src='https://source.unsplash.com/800x500/?news'">
      <div class="card-body">
        <span class="source">${escapeHTML(item.source || 'Fonte')}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <div class="meta">${escapeHTML(formatDate(item.publishedAt))}</div>
        <p>${escapeHTML(item.description || 'Clique para ler a matéria completa na fonte original.')}</p>
        <a class="link" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">Ler na fonte</a>
      </div>
    </article>`;
}

function render(items){
  if(!items || !items.length){
    featuredEl.innerHTML = '';
    gridEl.innerHTML = '';
    statusEl.textContent = 'Nenhuma notícia encontrada agora. Tente outra categoria ou busque outro assunto.';
    return;
  }

  const [first, ...rest] = items;
  const firstImg = first.image || `https://source.unsplash.com/1200x700/?news,magazine`;
  featuredEl.innerHTML = `
    <article class="featured-card">
      <img src="${escapeHTML(firstImg)}" alt="Notícia em destaque" onerror="this.src='https://source.unsplash.com/1200x700/?news'">
      <div class="featured-content">
        <span class="source">${escapeHTML(first.source || 'Fonte')}</span>
        <h2>${escapeHTML(first.title)}</h2>
        <div class="meta">${escapeHTML(formatDate(first.publishedAt))}</div>
        <p>${escapeHTML(first.description || 'Leia a matéria completa diretamente na fonte original.')}</p>
        <a class="link" href="${escapeHTML(first.link)}" target="_blank" rel="noopener noreferrer">Ler matéria completa</a>
      </div>
    </article>`;

  gridEl.innerHTML = rest.map(cardTemplate).join('');
  statusEl.textContent = `${items.length} chamadas encontradas para: ${currentQuery}`;
}

async function loadNews(query = currentQuery, force = false){
  currentQuery = query;
  statusEl.textContent = 'Carregando notícias...';
  featuredEl.innerHTML = '';
  gridEl.innerHTML = '';
  try{
    const url = `/.netlify/functions/news?q=${encodeURIComponent(query)}${force ? '&force=1' : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error || 'Erro ao carregar notícias');
    render(data.items || []);
  }catch(err){
    statusEl.textContent = 'Erro ao carregar notícias. Aguarde alguns segundos e tente novamente.';
    console.error(err);
  }
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadNews(btn.dataset.query);
  });
});

searchBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if(q) loadNews(q);
});

searchInput.addEventListener('keydown', e => {
  if(e.key === 'Enter'){
    const q = searchInput.value.trim();
    if(q) loadNews(q);
  }
});

refreshBtn.addEventListener('click', () => loadNews(currentQuery, true));

loadNews();
