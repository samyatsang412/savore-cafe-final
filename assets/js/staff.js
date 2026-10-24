document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('[data-orders-table]');
  if (!table) return;
  const statuses = ['Pending', 'Preparing', 'Ready', 'Completed'];

  function render() {
    const orders = Savore.getOrders();
    table.innerHTML = orders.length ? orders.map(order => `
      <tr>
        <td><strong>${Savore.escapeHtml(order.id)}</strong><br><small>${Savore.formatDate(order.date)}</small></td>
        <td>${Savore.escapeHtml(order.customer)}<br><small>${(order.items || []).map(item => `${Savore.escapeHtml(item.name)} x${item.quantity}`).join(', ')}</small></td>
        <td>${Savore.money(order.total)}</td>
        <td><span class="status-pill ${Savore.statusClass(order.status)}">${Savore.escapeHtml(order.status)}</span></td>
        <td>
          <select data-status="${Savore.escapeHtml(order.id)}">
            ${statuses.map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('') : '<tr><td colspan="5">No orders yet.</td></tr>';
  }

  table.addEventListener('change', event => {
    const select = event.target.closest('[data-status]');
    if (!select) return;
    const orders = Savore.getOrders();
    const order = orders.find(item => String(item.id) === select.dataset.status);
    if (!order) return;
    order.status = select.value;
    Savore.writeStore(Savore.SAVORE_KEY.orders, orders);
    render();
  });

  render();
});
