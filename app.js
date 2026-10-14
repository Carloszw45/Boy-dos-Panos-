'use strict';

const CONTACT = Object.freeze({ whatsapp: '5531994430379', instagram: 'https://www.instagram.com/boydospano/', maps: 'https://maps.app.goo.gl/jgHtzAs4Z8KaJZ1B9' });
const PRODUCTS = Object.freeze([
  {id:'tshirt',name:'Camiseta Oversized',image:'product-tshirt.webp',category:'camisetas',description:'Uma camiseta preta de visual urbano para compor o seu próximo look.'},
  {id:'shorts',name:'Bermuda Cargo',image:'product-shorts.webp',category:'bermudas',description:'Bermuda cargo em tom bege para combinar com peças essenciais.'},
  {id:'sneakers',name:'Tênis Casual',image:'product-sneakers.webp',category:'tenis',description:'Tênis branco de estilo casual para completar a composição.'},
  {id:'jeans',name:'Calça Jeans',image:'product-jeans.webp',category:'calcas',description:'Jeans claro para uma combinação masculina versátil.'},
  {id:'set',name:'Conjunto Urbano',image:'product-set.webp',category:'conjuntos',description:'Camiseta e bermuda pretas em uma inspiração de look completo.'},
  {id:'cap',name:'Boné Preto',image:'product-cap.webp',category:'acessorios',description:'Boné preto para dar o toque final no visual.'}
]);
const LOOKS = Object.freeze([
  {id:'urban',name:'Estilo Urbano',image:'look-urban.webp',description:'Uma combinação de camiseta preta, jeans e acessórios para o seu corre.',products:['tshirt','jeans','cap']},
  {id:'casual',name:'Casual Essencial',image:'look-casual.webp',description:'Tons claros, bermuda e acessórios em uma composição casual.',products:['shorts','sneakers','cap']},
  {id:'set',name:'Conjuntos',image:'look-set.webp',description:'Peças coordenadas para montar um look completo.',products:['set','sneakers']},
  {id:'evening',name:'Rolê de Fim de Semana',image:'look-evening.webp',description:'Preto e acessórios para um visual urbano de fim de semana.',products:['tshirt','jeans','cap']},
  {id:'accessories',name:'Tênis e Acessórios',image:'look-accessories.webp',description:'Os detalhes que completam o seu estilo.',products:['sneakers','jeans','cap']}
]);
const CATEGORY_NAMES = {camisetas:'Camisetas',bermudas:'Bermudas',calcas:'Calças',tenis:'Tênis',acessorios:'Acessórios',conjuntos:'Conjuntos',ofertas:'Ofertas — consulte a loja'};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const whatsappURL = (message) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
const contactLink = (message, label = 'Falar com a loja') => `<a class="button button-orange" target="_blank" rel="noopener noreferrer" href="${whatsappURL(message)}">${escapeHTML(label)}${icon('arrow')}</a>`;
let favorites = new Set();
try { const saved = JSON.parse(localStorage.getItem('boy-panos-favorites') || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(id => PRODUCTS.some(product => product.id === id))); } catch (_) {}
let filter = {category:null,search:''};
let toastTimer;

