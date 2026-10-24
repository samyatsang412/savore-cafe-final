document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-cart-list]');
  if (!list) return;
  const checkoutLink = document.querySelector('.summary-card a[href="checkout.html"]');

  function syncCheckout(cart) {
    if (!checkoutLink) return;
    const empty = cart.length === 0;
    checkoutLink.classList.toggle('is-disabled', empty);
    checkoutLink.setAttribute('aria-disabled', String(empty));
  }

  function render() {
    const cart = Savore.getCart();
    const items = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('[data-total-items]').textContent = items;
    document.querySelector('[data-subtotal]').textContent = Savore.money(Savore.cartTotal());
    syncCheckout(cart);
    if (!cart.length) {
      list.innerHTML = '<div class="empty-state"><h3>Your order is waiting to be filled.</h3><p>Browse the menu and add your café favorites here.</p><a class="btn btn-green" href="menu.html">Browse menu</a></div>';
      return;
    }
    list.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${Savore.escapeHtml(item.image)}" alt="${Savore.escapeHtml(item.name)}">
        <div>
          <h3>${Savore.escapeHtml(item.name)}</h3>
          <div class="quantity">
            <button data-decrease="${Savore.escapeHtml(item.id)}" aria-label="Decrease quantity">−</button>
            <strong>${item.quantity}</strong>
            <button data-increase="${Savore.escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <strong class="price">${Savore.money(item.price * item.quantity)}</strong><br>
          <button class="remove-btn" data-remove="${Savore.escapeHtml(item.id)}">Remove</button>
        </div>
      </div>`).join('');
    list.querySelectorAll('[data-increase]').forEach(button => button.addEventListener('click', () => change(button.dataset.increase, 1)));
    list.querySelectorAll('[data-decrease]').forEach(button => button.addEventListener('click', () => change(button.dataset.decrease, -1)));
    list.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
      const updated = Savore.getCart().filter(item => item.id !== Number(button.dataset.remove));
      Savore.writeStore(Savore.SAVORE_KEY.cart, updated);
      render();
      Savore.updateCartCount();
    }));
  }

  function change(id, delta) {
    const cart = Savore.getCart();
    const item = cart.find(entry => entry.id === Number(id));
    if (item) item.quantity = Math.max(0, item.quantity + delta);
    Savore.writeStore(Savore.SAVORE_KEY.cart, cart.filter(entry => entry.quantity > 0));
    render();
    Savore.updateCartCount();
  }

  checkoutLink?.addEventListener('click', event => {
    if (Savore.getCart().length) return;
    event.preventDefault();
    Savore.showToast('Your cart is empty. Add something first.');
  });

  document.querySelector('[data-clear-cart]')?.addEventListener('click', () => {
    Savore.writeStore(Savore.SAVORE_KEY.cart, []);
    render();
    Savore.updateCartCount();
  });

  render();
});
