const SAVORE_KEY = {
  cart: 'savoreCart', orders: 'savoreOrders', users: 'savoreUsers', products: 'savoreProducts', categories: 'savoreCategories', currentUser: 'savoreCurrentUser', catalogVersion: 'savoreCatalogVersion'
};
const CATALOG_VERSION = '3';

const defaultProducts = [
  { id: 1, name: 'Espresso', category: 'Coffee', description: 'Rich and bold freshly brewed espresso.', price: 89, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 2, name: 'Cappuccino', category: 'Coffee', description: 'Smooth espresso topped with creamy milk foam.', price: 109, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 3, name: 'Latte', category: 'Coffee', description: 'Creamy espresso blended with steamed milk.', price: 119, image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 4, name: 'Flat White', category: 'Coffee', description: 'Strong espresso with smooth microfoam milk.', price: 119, image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 5, name: 'Americano', category: 'Coffee', description: 'Classic espresso mixed with hot water.', price: 99, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 6, name: 'Iced Spanish Latte', category: 'Coffee', description: 'Smooth espresso blended with creamy milk and sweet Spanish-style syrup.', price: 179, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 7, name: 'Pizza', category: 'Meals', description: 'Freshly baked pizza with delicious toppings.', price: 199, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 8, name: 'Sushi', category: 'Meals', description: 'Fresh and flavorful assorted sushi rolls.', price: 229, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 9, name: 'Tacos', category: 'Meals', description: 'Soft tacos filled with savory meat and fresh toppings.', price: 159, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 10, name: 'Hamburger', category: 'Meals', description: 'Juicy burger served with fresh vegetables and sauce.', price: 149, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 11, name: 'Pad Thai', category: 'Meals', description: 'Classic Thai noodles with vegetables and savory sauce.', price: 179, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 12, name: 'French Fries', category: 'Meals', description: 'Crispy golden fries served hot and fresh.', price: 99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 13, name: 'Savore Burger', category: 'Burgers', description: 'Our signature burger with juicy beef, cheese, and fresh vegetables.', price: 149, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 14, name: 'Savore Signature Burger', category: 'Burgers', description: 'A premium Savore burger with juicy beef, melted cheese, fresh vegetables, and special sauce.', price: 179, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 15, name: 'Cheese Burger', category: 'Burgers', description: 'Classic beef burger with melted cheese.', price: 159, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 16, name: 'Bacon Burger', category: 'Burgers', description: 'Juicy beef burger topped with crispy bacon.', price: 179, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 17, name: 'Chicken Burger', category: 'Burgers', description: 'Crispy chicken fillet with fresh lettuce and special sauce.', price: 149, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 18, name: 'Creamy Pasta', category: 'Pasta', description: 'Creamy and flavorful pasta served with our special sauce.', price: 129, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 19, name: 'Carbonara', category: 'Pasta', description: 'Creamy pasta with bacon and parmesan cheese.', price: 149, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 20, name: 'Creamy Carbonara', category: 'Pasta', description: 'Rich and creamy carbonara with bacon and parmesan cheese.', price: 159, image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 21, name: 'Spaghetti', category: 'Pasta', description: 'Classic spaghetti with rich tomato sauce and meat.', price: 139, image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 22, name: 'Pesto Pasta', category: 'Pasta', description: 'Fresh pasta tossed in creamy basil pesto sauce.', price: 159, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 23, name: 'Tiramisu', category: 'Desserts', description: 'Classic Italian dessert with coffee, cream, and cocoa.', price: 129, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 24, name: 'Crème Brûlée', category: 'Desserts', description: 'Creamy custard topped with a crisp caramelized sugar layer.', price: 139, image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 25, name: 'Cheesecake', category: 'Desserts', description: 'Smooth and creamy cheesecake with a delicious crust.', price: 119, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 26, name: 'Blueberry Cheesecake', category: 'Desserts', description: 'Creamy cheesecake topped with sweet and tangy blueberry sauce.', price: 149, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 27, name: 'Macaron', category: 'Desserts', description: 'Colorful French-style almond cookies with a creamy filling.', price: 89, image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 28, name: 'Gelato', category: 'Desserts', description: 'Smooth and creamy Italian-style frozen dessert.', price: 99, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 29, name: 'Iced Coffee', category: 'Drinks', description: 'Refreshing chilled coffee perfect for any time of day.', price: 99, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 30, name: 'Iced Tea', category: 'Drinks', description: 'Refreshing cold tea with a light and sweet flavor.', price: 69, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 31, name: 'Lemonade', category: 'Drinks', description: 'Fresh and refreshing lemonade.', price: 79, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 32, name: 'Chocolate Drink', category: 'Drinks', description: 'Rich and creamy chocolate drink.', price: 99, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 33, name: 'Fruit Shake', category: 'Drinks', description: 'Fresh blended fruit drink.', price: 109, image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=700&q=80', available: true },
  { id: 34, name: 'Matcha Latte', category: 'Drinks', description: 'Smooth and creamy matcha blended with fresh milk.', price: 159, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80', available: true }
];
const defaultCategories = ['Coffee', 'Meals', 'Burgers', 'Pasta', 'Desserts', 'Drinks'];
const demoUsers = [
  { id: 1, name: 'Juan Dela Cruz', email: 'customer@savorecafe.com', password: 'customer123', role: 'Customer', status: 'Active' },
  { id: 2, name: 'Mia Santos', email: 'staff@savorecafe.com', password: 'staff123', role: 'Staff', status: 'Active' },
  { id: 3, name: 'Alex Rivera', email: 'admin@savorecafe.com', password: 'admin123', role: 'Administrator', status: 'Active' }
];

function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getProducts() {
  const products = readStore(SAVORE_KEY.products, null);

  // Seed only when there is no catalog yet. Never compare lengths or names here:
  // that would wipe products added, edited, or removed in the admin dashboard.
  if (!Array.isArray(products)) {
    const seeded = defaultProducts.map(product => ({ ...product }));
    writeStore(SAVORE_KEY.products, seeded);
    writeStore(SAVORE_KEY.catalogVersion, CATALOG_VERSION);
    return seeded;
  }

  // One-time catalog migration for data saved by older versions.
  if (readStore(SAVORE_KEY.catalogVersion, '1') !== CATALOG_VERSION) {
    const cheesecake = products.find(product => product.name === 'Cheesecake');
    const defaultCheesecake = defaultProducts.find(product => product.name === 'Cheesecake');
    if (cheesecake && defaultCheesecake) cheesecake.image = defaultCheesecake.image;
    writeStore(SAVORE_KEY.products, products);
    writeStore(SAVORE_KEY.catalogVersion, CATALOG_VERSION);
  }

  return products;
}
function getCategories() {
  const categories = readStore(SAVORE_KEY.categories, null);
  if (!Array.isArray(categories)) {
    const seeded = [...defaultCategories];
    writeStore(SAVORE_KEY.categories, seeded);
    return seeded;
  }
  return categories;
}
function getCart() { return readStore(SAVORE_KEY.cart, []); }
function getOrders() { return readStore(SAVORE_KEY.orders, []); }
function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function getUsers() {
  const users = readStore(SAVORE_KEY.users, null);

  if (!Array.isArray(users)) {
    const seeded = demoUsers.map(user => ({ ...user }));
    writeStore(SAVORE_KEY.users, seeded);
    return seeded;
  }

  // The demo site must always keep one administrator account available.
  // If an older saved user list has none, restore the built-in admin.
  if (!users.some(user => user.role === 'Administrator')) {
    const admin = demoUsers.find(user => user.role === 'Administrator');
    const existing = users.find(user => normalizeEmail(user.email) === normalizeEmail(admin.email));
    if (existing) existing.role = 'Administrator';
    else users.push({ ...admin });
    writeStore(SAVORE_KEY.users, users);
  }

  return users;
}
function money(value) { return `₱${Number(value).toLocaleString('en-PH')}`; }
function cartCount() { return getCart().reduce((total, item) => total + item.quantity, 0); }
function cartTotal() { return getCart().reduce((total, item) => total + item.price * item.quantity, 0); }
function updateCartCount() { document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = cartCount(); }); }
function addToCart(productId) { const product = getProducts().find(item => item.id === Number(productId)); if (!product || !product.available) return; const cart = getCart(); const existing = cart.find(item => item.id === product.id); if (existing) existing.quantity += 1; else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }); writeStore(SAVORE_KEY.cart, cart); updateCartCount(); showToast(`${product.name} added to your order.`); }
function setPageNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(link => { if (link.getAttribute('href') === current) link.classList.add('active'); });
  const toggle = document.querySelector('[data-menu-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', String(links.classList.contains('open')));
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  updateCartCount();
}
function showToast(message) { let toast = document.querySelector('.toast'); if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); } toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2200); }
function orderNumber() {
  const highest = getOrders().reduce((max, order) => {
    const value = Number(String(order.id || '').replace(/\D/g, ''));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 1000);
  return `SC${highest + 1}`;
}
function statusClass(status) { return String(status || '').trim().toLowerCase().replace(/\s+/g, '-'); }
function formatDate(date) { return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function getCurrentUser() { return readStore(SAVORE_KEY.currentUser, null); }
function logoutUser() { localStorage.removeItem(SAVORE_KEY.currentUser); location.href = 'login.html'; }
function updateAuthNav() {
  const slot = document.querySelector('[data-auth-nav]');
  if (!slot) return;
  const user = getCurrentUser();
  slot.innerHTML = '';
  if (user) {
    const greeting = document.createElement('span');
    greeting.className = 'nav-user';
    greeting.textContent = `Hi, ${String(user.name || 'Guest').trim().split(/\s+/)[0]}`;
    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'nav-logout';
    logout.textContent = 'Logout';
    logout.addEventListener('click', logoutUser);
    slot.append(greeting);
    if (user.role === 'Administrator') {
      const admin = document.createElement('a');
      admin.href = 'index.html#/admin';
      admin.className = 'nav-admin-link';
      admin.textContent = 'Admin';
      slot.append(admin);
    }
    slot.append(logout);
    return;
  }
  const login = document.createElement('a');
  login.href = 'login.html';
  login.textContent = 'Login';
  login.dataset.nav = '';
  const register = document.createElement('a');
  register.href = 'register.html';
  register.textContent = 'Register';
  register.dataset.nav = '';
  slot.append(login, register);
}

window.Savore = { SAVORE_KEY, defaultProducts, defaultCategories, demoUsers, readStore, writeStore, getProducts, getCategories, getCart, getOrders, getUsers, normalizeEmail, money, cartCount, cartTotal, updateCartCount, addToCart, setPageNav, showToast, orderNumber, statusClass, formatDate, escapeHtml, getCurrentUser, logoutUser, updateAuthNav };
document.addEventListener('DOMContentLoaded', () => { getProducts(); getCategories(); getUsers(); updateAuthNav(); setPageNav(); });
