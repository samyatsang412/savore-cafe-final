document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('[data-login-form]');
  const registerForm = document.querySelector('[data-register-form]');
  const getUsers = () => Savore.getUsers();
  const normalize = Savore.normalizeEmail;
  const params = new URLSearchParams(location.search);
  const nextRoute = params.get('next') || '';

  const showMessage = (text, isError = false) => {
    const message = document.querySelector('[data-auth-message]');
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('error', isError);
    message.classList.add('show');
  };

  if (loginForm) {
    if (params.get('reason') === 'admin') {
      showMessage('Administrator access required. Sign in with the admin account to continue.', true);
    }

    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(loginForm);
      const email = normalize(data.get('email'));
      const password = String(data.get('password') || '');
      const user = getUsers().find(item => normalize(item.email) === email && item.password === password);

      if (!user) {
        showMessage('Email or password is incorrect. Please try again.', true);
        return;
      }

      if (user.status && user.status !== 'Active') {
        showMessage('This account is not active yet. Please contact our staff.', true);
        return;
      }

      Savore.writeStore(Savore.SAVORE_KEY.currentUser, user);
      showMessage(`Welcome back, ${user.name.split(' ')[0]}! Taking you to your account…`);

      let destination = 'menu.html';
      if (user.role === 'Administrator') {
        destination = /^#\/admin(\/|$)/.test(nextRoute) ? `index.html${nextRoute}` : 'index.html#/admin';
      } else if (user.role === 'Staff') {
        destination = 'staff/dashboard.html';
      }

      setTimeout(() => { location.href = destination; }, 600);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(registerForm);
      const name = String(data.get('fullName') || '').trim().replace(/\s+/g, ' ');
      const email = normalize(data.get('email'));
      const password = String(data.get('password') || '');
      const confirmPassword = String(data.get('confirmPassword') || '');

      if (name.length < 2) {
        showMessage('Please enter your full name.', true);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address.', true);
        return;
      }

      if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', true);
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match.', true);
        return;
      }

      const users = getUsers();
      if (users.some(item => normalize(item.email) === email)) {
        showMessage('An account with that email already exists. Please log in instead.', true);
        return;
      }

      // Accounts are active immediately — there is no email confirmation step.
      users.push({
        id: Date.now(),
        name,
        email,
        password,
        role: 'Customer',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      Savore.writeStore(Savore.SAVORE_KEY.users, users);

      registerForm.reset();
      showMessage('Account created! No email verification needed — redirecting you to log in…');
      setTimeout(() => { location.href = 'login.html'; }, 1400);
    });
  }
});
