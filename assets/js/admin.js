document.addEventListener('DOMContentLoaded', () => {
  const productTable = document.querySelector('[data-products-table]');
  const categoryList = document.querySelector('[data-category-list]');
  const orderTable = document.querySelector('[data-admin-orders]');
  const productForm = document.querySelector('[data-product-form]');
  const escape = value => Savore.escapeHtml(value);
  const orderStatuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
  let editingProductId = null;

  if (productTable) {
    const renderProducts = () => {
      productTable.innerHTML = Savore.getProducts().map(product => `
        <tr>
          <td><strong>${escape(product.name)}</strong><br><small>${escape(product.description)}</small></td>
          <td>${escape(product.category)}</td>
          <td>${Savore.money(product.price)}</td>
          <td>${product.available ? 'Available' : 'Sold out'}</td>
          <td>
            <button class="btn btn-light" data-edit-product="${escape(product.id)}">Edit</button>
            <button class="btn btn-danger" data-delete-product="${escape(product.id)}">Delete</button>
          </td>
        </tr>`).join('') || '<tr><td colspan="5">No products yet. Add one above.</td></tr>';
    };

    const setFormMode = product => {
      if (!productForm) return;
      const submit = productForm.querySelector('[type="submit"]');
      if (!product) {
        editingProductId = null;
        productForm.reset();
        if (submit) submit.textContent = 'Save product';
        return;
      }
      editingProductId = product.id;
      productForm.elements.name.value = product.name;
      productForm.elements.category.value = product.category;
      productForm.elements.price.value = product.price;
      productForm.elements.image.value = product.image || '';
      productForm.elements.description.value = product.description;
      productForm.elements.available.checked = product.available !== false;
      if (submit) submit.textContent = 'Update product';
      productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      productForm.elements.name.focus();
    };

    productTable.addEventListener('click', event => {
      const editButton = event.target.closest('[data-edit-product]');
      if (editButton) {
        const product = Savore.getProducts().find(item => item.id === Number(editButton.dataset.editProduct));
        if (product) setFormMode(product);
        return;
      }

      const deleteButton = event.target.closest('[data-delete-product]');
      if (!deleteButton) return;
      const products = Savore.getProducts();
      const product = products.find(item => item.id === Number(deleteButton.dataset.deleteProduct));
      if (!product || !confirm(`Delete "${product.name}" from the menu?`)) return;
      Savore.writeStore(Savore.SAVORE_KEY.products, products.filter(item => item.id !== product.id));
      if (editingProductId === product.id) setFormMode(null);
      renderProducts();
    });

    productForm?.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(productForm);
      const name = String(data.get('name') || '').trim();
      const category = String(data.get('category') || '').trim();
      const description = String(data.get('description') || '').trim();
      const price = Number(data.get('price'));

      if (!name || !category || !description || !Number.isFinite(price) || price <= 0) {
        alert('Please enter a name, category, description, and a price greater than zero.');
        return;
      }

      const categories = Savore.getCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        Savore.writeStore(Savore.SAVORE_KEY.categories, categories);
      }

      const products = Savore.getProducts();
      const product = {
        name,
        category,
        description,
        price,
        image: String(data.get('image') || '').trim() || Savore.defaultProducts[0].image,
        available: data.get('available') === 'on'
      };

      if (editingProductId !== null) {
        const index = products.findIndex(item => item.id === editingProductId);
        if (index !== -1) products[index] = { ...products[index], ...product };
      } else {
        products.push({ id: Date.now(), ...product });
      }

      Savore.writeStore(Savore.SAVORE_KEY.products, products);
      setFormMode(null);
      renderProducts();
    });

    productForm?.addEventListener('reset', () => {
      editingProductId = null;
      const submit = productForm.querySelector('[type="submit"]');
      if (submit) submit.textContent = 'Save product';
    });

    renderProducts();
  }

  if (categoryList) {
    const renderCategories = () => {
      const products = Savore.getProducts();
      categoryList.innerHTML = Savore.getCategories().map(category => {
        const count = products.filter(product => product.category === category).length;
        return `<li class="summary-item">
          <span>${escape(category)}${count ? ` <small>(${count} product${count === 1 ? '' : 's'})</small>` : ''}</span>
          <span>
            <button class="btn btn-light" data-edit-category="${escape(category)}">Edit</button>
            <button class="remove-btn" data-delete-category="${escape(category)}">Delete</button>
          </span>
        </li>`;
      }).join('') || '<li class="summary-item"><span>No categories yet.</span></li>';
    };

    categoryList.addEventListener('click', event => {
      const editButton = event.target.closest('[data-edit-category]');
      if (editButton) {
        const categories = Savore.getCategories();
        const oldName = editButton.dataset.editCategory;
        const index = categories.indexOf(oldName);
        if (index === -1) return;
        const updated = prompt('Category name:', oldName);
        if (updated === null) return;
        const newName = updated.trim();
        if (!newName || newName === oldName) return;
        if (categories.some(category => category.toLowerCase() === newName.toLowerCase())) {
          alert('A category with that name already exists.');
          return;
        }
        categories[index] = newName;
        const products = Savore.getProducts();
        products.forEach(product => { if (product.category === oldName) product.category = newName; });
        Savore.writeStore(Savore.SAVORE_KEY.categories, categories);
        Savore.writeStore(Savore.SAVORE_KEY.products, products);
        renderCategories();
        return;
      }

      const deleteButton = event.target.closest('[data-delete-category]');
      if (!deleteButton) return;
      const category = deleteButton.dataset.deleteCategory;
      const used = Savore.getProducts().filter(product => product.category === category).length;
      if (used) {
        alert(`"${category}" is used by ${used} product${used === 1 ? '' : 's'}. Move or delete those products first.`);
        return;
      }
      if (!confirm(`Delete the "${category}" category?`)) return;
      Savore.writeStore(Savore.SAVORE_KEY.categories, Savore.getCategories().filter(item => item !== category));
      renderCategories();
    });

    document.querySelector('[data-category-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const input = event.target.querySelector('input');
      const name = input.value.trim();
      if (!name) return;
      const categories = Savore.getCategories();
      if (categories.some(category => category.toLowerCase() === name.toLowerCase())) {
        alert('That category already exists.');
        return;
      }
      categories.push(name);
      Savore.writeStore(Savore.SAVORE_KEY.categories, categories);
      input.value = '';
      renderCategories();
    });

    renderCategories();
  }

  if (orderTable) {
    const renderOrders = () => {
      orderTable.innerHTML = Savore.getOrders().map(order => `
        <tr>
          <td>${escape(order.id)}</td>
          <td>${escape(order.customer)}</td>
          <td>${order.items.map(item => `${escape(item.name)} x${item.quantity}`).join(', ')}</td>
          <td>${Savore.money(order.total)}</td>
          <td>${Savore.formatDate(order.date)}</td>
          <td>
            <select data-admin-status="${escape(order.id)}">
              ${orderStatuses.map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('') || '<tr><td colspan="6">No orders yet.</td></tr>';
    };

    orderTable.addEventListener('change', event => {
      const select = event.target.closest('[data-admin-status]');
      if (!select) return;
      const orders = Savore.getOrders();
      const order = orders.find(item => String(item.id) === select.dataset.adminStatus);
      if (!order) return;
      order.status = select.value;
      Savore.writeStore(Savore.SAVORE_KEY.orders, orders);
      renderOrders();
    });

    renderOrders();
  }
});
