document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('[data-users-table]');
  if (!table) return;

  table.innerHTML = Savore.getUsers().map(user => `<tr>
    <td><strong>${Savore.escapeHtml(user.name)}</strong></td>
    <td>${Savore.escapeHtml(user.email)}</td>
    <td>${Savore.escapeHtml(user.role)}</td>
    <td><span class="status-pill ${Savore.statusClass(user.status)}">${Savore.escapeHtml(user.status)}</span></td>
  </tr>`).join('');
});
