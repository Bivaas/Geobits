const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const plain = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function popOf(card) {
  const t = plain($$('dd', card)[1].textContent).replace(/[≈,\s]/g, '');
  const n = parseFloat(t);
  return t.includes('billion') ? n * 1e9 : t.includes('million') ? n * 1e6 : n;
}

const grid  = $('.grid');
const cards = grid ? $$('.card', grid) : [];
cards.forEach((card) => {
  card.dataset.name = $('h3', card).textContent;
  card.dataset.pop  = popOf(card);
  card.dataset.text = plain([$('h3', card), ...$$('dd, details p', card)].map((el) => el.textContent).join(' '));
});


// search up keywords
const search = $('#search');
if (search) {
  const empty = $('.empty');
  const regionOf = () => $('input[name="region"]:checked').id.slice(2);   // "all", "asia", ...
  function applySearch() {
    const q = plain(search.value.trim());
    const region = regionOf();
    let visible = 0;
    cards.forEach((card) => {
      const hit = !q || card.dataset.text.includes(q);
      card.classList.toggle('is-hidden', !hit);
      if (hit && (region === 'all' || card.dataset.r === region)) visible++;
    });
    empty.hidden = visible > 0;
  }
  search.addEventListener('input', applySearch);
  $$('input[name="region"]').forEach((radio) => radio.addEventListener('change', applySearch));
}

// sort with categories
const sort = $(`#sort`);
if (sort) sort.addEventListener('change', () => {
    const order = [...cards];
    if (sort.value === 'name') order.sort((a, b) => a.dataset.name.localCompare(b.dataset.name));
    if (sort.value === 'pop') order.sort((a, b) => b.dataset.pop - a.dataset.pop);
    order.forEach((card) => grid.appendChild(card));
});


$$('.chip[data-r]').forEach((chip) => {
    chip.insertAdjacentHTML('beforeend', ` <small>${cards.filter((c) => c.dataset.r === chip.dataset.r).length}</small>`)
})


const expand = $('#expand-all');
if (expand) expand.addEventListener('click', () => {
    const open = expand.getAttribute('aria-pressed') !== 'true';
    $$('details', grid).forEach((d) => {
        d.open = open;
    });
    expand.setAttribute('aria-pressed', open);
    expand.textContent = open ? 'Hide all facts:' : 'Show all facts:'
});