const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23ff3fa4'/%3E%3Cstop offset='1' stop-color='%237a4dff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='700' fill='%2315121d'/%3E%3Ccircle cx='950' cy='120' r='260' fill='url(%23g)' opacity='.55'/%3E%3Ccircle cx='160' cy='580' r='220' fill='url(%23g)' opacity='.35'/%3E%3Ctext x='70' y='360' fill='%23ffffff' font-family='Arial' font-size='58' font-weight='700'%3EZynka Magazine%3C/text%3E%3Ctext x='72' y='420' fill='%23e8ddff' font-family='Arial' font-size='30'%3ENotícias em destaque%3C/text%3E%3C/svg%3E";

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
  const img = item.image || PLACEHOLDER_IMAGE;
  return `
    <article class="card">
      <img src="${escapeHTML(img)}" alt="Imagem da notícia" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
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
  const firstImg = first.image || PLACEHOLDER_IMAGE;
  featuredEl.innerHTML = `
    <article class="featured-card">
      <img src="${escapeHTML(firstImg)}" alt="Notícia em destaque" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
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
