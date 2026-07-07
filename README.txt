Zynka Magazine v3.0

Novidades:
- Sistema de anúncios próprios.
- Seção "Parceiros do Zynka".
- Anúncio no topo da página.
- Anúncios patrocinados inseridos entre as notícias.
- Rodízio automático de anúncios usando localStorage.
- Arquivo ads.js para editar campanhas sem mexer no app.js.
- Pasta ads/ com imagens SVG provisórias.

Como editar anúncios:
1. Abra o arquivo ads.js.
2. Troque titulo, descricao, botao, link e imagem.
3. Coloque suas imagens dentro da pasta ads/.
4. Use imagens em 1200x628 px sempre que possível.
5. Para desativar um anúncio, altere ativo: true para ativo: false.

Importante:
- Mantenha netlify.toml na raiz.
- Mantenha netlify/functions/news.js no mesmo caminho.
- Depois de subir no GitHub, faça Clear cache and deploy site na Netlify.
