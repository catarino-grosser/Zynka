Revista Digital v1.1

Correção principal:
- As notícias agora passam por uma Netlify Function em /netlify/functions/news.js.
- Isso evita erro de CORS/bloqueio do navegador ao chamar a API GDELT diretamente pelo app.

Como publicar:
1. Envie TODOS os arquivos e pastas para o GitHub/Netlify.
2. A pasta netlify/functions precisa ir junto.
3. O arquivo netlify.toml precisa ficar na raiz do projeto.
4. Depois faça novo deploy no Netlify.

Observação:
- Testando só pelo SPCK/local, as notícias podem não carregar, porque a função Netlify só existe após deploy no Netlify.