function productCard(product) {
  return `<article class="product-card" data-product-id="${product.id}"><button class="product-image" type="button" data-product="${product.id}" aria-label="Ver ${product.name}"><img src="assets/${product.image}" width="153" height="165" alt="${product.name}" loading="lazy" decoding="async"></button><div class="product-copy"><div class="product-name-row"><button class="product-name" type="button" data-product="${product.id}">${product.name}</button><button class="product-more" type="button" data-product="${product.id}" aria-label="Mais informações sobre ${product.name}">···</button></div><div class="product-meta"><span>Sob consulta</span><button class="product-favorite" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id)?'Remover dos':'Adicionar aos'} favoritos: ${product.name}" aria-pressed="${favorites.has(product.id)}">${icon('heart')}</button></div></div></article>`;
}
function renderProducts() {
  const visible = PRODUCTS.filter(product => (!filter.category || filter.category === 'ofertas' || product.category === filter.category) && (!filter.search || normalize(`${product.name} ${product.description} ${product.category}`).includes(normalize(filter.search))));
  $('#products-grid').innerHTML = visible.map(productCard).join('');
  const active = !!(filter.category || filter.search);
  $('#filter-status').hidden = !active;
  $('#filter-label').textContent = filter.search ? `Busca: ${filter.search}` : (CATEGORY_NAMES[filter.category] || '');
  $('#no-results').hidden = visible.length > 0;
  updateFavoriteCount();
}
function renderLooks() {
  $('#looks-grid').innerHTML = LOOKS.map(look => `<button type="button" class="look-card" data-look="${look.id}" aria-label="${look.name}: inspire-se"><img src="assets/${look.image}" width="190" height="180" alt="${look.name} — Inspire-se" loading="lazy" decoding="async"><span class="look-caption"><span><strong>${look.name}</strong><small>Inspire-se</small></span><span class="look-arrow">${icon('arrow')}</span></span></button>`).join('');
}
function updateFavoriteCount() {
  const badge = $('.favorite-count'); badge.textContent = favorites.size; badge.hidden = favorites.size === 0;
}
function showToast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}
function toggleFavorite(id) {
  const product = PRODUCTS.find(item => item.id === id); if (!product) return;
  const added = !favorites.has(id); if (added) favorites.add(id); else favorites.delete(id);
  try { localStorage.setItem('boy-panos-favorites',JSON.stringify([...favorites])); } catch (_) {}
  renderProducts();
  showToast(added ? `${product.name} salvo nos favoritos.` : `${product.name} removido dos favoritos.`);
}
const dialog = $('#detail-dialog');
function openDialog(content) { $('#dialog-content').innerHTML = content; if (!dialog.open) dialog.showModal(); }
function savedList(products) { return `<div class="saved-list">${products.map(product => `<button class="saved-item" type="button" data-product="${product.id}"><img src="assets/${product.image}" width="62" height="64" alt=""><span><strong>${product.name}</strong><small>Sob consulta</small></span>${icon('arrow')}</button>`).join('')}</div>`; }
function openProduct(id) {
  const product = PRODUCTS.find(item => item.id === id); if (!product) return;
  openDialog(`<img class="dialog-image" src="assets/${product.image}" width="153" height="165" alt="${product.name}"><h2 id="dialog-title">${product.name}</h2><p class="dialog-price">Sob consulta</p><p>${product.description}</p><p class="dialog-small">Imagem ilustrativa do esboço. Consulte modelos, tamanhos, cores e disponibilidade com a loja.</p><div class="dialog-actions">${contactLink(`Olá, Boy dos Panos! Gostaria de consultar ${product.name}, tamanhos, cores e preço.`,'Consultar no WhatsApp')}</div>`);
}
function openLook(id) {
  const look = LOOKS.find(item => item.id === id); if (!look) return;
  openDialog(`<img class="dialog-image" src="assets/${look.image}" width="190" height="180" alt="${look.name}"><h2 id="dialog-title">${look.name}</h2><p>${look.description}</p><p class="dialog-small">Inspiração de estilo. Consulte as peças disponíveis na loja.</p>${savedList(PRODUCTS.filter(product => look.products.includes(product.id)))}<div class="dialog-actions">${contactLink(`Olá, Boy dos Panos! Gostei da inspiração ${look.name}. Quais peças vocês têm disponíveis para esse look?`,'Consultar esse look')}</div>`);
}
function openFavorites() {
  const saved = PRODUCTS.filter(product => favorites.has(product.id));
  openDialog(`<h2 id="dialog-title">Minha seleção</h2><p>${saved.length ? 'Seus favoritos para o próximo look.' : 'Toque no coração de uma peça para guardar seus favoritos aqui.'}</p>${savedList(saved)}<div class="dialog-actions">${saved.length ? contactLink(`Olá, Boy dos Panos! Gostaria de consultar estas peças: ${saved.map(product => product.name).join(', ')}.`,'Consultar minha seleção') : '<button type="button" class="button button-orange" data-close>Explorar a coleção</button>'}</div>`);
}
function openInfo(key) {
  const information = {
    store: ['Nossa loja','Boy dos Panos · Nova Contagem, Contagem — MG.','Rua VL-6, 554A · Nova Contagem. Consulte o horário de atendimento antes de visitar.','Olá, Boy dos Panos! Gostaria de confirmar o endereço e o horário de atendimento.'],
    delivery: ['Como receber','Combine com a loja a melhor maneira de receber seu próximo look.','Consulte retirada, opções de entrega, regiões atendidas e eventuais custos.','Olá, Boy dos Panos! Quais são as opções de entrega e retirada?'],
    payment: ['Pagamento','Consulte as formas de pagamento diretamente com a loja.','Preços e condições serão confirmados no atendimento.','Olá, Boy dos Panos! Quais formas de pagamento vocês aceitam?'],
    returns: ['Trocas','Consulte as condições de troca antes de concluir seu pedido.','A loja confirma os prazos e os procedimentos aplicáveis.','Olá, Boy dos Panos! Gostaria de conhecer as condições de troca.'],
    contact: ['Fale com a Boy','Precisa de ajuda para montar seu look?','Fale com a loja para consultar peças, tamanhos e valores.','Olá, Boy dos Panos! Quero conhecer a coleção e montar meu próximo look.']
  };
  const info = information[key] || information.contact;
  openDialog(`<h2 id="dialog-title">${info[0]}</h2><p>${info[1]}</p><p>${info[2]}</p><div class="dialog-actions">${contactLink(info[3])}${key === 'store' ? `<a class="button button-outline" href="${CONTACT.maps}" target="_blank" rel="noopener noreferrer">Como chegar${icon('pin')}</a>` : ''}</div>`);
}
function applyCategory(category) {
  filter = {category,search:''}; $('#search-input').value = '';
  $$('.category-navigation button').forEach(button => button.classList.toggle('active',button.dataset.category === category));
  renderProducts(); $('#colecao').scrollIntoView({behavior:'smooth',block:'start'});
}
function clearFilters() {
  filter = {category:null,search:''}; $('#search-input').value = '';
  $$('.category-navigation button').forEach(button => button.classList.toggle('active',button.dataset.category === 'camisetas'));
  renderProducts();
}
document.addEventListener('click',event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.favorite) toggleFavorite(button.dataset.favorite);
  else if (button.dataset.product) openProduct(button.dataset.product);
  else if (button.dataset.look) openLook(button.dataset.look);
  else if (button.dataset.category) applyCategory(button.dataset.category);
  else if (button.dataset.info) openInfo(button.dataset.info);
  else if (button.hasAttribute('data-favorites') || button.hasAttribute('data-account')) openFavorites();
  else if (button.hasAttribute('data-close') || button.classList.contains('dialog-close')) { dialog.close(); if (button.hasAttribute('data-close')) $('#colecao').scrollIntoView({behavior:'smooth'}); }
  else if (button.hasAttribute('data-more-looks')) openDialog(`<h2 id="dialog-title">Inspiração para o seu próximo look</h2><p>Explore todas as composições do esboço e consulte a loja para encontrar as peças.</p><div class="saved-list">${LOOKS.map(look => `<button class="saved-item" type="button" data-look="${look.id}"><img src="assets/${look.image}" width="62" height="64" alt=""><span><strong>${look.name}</strong><small>Inspire-se</small></span>${icon('arrow')}</button>`).join('')}</div>`);
  else if (button.dataset.social) openDialog(`<h2 id="dialog-title">Boy dos Panos no ${escapeHTML(button.dataset.social)}</h2><p>Consulte com a loja o endereço do perfil oficial nesse canal.</p><div class="dialog-actions">${contactLink(`Olá, Boy dos Panos! Qual é o perfil oficial de vocês no ${button.dataset.social}?`,'Consultar perfil oficial')}<a class="button button-outline" href="${CONTACT.instagram}" target="_blank" rel="noopener noreferrer">Instagram${icon('instagram')}</a></div>`);
});
$('#search-form').addEventListener('submit',event => { event.preventDefault(); filter = {category:null,search:$('#search-input').value.trim()}; renderProducts(); $('#colecao').scrollIntoView({behavior:'smooth'}); });
$('#search-input').addEventListener('search',() => { if (!$('#search-input').value) clearFilters(); });
$('#view-all').addEventListener('click',clearFilters);
$('#clear-filter').addEventListener('click',clearFilters);
dialog.addEventListener('click',event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
$('#newsletter-form').addEventListener('submit',event => { event.preventDefault(); const email = $('#newsletter-email').value.trim(); if (!$('#newsletter-form').checkValidity()) return; openDialog(`<h2 id="dialog-title">Novidades no seu estilo</h2><p>Envie seu e-mail à loja para consultar o recebimento de novidades e lançamentos.</p><p><strong>${escapeHTML(email)}</strong></p><p class="dialog-small">O recebimento de novidades será confirmado pela Boy dos Panos.</p><div class="dialog-actions">${contactLink(`Olá, Boy dos Panos! Quero receber novidades e lançamentos. Meu e-mail é ${email}. Podem confirmar como funciona?`,'Enviar à loja')}</div>`); });
const SLIDES = [{title:'Seu estilo.',accent:'Seu corre.',description:'Moda masculina para<br class="desktop-break"> acompanhar seu ritmo.',action:'Ver coleção'},{title:'Seu look.',accent:'Sua escolha.',description:'Encontre inspiração para<br class="desktop-break"> o seu próximo look.',action:'Ver coleção'}];
let slideIndex = 0;
function changeSlide(index) { slideIndex = (index + SLIDES.length) % SLIDES.length; const slide = SLIDES[slideIndex]; $('#hero-title').textContent = slide.title; $('#hero-accent').textContent = slide.accent; $('#hero-description').innerHTML = slide.description; $$('.hero-dot').forEach((dot,index) => dot.setAttribute('aria-current',String(index === slideIndex))); }
$$('[data-slide]').forEach(button => button.addEventListener('click',() => changeSlide(slideIndex + Number(button.dataset.slide))));
$$('[data-slide-index]').forEach(button => button.addEventListener('click',() => changeSlide(Number(button.dataset.slideIndex))));
renderProducts(); renderLooks();
