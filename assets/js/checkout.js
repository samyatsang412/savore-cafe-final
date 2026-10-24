document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-checkout-form]');
  const summary = document.querySelector('[data-checkout-summary]');
  const total = document.querySelector('[data-checkout-total]');
  if (!form || !summary || !total) return;

  function renderSummary() {
    const cart = Savore.getCart();
    summary.innerHTML = cart.map(item => `<li class="summary-item"><span>${Savore.escapeHtml(item.name)} x${item.quantity}</span><strong>${Savore.money(item.price * item.quantity)}</strong></li>`).join('') || '<li class="empty-state">Your cart is empty.</li>';
    total.textContent = Savore.money(Savore.cartTotal());
  }

  renderSummary();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const cart = Savore.getCart();
    if (!cart.length) {
      alert('Please add an item before checking out.');
      renderSummary();
      return;
    }

    const data = new FormData(form);
    const order = {
      id: Savore.orderNumber(),
      customer: String(data.get('fullName') || '').trim(),
      contact: String(data.get('contact') || '').trim(),
      email: String(data.get('email') || '').trim(),
      notes: String(data.get('notes') || '').trim(),
      payment: data.get('payment'),
      items: cart,
      total: Savore.cartTotal(),
      status: 'Pending',
      date: new Date().toISOString()
    };

    const orders = Savore.getOrders();
    orders.push(order);
    Savore.writeStore(Savore.SAVORE_KEY.orders, orders);
    Savore.writeStore(Savore.SAVORE_KEY.cart, []);
    window.location.href = `tracking.html?order=${encodeURIComponent(order.id)}`;
  });
});
