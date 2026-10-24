document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;
  const filterBar = document.querySelector('.filter-bar');
  const search = document.querySelector('[data-menu-search]');
  const result = document.querySelector('[data-menu-result]');
  const categoryIcons = { Coffee: '☕', Meals: '🍽️', Burgers: '🍔', Pasta: '🍝', Desserts: '🍰', Drinks: '🥤' };
  let activeFilter = 'All';

  function getFilterCategories() {
    const categories = Savore.getCategories().concat(Savore.getProducts().map(product => product.category));
    return [...new Set(categories.filter(Boolean))];
  }

  function renderFilters() {
    if (!filterBar) return;
    filterBar.innerHTML = ['All', ...getFilterCategories()].map(category => {
      const label = category === 'All' ? 'All' : `${categoryIcons[category] || '•'} ${category}`;
      const active = category === activeFilter;
      return `<button class="filter-btn${active ? ' active' : ''}" data-filter="${Savore.escapeHtml(category)}" aria-pressed="${active}">${Savore.escapeHtml(label)}</button>`;
    }).join('');
    filterBar.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      render();
    }));
  }

  function render() {
    const query = search?.value.trim().toLowerCase() || '';
    const products = Savore.getProducts().filter(product => {
      const matchesCategory = activeFilter === 'All' || product.category === activeFilter;
      const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return matchesCategory && searchable.includes(query);
    });
    if (result) result.textContent = `${products.length} ${products.length === 1 ? 'item' : 'items'} on the menu`;
    grid.innerHTML = products.map(product => {
      const name = Savore.escapeHtml(product.name);
      const category = Savore.escapeHtml(product.category);
      const description = Savore.escapeHtml(product.description);
      return `
      <article class="product-card ${product.available ? '' : 'sold-out'}">
        <img class="product-image" src="${Savore.escapeHtml(product.image)}" alt="${name}">
        <div class="product-info">
          <div class="eyebrow">${category}</div>
          <h3>${name}</h3>
          <p>${description}</p>
          <div class="product-meta"><span class="price">${Savore.money(product.price)}</span><span class="availability ${product.available ? '' : 'off'}">${product.available ? '✓ Available' : '✕ Sold out'}</span></div>
          <button class="btn btn-green add-product-btn" data-add="${Savore.escapeHtml(product.id)}" ${product.available ? '' : 'disabled'}>${product.available ? '+ Add to cart' : 'Sold out'}</button>
        </div>
      </article>`;
    }).join('') || '<div class="empty-state">No products match that search. Try another dish or category.</div>';
    grid.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => Savore.addToCart(button.dataset.add)));
  }

  search?.addEventListener('input', render);
  renderFilters();
  render();
});
