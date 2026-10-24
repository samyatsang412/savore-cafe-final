/* ------------------------------------------------------------------
   Savore Café — hash-routed administrator dashboard
   Reachable at: /#/admin, /#/admin/orders, /#/admin/products,
                 /#/admin/categories, /#/admin/users
------------------------------------------------------------------- */
(() => {
  'use strict';

  const PAGES = {
    dashboard: { title: 'Dashboard', eyebrow: 'Overview' },
    orders: { title: 'Orders', eyebrow: 'Operations' },
    products: { title: 'Products', eyebrow: 'Catalog' },
    categories: { title: 'Categories', eyebrow: 'Catalog' },
    users: { title: 'Users', eyebrow: 'People' }
  };

  const ICON = {
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z"/></svg>',
    orders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Zm2 5h6v2H9V8Zm0 4h6v2H9v-2Z"/></svg>',
    products: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l2 5v2h-1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10H4V8l2-5Zm2.2 2-1 3h9.6l-1-3H8.2ZM7 12v7h10v-7H7Z"/></svg>',
    categories: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z"/></svg>'
  };

  const NAV_ITEMS = [
    { page: 'dashboard', label: 'Dashboard', href: '#/admin' },
    { page: 'orders', label: 'Orders', href: '#/admin/orders', badge: true },
    { page: 'products', label: 'Products', href: '#/admin/products' },
    { page: 'categories', label: 'Categories', href: '#/admin/categories' },
    { page: 'users', label: 'Users', href: '#/admin/users' }
  ];

  const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const ROLES = ['Customer', 'Staff', 'Administrator'];
  const state = {
    productQuery: '',
    orderQuery: '',
    orderFilter: 'All',
    userQuery: ''
  };

  let root = null;
  let view = null;
  let modal = null;
  let currentUser = null;
  let originalTitle = '';
  let originalHash = '';

  const escape = value => Savore.escapeHtml(value);
  const money = value => Savore.money(value);
  const statusClass = value => Savore.statusClass(value);
  const isAdminRoute = () => /^#\/admin(?:\/|$)/.test(location.hash);

  function initials(name) {
    const parts = String(name || 'A').trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || 'A') + (parts[1]?.[0] || '');
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getRoutePage() {
    const raw = location.hash.replace(/^#\/admin\/?/, '').split('?')[0];
    const page = raw.split('/')[0];
    return Object.prototype.hasOwnProperty.call(PAGES, page) ? page : 'dashboard';
  }

  function isAdminUser(user) {
    return Boolean(user && user.role === 'Administrator' && (!user.status || user.status === 'Active'));
  }

  function start() {
    originalTitle = document.title;
    originalHash = location.hash;
    window.addEventListener('hashchange', handleHashChange);

    if (!isAdminRoute()) return;

    const user = Savore.getCurrentUser();
    if (!isAdminUser(user)) {
      const next = location.hash || '#/admin';
      location.replace(`login.html?next=${encodeURIComponent(next)}&reason=admin`);
      return;
    }

    currentUser = user;
    mount();
  }

  function handleHashChange() {
    if (isAdminRoute()) {
      if (!root) {
        const user = Savore.getCurrentUser();
        if (!isAdminUser(user)) {
          const next = location.hash || '#/admin';
          location.replace(`login.html?next=${encodeURIComponent(next)}&reason=admin`);
          return;
        }
        currentUser = user;
        mount();
      } else {
        renderRoute();
      }
      return;
    }

    if (root) unmount();
  }

  function mount() {
    originalHash = location.hash;
    document.body.classList.add('admin-active');

    root = document.createElement('div');
    root.id = 'admin-app';
    root.className = 'admin-app';
    root.innerHTML = `
      <aside class="admin-sidebar">
        <a class="admin-brand" href="#/admin">
          <span class="brand-mark">S</span>
          <span><strong>SAVORE</strong><small>Admin workspace</small></span>
        </a>
        <nav class="admin-nav" aria-label="Admin sections">
          <span class="admin-nav-label">Manage</span>
          ${NAV_ITEMS.map(item => `
            <a href="${item.href}" data-admin-nav="${item.page}">
              ${ICON[item.page]}
              <span>${item.label}</span>
              ${item.badge ? '<span class="nav-badge" data-nav-badge="orders" hidden>0</span>' : ''}
            </a>`).join('')}
        </nav>
        <div class="admin-sidebar-footer">
          <a href="index.html">← Back to storefront</a>
          <span>Changes save to this browser instantly.</span>
        </div>
      </aside>
      <div class="admin-frame">
        <header class="admin-topbar">
          <button type="button" class="admin-menu-btn" data-sidebar-toggle aria-label="Toggle admin menu">☰</button>
          <div class="admin-topbar-title">
            <span class="eyebrow">Savore admin</span>
            <h1 data-admin-title>Dashboard</h1>
          </div>
          <div class="admin-account">
            <div class="admin-avatar" data-admin-avatar>${escape(initials(currentUser.name))}</div>
            <div class="admin-account-copy">
              <strong data-admin-name>${escape(currentUser.name)}</strong>
              <span>Administrator</span>
            </div>
            <button type="button" class="btn btn-light" data-admin-logout>Log out</button>
          </div>
        </header>
        <main class="admin-view" id="admin-view"></main>
      </div>
      <div class="admin-modal" id="admin-modal" hidden></div>`;

    document.body.appendChild(root);
    view = root.querySelector('#admin-view');
    modal = root.querySelector('#admin-modal');

    root.querySelector('[data-sidebar-toggle]')?.addEventListener('click', () => {
      root.classList.toggle('sidebar-open');
    });

    root.querySelectorAll('.admin-nav a').forEach(link => {
      link.addEventListener('click', () => root.classList.remove('sidebar-open'));
    });

    root.querySelector('[data-admin-logout]')?.addEventListener('click', () => Savore.logoutUser());

    modal.addEventListener('click', event => {
      if (event.target === modal || event.target.closest('[data-modal-close]')) closeModal();
    });

    document.addEventListener('keydown', handleModalKeydown);
    renderRoute();
  }

  function unmount() {
    document.removeEventListener('keydown', handleModalKeydown);
    document.body.classList.remove('admin-active');
    root?.remove();
    root = null;
    view = null;
    modal = null;
    document.title = originalTitle;
    if (originalHash && location.hash !== originalHash) {
      // Keep the browser on the normal site; no forced reload needed.
    }
  }

  function handleModalKeydown(event) {
    if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
  }

  function renderRoute() {
    const page = getRoutePage();
    const meta = PAGES[page];

    root.querySelector('[data-admin-title]').textContent = meta.title;
    document.title = `${meta.title} | Savore Admin`;
    root.querySelectorAll('[data-admin-nav]').forEach(link => {
      link.classList.toggle('active', link.dataset.adminNav === page);
    });
    updateNavBadge();

    if (page === 'orders') renderOrdersPage();
    else if (page === 'products') renderProductsPage();
    else if (page === 'categories') renderCategoriesPage();
    else if (page === 'users') renderUsersPage();
    else renderDashboard();
  }

  function updateNavBadge() {
    const badge = root?.querySelector('[data-nav-badge="orders"]');
    if (!badge) return;
    const pending = Savore.getOrders().filter(order => order.status === 'Pending').length;
    badge.textContent = String(pending);
    badge.hidden = pending === 0;
  }

  function updateAccountChip() {
    if (!root || !currentUser) return;
    const name = root.querySelector('[data-admin-name]');
    const avatar = root.querySelector('[data-admin-avatar]');
    if (name) name.textContent = currentUser.name;
    if (avatar) avatar.textContent = initials(currentUser.name);
  }

  /* ------------------------------- Dashboard ------------------------------ */
  function renderDashboard() {
    const orders = Savore.getOrders();
    const products = Savore.getProducts();
    const users = Savore.getUsers();
    const completedOrders = orders.filter(order => order.status === 'Completed');
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    const todayKey = new Date().toDateString();
    const todayOrders = orders.filter(order => new Date(order.date).toDateString() === todayKey);
    const revenue = completedOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const customers = users.filter(user => user.role === 'Customer');
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
    const sellers = getTopSellers(orders);
    const maxSellerQuantity = Math.max(1, ...sellers.map(item => item.quantity));

    view.innerHTML = `
      <section class="admin-page">
        <div class="admin-page-head">
          <div>
            <div class="eyebrow">Overview</div>
            <h2>Good day, ${escape(String(currentUser.name || 'Admin').split(/\s+/)[0])}.</h2>
            <p>Here is what is happening at Savore Café today. ${todayOrders.length} order${todayOrders.length === 1 ? '' : 's'} so far.</p>
          </div>
          <div class="admin-page-actions">
            <a class="btn btn-green" href="#/admin/products">Manage menu</a>
            <a class="btn btn-light" href="#/admin/orders">View orders</a>
          </div>
        </div>

        <div class="admin-stats">
          <div class="admin-stat highlight">
            <span class="admin-stat-label">Completed revenue</span>
            <strong>${money(revenue)}</strong>
            <small>${completedOrders.length} completed order${completedOrders.length === 1 ? '' : 's'}</small>
          </div>
          <div class="admin-stat">
            <span class="admin-stat-label">Total orders</span>
            <strong>${orders.length}</strong>
            <small>${todayOrders.length} placed today</small>
          </div>
          <div class="admin-stat">
            <span class="admin-stat-label">Pending orders</span>
            <strong>${pendingOrders.length}</strong>
            <small>${orders.filter(order => order.status === 'Preparing').length} currently preparing</small>
          </div>
          <div class="admin-stat">
            <span class="admin-stat-label">Menu products</span>
            <strong>${products.length}</strong>
            <small>${products.filter(product => product.available).length} available · ${products.filter(product => !product.available).length} sold out</small>
          </div>
        </div>

        <div class="admin-grid">
          <div class="admin-panel span-8">
            <div class="admin-panel-head">
              <div><h3>Recent orders</h3><p>The latest activity from your customers.</p></div>
              <a href="#/admin/orders">All orders →</a>
            </div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${recentOrders.map(order => `
                    <tr>
                      <td><strong>${escape(order.id)}</strong><br><small class="muted">${formatDateTime(order.date)}</small></td>
                      <td>${escape(order.customer || 'Guest')}</td>
                      <td><strong>${money(order.total)}</strong></td>
                      <td><span class="admin-pill ${statusClass(order.status)}">${escape(order.status)}</span></td>
                      <td><button type="button" class="admin-btn" data-order-view="${escape(order.id)}">View</button></td>
                    </tr>`).join('') || `
                    <tr><td colspan="5"><div class="admin-empty"><strong>No orders yet</strong><p>New orders will appear here as soon as a customer checks out.</p></div></td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <div class="admin-panel span-4">
            <div class="admin-panel-head">
              <div><h3>Top sellers</h3><p>By quantity ordered.</p></div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-sellers">
                ${sellers.map(item => `
                  <div class="admin-seller">
                    <strong>${escape(item.name)}</strong>
                    <small>${item.quantity} sold</small>
                    <div class="admin-progress"><span style="width:${Math.max(6, Math.round((item.quantity / maxSellerQuantity) * 100))}%"></span></div>
                  </div>`).join('') || '<p class="muted">No sales data yet.</p>'}
              </div>
            </div>
          </div>
        </div>

        <div class="admin-grid">
          <div class="admin-panel span-6">
            <div class="admin-panel-head">
              <div><h3>Order pipeline</h3><p>Where every order is right now.</p></div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-pipeline">
                ${ORDER_STATUSES.map(status => {
                  const count = orders.filter(order => order.status === status).length;
                  const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
                  return `<div class="admin-pipeline-row">
                    <div class="admin-pipeline-meta"><span>${status}</span><strong>${count}</strong></div>
                    <div class="admin-progress"><span style="width:${percent}%"></span></div>
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="admin-panel span-6">
            <div class="admin-panel-head">
              <div><h3>Quick actions</h3><p>Everything you need, one click away.</p></div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-quick-links">
                <a class="admin-quick-link" href="#/admin/products"><strong>Add a product</strong><span>Grow the menu</span></a>
                <a class="admin-quick-link" href="#/admin/categories"><strong>Organize categories</strong><span>Keep the menu tidy</span></a>
                <a class="admin-quick-link" href="#/admin/users"><strong>Manage accounts</strong><span>${customers.length} customer${customers.length === 1 ? '' : 's'}</span></a>
                <a class="admin-quick-link" href="index.html"><strong>View storefront</strong><span>See what customers see</span></a>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-note"><strong>Demo workspace:</strong> products, orders, and accounts are stored in this browser's localStorage. Open this same browser to keep the data between visits.</div>
      </section>`;

    view.querySelectorAll('[data-order-view]').forEach(button => {
      button.addEventListener('click', () => openOrderDetails(button.dataset.orderView));
    });
  }

  function getTopSellers(orders) {
    const totals = new Map();
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.name || 'Unknown item';
        const entry = totals.get(name) || { name, quantity: 0, revenue: 0 };
        entry.quantity += Number(item.quantity) || 0;
        entry.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
        totals.set(name, entry);
      });
    });
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }

  /* -------------------------------- Products ------------------------------ */
  function renderProductsPage() {
    view.innerHTML = `
      <section class="admin-page">
        <div class="admin-page-head">
          <div>
            <div class="eyebrow">Catalog</div>
            <h2>Products</h2>
            <p>Add dishes, update prices, and mark items as sold out. Everything here appears on the customer menu immediately.</p>
          </div>
          <div class="admin-page-actions">
            <button type="button" class="btn btn-green" data-add-product>Add product</button>
          </div>
        </div>

        <div class="admin-panel">
          <div class="admin-toolbar">
            <label class="admin-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 0 3.5 10.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg>
              <input type="search" placeholder="Search products by name, category, or description" data-product-search value="${escape(state.productQuery)}">
            </label>
            <span class="admin-count" data-product-count></span>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
              <tbody data-products-body></tbody>
            </table>
          </div>
        </div>
      </section>`;

    const search = view.querySelector('[data-product-search]');
    search.addEventListener('input', () => {
      state.productQuery = search.value;
      refreshProductsTable();
    });

    view.querySelector('[data-add-product]')?.addEventListener('click', () => openProductForm(null));

    view.querySelector('[data-products-body]').addEventListener('click', event => {
      const editButton = event.target.closest('[data-product-edit]');
      if (editButton) {
        const product = Savore.getProducts().find(item => String(item.id) === editButton.dataset.productEdit);
        if (product) openProductForm(product);
        return;
      }

      const toggleButton = event.target.closest('[data-product-toggle]');
      if (toggleButton) {
        const products = Savore.getProducts();
        const product = products.find(item => String(item.id) === toggleButton.dataset.productToggle);
        if (!product) return;
        product.available = product.available === false;
        Savore.writeStore(Savore.SAVORE_KEY.products, products);
        Savore.showToast(`${product.name} is now ${product.available ? 'available' : 'sold out'}.`);
        refreshProductsTable();
        return;
      }

      const deleteButton = event.target.closest('[data-product-delete]');
      if (!deleteButton) return;
      const products = Savore.getProducts();
      const product = products.find(item => String(item.id) === deleteButton.dataset.productDelete);
      if (!product || !confirm(`Delete "${product.name}" from the menu?`)) return;
      Savore.writeStore(Savore.SAVORE_KEY.products, products.filter(item => String(item.id) !== String(product.id)));
      Savore.showToast(`${product.name} deleted.`);
      refreshProductsTable();
    });

    refreshProductsTable();
  }

  function refreshProductsTable() {
    const body = view?.querySelector('[data-products-body]');
    const count = view?.querySelector('[data-product-count]');
    if (!body) return;

    const products = Savore.getProducts();
    const query = state.productQuery.trim().toLowerCase();
    const filtered = products.filter(product =>
      [product.name, product.category, product.description]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );

    if (count) count.textContent = `${filtered.length} of ${products.length} products`;

    body.innerHTML = filtered.map(product => `
      <tr>
        <td>
          <div class="cell-main">
            <img src="${escape(product.image || Savore.defaultProducts[0].image)}" alt="" loading="lazy">
            <div>
              <strong>${escape(product.name)}</strong>
              <small title="${escape(product.description)}">${escape(product.description)}</small>
            </div>
          </div>
        </td>
        <td>${escape(product.category)}</td>
        <td><strong>${money(product.price)}</strong></td>
        <td>
          <button type="button" class="admin-btn ${product.available ? '' : 'danger'}" data-product-toggle="${escape(product.id)}">
            ${product.available ? 'Available' : 'Sold out'}
          </button>
        </td>
        <td>
          <div class="row-actions">
            <button type="button" class="admin-btn" data-product-edit="${escape(product.id)}">Edit</button>
            <button type="button" class="admin-btn danger" data-product-delete="${escape(product.id)}">Delete</button>
          </div>
        </td>
      </tr>`).join('') || `
      <tr><td colspan="5"><div class="admin-empty"><strong>No products found</strong><p>Try a different search, or add a new product to the menu.</p><button type="button" class="btn btn-green" data-add-product-empty>Add product</button></div></td></tr>`;

    body.querySelector('[data-add-product-empty]')?.addEventListener('click', () => openProductForm(null));
  }

  function openProductForm(product) {
    const categories = Savore.getCategories();
    const isEditing = Boolean(product);
    const body = `
      <div class="form-grid">
        <div class="field full">
          <label for="admin-product-name">Product name</label>
          <input id="admin-product-name" name="name" maxlength="80" required value="${escape(product?.name || '')}">
        </div>
        <div class="field">
          <label for="admin-product-category">Category</label>
          <input id="admin-product-category" name="category" list="admin-category-options" required value="${escape(product?.category || '')}">
          <datalist id="admin-category-options">${categories.map(category => `<option value="${escape(category)}"></option>`).join('')}</datalist>
        </div>
        <div class="field">
          <label for="admin-product-price">Price (₱)</label>
          <input id="admin-product-price" name="price" type="number" min="1" step="0.01" required value="${escape(product?.price ?? '')}">
        </div>
        <div class="field full">
          <label for="admin-product-image">Image URL</label>
          <input id="admin-product-image" name="image" type="url" placeholder="https://…" value="${escape(product?.image || '')}">
        </div>
        <div class="field full">
          <label for="admin-product-description">Description</label>
          <textarea id="admin-product-description" name="description" required>${escape(product?.description || '')}</textarea>
        </div>
        <label class="admin-check">
          <input name="available" type="checkbox" ${product?.available === false ? '' : 'checked'}> Available for ordering
        </label>
      </div>`;

    openFormModal({
      title: isEditing ? 'Edit product' : 'Add product',
      subtitle: isEditing ? 'Update this item on the customer menu.' : 'Create a new item for the Savore menu.',
      submitLabel: isEditing ? 'Save changes' : 'Add product',
      body,
      onSubmit: data => {
        const name = String(data.get('name') || '').trim();
        const categoryInput = String(data.get('category') || '').trim();
        const description = String(data.get('description') || '').trim();
        const price = Number(data.get('price'));
        const image = String(data.get('image') || '').trim();

        if (!name || !categoryInput || !description || !Number.isFinite(price) || price <= 0) {
          alert('Please enter a name, category, description, and a price greater than zero.');
          return;
        }

        const categoriesNow = Savore.getCategories();
        const matchingCategory = categoriesNow.find(item => item.toLowerCase() === categoryInput.toLowerCase());
        const category = matchingCategory || categoryInput;

        if (!matchingCategory) {
          categoriesNow.push(category);
          Savore.writeStore(Savore.SAVORE_KEY.categories, categoriesNow);
        }

        const products = Savore.getProducts();
        const updated = {
          name,
          category,
          description,
          price,
          image: image || product?.image || Savore.defaultProducts[0].image,
          available: data.get('available') === 'on'
        };

        if (isEditing) {
          const index = products.findIndex(item => String(item.id) === String(product.id));
          if (index !== -1) products[index] = { ...products[index], ...updated };
        } else {
          products.push({ id: Date.now(), ...updated });
        }

        Savore.writeStore(Savore.SAVORE_KEY.products, products);
        closeModal();
        Savore.showToast(isEditing ? `${name} updated.` : `${name} added to the menu.`);
        refreshProductsTable();
      }
    });
  }

  /* ------------------------------- Categories ----------------------------- */
  function renderCategoriesPage() {
    const products = Savore.getProducts();
    const categories = Savore.getCategories();

    view.innerHTML = `
      <section class="admin-page">
        <div class="admin-page-head">
          <div>
            <div class="eyebrow">Catalog</div>
            <h2>Categories</h2>
            <p>Group the menu into sections customers can browse. Renaming a category updates every product inside it.</p>
          </div>
          <div class="admin-page-actions">
            <button type="button" class="btn btn-green" data-add-category>Add category</button>
          </div>
        </div>

        <div class="admin-panel">
          <div class="admin-panel-head">
            <div><h3>Menu sections</h3><p>${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} in use.</p></div>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Category</th><th>Products</th><th>Actions</th></tr></thead>
              <tbody>
                ${categories.map(category => {
                  const count = products.filter(product => product.category === category).length;
                  return `<tr>
                    <td><strong>${escape(category)}</strong></td>
                    <td>${count} product${count === 1 ? '' : 's'}</td>
                    <td>
                      <div class="row-actions">
                        <button type="button" class="admin-btn" data-category-edit="${escape(category)}">Rename</button>
                        <button type="button" class="admin-btn danger" data-category-delete="${escape(category)}">Delete</button>
                      </div>
                    </td>
                  </tr>`;
                }).join('') || '<tr><td colspan="3"><div class="admin-empty"><strong>No categories yet</strong><p>Add your first category to start organizing the menu.</p></div></td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </section>`;

    view.querySelector('[data-add-category]')?.addEventListener('click', () => openCategoryForm(null));

    view.querySelector('tbody').addEventListener('click', event => {
      const editButton = event.target.closest('[data-category-edit]');
      if (editButton) {
        openCategoryForm(editButton.dataset.categoryEdit);
        return;
      }

      const deleteButton = event.target.closest('[data-category-delete]');
      if (!deleteButton) return;
      const category = deleteButton.dataset.categoryDelete;
      const used = Savore.getProducts().filter(product => product.category === category).length;
      if (used) {
        alert(`"${category}" is used by ${used} product${used === 1 ? '' : 's'}. Move or delete those products first.`);
        return;
      }
      if (!confirm(`Delete the "${category}" category?`)) return;
      Savore.writeStore(Savore.SAVORE_KEY.categories, Savore.getCategories().filter(item => item !== category));
      Savore.showToast(`"${category}" deleted.`);
      renderCategoriesPage();
    });
  }

  function openCategoryForm(category) {
    const isEditing = Boolean(category);
    const body = `
      <div class="field">
        <label for="admin-category-name">Category name</label>
        <input id="admin-category-name" name="category" maxlength="40" required value="${escape(category || '')}">
      </div>`;

    openFormModal({
      title: isEditing ? 'Rename category' : 'Add category',
      subtitle: isEditing ? 'Every product in this section will be updated.' : 'Create a new section for the menu.',
      submitLabel: isEditing ? 'Save changes' : 'Add category',
      body,
      onSubmit: data => {
        const name = String(data.get('category') || '').trim();
        if (!name) return;

        const categories = Savore.getCategories();
        const duplicate = categories.some(item =>
          item.toLowerCase() === name.toLowerCase() && (!isEditing || item !== category)
        );
        if (duplicate) {
          alert('A category with that name already exists.');
          return;
        }

        if (isEditing) {
          const index = categories.findIndex(item => item === category);
          if (index === -1) return;
          categories[index] = name;
          const products = Savore.getProducts();
          products.forEach(product => {
            if (product.category === category) product.category = name;
          });
          Savore.writeStore(Savore.SAVORE_KEY.products, products);
        } else {
          categories.push(name);
        }

        Savore.writeStore(Savore.SAVORE_KEY.categories, categories);
        closeModal();
        Savore.showToast(isEditing ? `Category renamed to "${name}".` : `"${name}" added.`);
        renderCategoriesPage();
      }
    });
  }

  /* --------------------------------- Orders ------------------------------- */
  function renderOrdersPage() {
    view.innerHTML = `
      <section class="admin-page">
        <div class="admin-page-head">
          <div>
            <div class="eyebrow">Operations</div>
            <h2>Orders</h2>
            <p>Follow every order from the first click to pickup. Status changes are visible to customers on the tracking page.</p>
          </div>
        </div>

        <div class="admin-panel">
          <div class="admin-toolbar">
            <div class="admin-filter-tabs" data-order-filters>
              ${['All', ...ORDER_STATUSES].map(status => `
                <button type="button" data-order-filter="${status}" class="${state.orderFilter === status ? 'active' : ''}">${status}</button>`).join('')}
            </div>
            <label class="admin-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 0 3.5 10.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg>
              <input type="search" placeholder="Search by order number, customer, or email" data-order-search value="${escape(state.orderQuery)}">
            </label>
            <span class="admin-count" data-order-count></span>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody data-orders-body></tbody>
            </table>
          </div>
        </div>
      </section>`;

    view.querySelector('[data-order-filters]').addEventListener('click', event => {
      const button = event.target.closest('[data-order-filter]');
      if (!button) return;
      state.orderFilter = button.dataset.orderFilter;
      view.querySelectorAll('[data-order-filter]').forEach(item => {
        item.classList.toggle('active', item.dataset.orderFilter === state.orderFilter);
      });
      refreshOrdersTable();
    });

    const search = view.querySelector('[data-order-search]');
    search.addEventListener('input', () => {
      state.orderQuery = search.value;
      refreshOrdersTable();
    });

    const body = view.querySelector('[data-orders-body]');
    body.addEventListener('change', event => {
      const select = event.target.closest('[data-order-status]');
      if (!select) return;
      const orders = Savore.getOrders();
      const order = orders.find(item => String(item.id) === select.dataset.orderStatus);
      if (!order) return;
      order.status = select.value;
      Savore.writeStore(Savore.SAVORE_KEY.orders, orders);
      Savore.showToast(`${order.id} marked as ${order.status.toLowerCase()}.`);
      updateNavBadge();
      refreshOrdersTable();
    });

    body.addEventListener('click', event => {
      const viewButton = event.target.closest('[data-order-view]');
      if (viewButton) openOrderDetails(viewButton.dataset.orderView);
    });

    refreshOrdersTable();
  }

  function refreshOrdersTable() {
    const body = view?.querySelector('[data-orders-body]');
    const count = view?.querySelector('[data-order-count]');
    if (!body) return;

    const query = state.orderQuery.trim().toLowerCase();
    const orders = [...Savore.getOrders()]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(order => state.orderFilter === 'All' || order.status === state.orderFilter)
      .filter(order => !query || [order.id, order.customer, order.email, order.contact]
        .join(' ')
        .toLowerCase()
        .includes(query));

    if (count) count.textContent = `${orders.length} order${orders.length === 1 ? '' : 's'}`;

    body.innerHTML = orders.map(order => {
      const itemCount = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      return `<tr>
        <td><strong>${escape(order.id)}</strong><br><small class="muted">${formatDateTime(order.date)}</small></td>
        <td>${escape(order.customer || 'Guest')}<br><small class="muted">${escape(order.email || order.contact || '')}</small></td>
        <td>${itemCount} item${itemCount === 1 ? '' : 's'}<br><small class="muted">${escape((order.items || []).map(item => `${item.name} x${item.quantity}`).join(', '))}</small></td>
        <td><strong>${money(order.total)}</strong></td>
        <td>
          <select class="admin-select" data-order-status="${escape(order.id)}" aria-label="Status for ${escape(order.id)}">
            ${ORDER_STATUSES.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </td>
        <td><button type="button" class="admin-btn" data-order-view="${escape(order.id)}">Details</button></td>
      </tr>`;
    }).join('') || `
      <tr><td colspan="6"><div class="admin-empty"><strong>No orders found</strong><p>Orders placed on the storefront will appear here. Try clearing the filter or search.</p></div></td></tr>`;
  }

  function openOrderDetails(id) {
    const order = Savore.getOrders().find(item => String(item.id) === String(id));
    if (!order) return;

    const items = order.items || [];
    const body = `
      <div class="admin-order-meta">
        <div><span>Order</span><strong>${escape(order.id)}</strong></div>
        <div><span>Status</span><strong><span class="admin-pill ${statusClass(order.status)}">${escape(order.status)}</span></strong></div>
        <div><span>Customer</span><strong>${escape(order.customer || 'Guest')}</strong></div>
        <div><span>Contact</span><strong>${escape(order.contact || '—')}</strong></div>
        <div><span>Email</span><strong>${escape(order.email || '—')}</strong></div>
        <div><span>Payment</span><strong>${escape(order.payment || '—')}</strong></div>
        <div><span>Placed</span><strong>${formatDateTime(order.date)}</strong></div>
        <div><span>Notes</span><strong>${escape(order.notes || '—')}</strong></div>
      </div>
      <table class="admin-order-items">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${items.map(item => `<tr>
            <td>${escape(item.name)}</td>
            <td>${Number(item.quantity) || 0}</td>
            <td>${money(item.price)}</td>
            <td>${money((Number(item.price) || 0) * (Number(item.quantity) || 0))}</td>
          </tr>`).join('') || '<tr><td colspan="4">No items recorded.</td></tr>'}
        </tbody>
      </table>
      <div class="admin-order-total"><span>Order total</span><span>${money(order.total)}</span></div>`;

    openInfoModal({
      title: `Order ${order.id}`,
      subtitle: 'Full order details',
      body
    });
  }

  /* --------------------------------- Users -------------------------------- */
  function renderUsersPage() {
    view.innerHTML = `
      <section class="admin-page">
        <div class="admin-page-head">
          <div>
            <div class="eyebrow">People</div>
            <h2>Users</h2>
            <p>Manage customer, staff, and administrator accounts. Roles decide where each person lands after logging in.</p>
          </div>
          <div class="admin-page-actions">
            <button type="button" class="btn btn-green" data-add-user>Add user</button>
          </div>
        </div>

        <div class="admin-panel">
          <div class="admin-toolbar">
            <label class="admin-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 0 3.5 10.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/></svg>
              <input type="search" placeholder="Search by name, email, or role" data-user-search value="${escape(state.userQuery)}">
            </label>
            <span class="admin-count" data-user-count></span>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody data-users-body></tbody>
            </table>
          </div>
        </div>
      </section>`;

    const search = view.querySelector('[data-user-search]');
    search.addEventListener('input', () => {
      state.userQuery = search.value;
      refreshUsersTable();
    });

    view.querySelector('[data-add-user]')?.addEventListener('click', () => openUserForm(null));

    view.querySelector('[data-users-body]').addEventListener('click', event => {
      const editButton = event.target.closest('[data-user-edit]');
      if (editButton) {
        const user = Savore.getUsers().find(item => String(item.id) === editButton.dataset.userEdit);
        if (user) openUserForm(user);
        return;
      }

      const toggleButton = event.target.closest('[data-user-toggle]');
      if (toggleButton) {
        const users = Savore.getUsers();
        const user = users.find(item => String(item.id) === toggleButton.dataset.userToggle);
        if (!user) return;
        if (String(user.id) === String(currentUser.id)) {
          alert('You cannot deactivate your own account.');
          return;
        }
        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
        Savore.writeStore(Savore.SAVORE_KEY.users, users);
        Savore.showToast(`${user.name} is now ${user.status.toLowerCase()}.`);
        refreshUsersTable();
        return;
      }

      const deleteButton = event.target.closest('[data-user-delete]');
      if (!deleteButton) return;
      deleteUser(deleteButton.dataset.userDelete);
    });

    refreshUsersTable();
  }

  function refreshUsersTable() {
    const body = view?.querySelector('[data-users-body]');
    const count = view?.querySelector('[data-user-count]');
    if (!body) return;

    const users = Savore.getUsers();
    const query = state.userQuery.trim().toLowerCase();
    const filtered = users.filter(user =>
      [user.name, user.email, user.role, user.status].join(' ').toLowerCase().includes(query)
    );

    if (count) count.textContent = `${filtered.length} of ${users.length} users`;

    body.innerHTML = filtered.map(user => {
      const isSelf = String(user.id) === String(currentUser.id);
      return `<tr>
        <td>
          <div class="cell-main">
            <div class="admin-avatar" style="width:42px;height:42px;font-size:.82rem;background:${user.role === 'Administrator' ? 'var(--caramel)' : 'var(--forest)'}">${escape(initials(user.name))}</div>
            <div>
              <strong>${escape(user.name)} ${isSelf ? '<small>(you)</small>' : ''}</strong>
              <small>${escape(user.email)}</small>
            </div>
          </div>
        </td>
        <td><span class="admin-pill ${statusClass(user.role)}">${escape(user.role)}</span></td>
        <td><span class="admin-pill ${user.status === 'Active' ? 'completed' : 'inactive'}">${escape(user.status || 'Active')}</span></td>
        <td>${user.createdAt ? Savore.formatDate(user.createdAt) : '<span class="muted">—</span>'}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="admin-btn" data-user-edit="${escape(user.id)}">Edit</button>
            <button type="button" class="admin-btn ${user.status === 'Active' ? 'danger' : ''}" data-user-toggle="${escape(user.id)}" ${isSelf ? 'disabled' : ''}>${user.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
            <button type="button" class="admin-btn danger" data-user-delete="${escape(user.id)}" ${isSelf ? 'disabled' : ''}>Delete</button>
          </div>
        </td>
      </tr>`;
    }).join('') || `
      <tr><td colspan="5"><div class="admin-empty"><strong>No users found</strong><p>Try a different search, or add a new account.</p><button type="button" class="btn btn-green" data-add-user-empty>Add user</button></div></td></tr>`;

    body.querySelector('[data-add-user-empty]')?.addEventListener('click', () => openUserForm(null));
  }

  function openUserForm(user) {
    const isEditing = Boolean(user);
    const isSelf = isEditing && String(user.id) === String(currentUser.id);
    const roleOptions = ROLES.map(role => `<option value="${role}" ${user?.role === role ? 'selected' : ''}>${role}</option>`).join('');
    const statusOptions = ['Active', 'Inactive'].map(status => `<option value="${status}" ${(user?.status || 'Active') === status ? 'selected' : ''}>${status}</option>`).join('');

    const body = `
      <div class="form-grid">
        <div class="field full">
          <label for="admin-user-name">Full name</label>
          <input id="admin-user-name" name="name" maxlength="80" required value="${escape(user?.name || '')}">
        </div>
        <div class="field full">
          <label for="admin-user-email">Email address</label>
          <input id="admin-user-email" name="email" type="email" required value="${escape(user?.email || '')}">
        </div>
        <div class="field">
          <label for="admin-user-role">Role</label>
          <select id="admin-user-role" name="role" ${isSelf ? 'disabled' : ''}>${roleOptions}</select>
          ${isSelf ? '<input type="hidden" name="role" value="Administrator">' : ''}
        </div>
        <div class="field">
          <label for="admin-user-status">Status</label>
          <select id="admin-user-status" name="status" ${isSelf ? 'disabled' : ''}>${statusOptions}</select>
          ${isSelf ? '<input type="hidden" name="status" value="Active">' : ''}
        </div>
        <div class="field full">
          <label for="admin-user-password">Password ${isEditing ? '(leave blank to keep current)' : ''}</label>
          <input id="admin-user-password" name="password" type="password" minlength="6" ${isEditing ? '' : 'required'} autocomplete="new-password" placeholder="${isEditing ? 'Unchanged' : 'At least 6 characters'}">
        </div>
      </div>`;

    openFormModal({
      title: isEditing ? 'Edit user' : 'Add user',
      subtitle: isEditing ? 'Update this account. Changes take effect the next time they log in.' : 'Create a new account for a customer, staff member, or administrator.',
      submitLabel: isEditing ? 'Save changes' : 'Add user',
      body,
      onSubmit: data => {
        const name = String(data.get('name') || '').trim().replace(/\s+/g, ' ');
        const email = Savore.normalizeEmail(data.get('email'));
        const role = String(data.get('role') || 'Customer');
        const status = String(data.get('status') || 'Active');
        const password = String(data.get('password') || '');

        if (name.length < 2) {
          alert('Please enter the full name.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }
        if (!isEditing && password.length < 6) {
          alert('The password must be at least 6 characters long.');
          return;
        }
        if (isEditing && password && password.length < 6) {
          alert('The new password must be at least 6 characters long.');
          return;
        }
        if (!ROLES.includes(role) || !['Active', 'Inactive'].includes(status)) {
          alert('Please choose a valid role and status.');
          return;
        }

        const users = Savore.getUsers();
        if (users.some(item => String(item.id) !== String(user?.id) && Savore.normalizeEmail(item.email) === email)) {
          alert('An account with that email already exists.');
          return;
        }

        if (isSelf && role !== 'Administrator') {
          alert('You cannot remove your own administrator role.');
          return;
        }

        if (isEditing && user.role === 'Administrator' && (role !== 'Administrator' || status !== 'Active')) {
          const otherAdmins = users.filter(item =>
            String(item.id) !== String(user.id) && item.role === 'Administrator' && item.status !== 'Inactive'
          );
          if (!otherAdmins.length) {
            alert('At least one active administrator account is required.');
            return;
          }
        }

        if (isEditing) {
          const index = users.findIndex(item => String(item.id) === String(user.id));
          if (index === -1) return;
          users[index] = {
            ...users[index],
            name,
            email,
            role,
            status,
            ...(password ? { password } : {})
          };
        } else {
          users.push({
            id: Date.now(),
            name,
            email,
            password,
            role,
            status,
            createdAt: new Date().toISOString()
          });
        }

        Savore.writeStore(Savore.SAVORE_KEY.users, users);

        if (isSelf) {
          const updated = users.find(item => String(item.id) === String(user.id));
          currentUser = updated;
          Savore.writeStore(Savore.SAVORE_KEY.currentUser, updated);
          updateAccountChip();
        }

        closeModal();
        Savore.showToast(isEditing ? `${name} updated.` : `${name} added.`);
        refreshUsersTable();
      }
    });
  }

  function deleteUser(id) {
    const users = Savore.getUsers();
    const user = users.find(item => String(item.id) === String(id));
    if (!user) return;

    if (String(user.id) === String(currentUser.id)) {
      alert('You cannot delete your own account.');
      return;
    }

    if (user.role === 'Administrator') {
      const otherAdmins = users.filter(item =>
        String(item.id) !== String(user.id) && item.role === 'Administrator' && item.status !== 'Inactive'
      );
      if (!otherAdmins.length) {
        alert('At least one active administrator account is required.');
        return;
      }
    }

    if (!confirm(`Delete ${user.name}'s account?`)) return;
    Savore.writeStore(Savore.SAVORE_KEY.users, users.filter(item => String(item.id) !== String(user.id)));
    Savore.showToast(`${user.name} deleted.`);
    refreshUsersTable();
  }

  /* --------------------------------- Modal -------------------------------- */
  function showModal() {
    modal.hidden = false;
    document.body.classList.add('admin-modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.innerHTML = '';
    document.body.classList.remove('admin-modal-open');
  }

  function openFormModal({ title, subtitle, body, submitLabel, onSubmit }) {
    modal.innerHTML = `
      <div class="admin-modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div class="admin-modal-head">
          <div>
            <h3 id="admin-modal-title">${escape(title)}</h3>
            <p>${escape(subtitle)}</p>
          </div>
          <button type="button" class="admin-modal-close" data-modal-close aria-label="Close">✕</button>
        </div>
        <div class="admin-modal-body">
          <form class="admin-modal-form" data-admin-form>
            ${body}
            <div class="admin-modal-actions">
              <button type="button" class="btn btn-light" data-modal-close>Cancel</button>
              <button type="submit" class="btn btn-green">${escape(submitLabel)}</button>
            </div>
          </form>
        </div>
      </div>`;

    showModal();
    const form = modal.querySelector('[data-admin-form]');
    form.addEventListener('submit', event => {
      event.preventDefault();
      onSubmit(new FormData(form), form);
    });
    requestAnimationFrame(() => {
      modal.querySelector('input, select, textarea')?.focus();
    });
  }

  function openInfoModal({ title, subtitle, body }) {
    modal.innerHTML = `
      <div class="admin-modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div class="admin-modal-head">
          <div>
            <h3 id="admin-modal-title">${escape(title)}</h3>
            <p>${escape(subtitle)}</p>
          </div>
          <button type="button" class="admin-modal-close" data-modal-close aria-label="Close">✕</button>
        </div>
        <div class="admin-modal-body">
          ${body}
          <div class="admin-modal-actions">
            <button type="button" class="btn btn-green" data-modal-close>Done</button>
          </div>
        </div>
      </div>`;
    showModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
