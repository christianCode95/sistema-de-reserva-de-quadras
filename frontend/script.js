const API_BASE = window.location.origin && window.location.origin !== 'null'
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

const courts = [
  {
    id: 'quadra-1',
    name: 'Quadra Central',
    type: 'Sintética oficial',
    capacity: '10 jogadores',
    price: 150,
    description: 'Iluminação completa e grama sintética de alta performance.'
  },
  {
    id: 'quadra-2',
    name: 'Quadra Arena',
    type: 'Arenito premium',
    capacity: '12 jogadores',
    price: 180,
    description: 'Ambiente moderno com arquibancada para amigos e família.'
  },
  {
    id: 'quadra-3',
    name: 'Quadra Elite',
    type: 'Society coberta',
    capacity: '8 jogadores',
    price: 210,
    description: 'Conforto total com aquecimento e cobertura completa.'
  }
];

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const authMessage = document.getElementById('auth-message');
const userNameText = document.getElementById('user-name');
const courtSelect = document.getElementById('court');
const reservationForm = document.getElementById('reservation-form');
const messageContainer = document.getElementById('message');
const courtList = document.getElementById('court-list');
const reservationList = document.getElementById('reservation-list');
const reservationCount = document.getElementById('reservation-count');
const lastReservationText = document.getElementById('last-reservation');
const pricePreview = document.getElementById('price-preview');
const playersInput = document.getElementById('players');
const logoutBtn = document.getElementById('logoutBtn');

function showMessage(container, text, type = 'success') {
  container.textContent = text;
  container.className = `message-box visible ${type}`;
}

function hideMessage(container) {
  container.textContent = '';
  container.className = 'message-box';
}

function setSession(user) {
  localStorage.setItem('quadraproUser', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('quadraproUser');
}

function getSession() {
  const value = localStorage.getItem('quadraproUser');
  return value ? JSON.parse(value) : null;
}

function getSavedUsers() {
  return JSON.parse(localStorage.getItem('quadraproUsers') || '[]');
}

function setSavedUsers(users) {
  localStorage.setItem('quadraproUsers', JSON.stringify(users));
}

function findUser(email, password) {
  return getSavedUsers().find((user) => user.email === email && user.password === password);
}

function emailExists(email) {
  return getSavedUsers().some((user) => user.email === email);
}

function showAuthForm(mode) {
  const loginActive = mode === 'login';
  loginForm.classList.toggle('hidden', !loginActive);
  registerForm.classList.toggle('hidden', loginActive);
  showLoginBtn.classList.toggle('active', loginActive);
  showRegisterBtn.classList.toggle('active', !loginActive);
  hideMessage(authMessage);
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function renderCourts() {
  courtSelect.innerHTML = courts
    .map((court) => `<option value="${court.id}">${court.name} — ${formatCurrency(court.price)}</option>`)
    .join('');

  courtList.innerHTML = courts
    .map((court) => `
      <div class="court-card">
        <div class="court-title">
          <div>
            <strong>${court.name}</strong>
            <p>${court.type}</p>
          </div>
          <span class="court-badge">${court.capacity}</span>
        </div>
        <p>${court.description}</p>
        <p><strong>Valor por hora:</strong> ${formatCurrency(court.price)}</p>
      </div>
    `)
    .join('');
}

async function fetchReservations() {
  try {
    const response = await fetch(`${API_BASE}/reservas`);
    if (!response.ok) {
      throw new Error('Não foi possível carregar reservas.');
    }
    return await response.json();
  } catch (error) {
    showMessage(messageContainer, error.message, 'error');
    return [];
  }
}

function renderReservations(reservations) {
  reservationCount.textContent = reservations.length;

  if (reservations.length === 0) {
    reservationList.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
    lastReservationText.textContent = 'Nenhuma';
    return;
  }

  const sorted = [...reservations].sort((a, b) => new Date(b.horario) - new Date(a.horario));
  lastReservationText.textContent = formatDateTime(sorted[0].horario);

  reservationList.innerHTML = sorted.map((reservation) => `
    <div class="reservation-card">
      <header>
        <div>
          <h4>${reservation.court || 'Quadra não informada'}</h4>
          <p>${formatDateTime(reservation.horario)}</p>
        </div>
        <strong>${formatCurrency(reservation.preco)}</strong>
      </header>
      <p>Vagas: ${reservation.vagas}</p>
    </div>
  `).join('');
}

function showView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach((view) => view.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
  logoutBtn.classList.toggle('hidden', viewId !== 'dashboard-view');
}

async function loadDashboard() {
  const user = getSession();
  if (!user) {
    showView('login-view');
    return;
  }

  document.getElementById('user-name').textContent = user.name;
  showView('dashboard-view');
  hideMessage(messageContainer);
  renderCourts();

  const reservations = await fetchReservations();
  renderReservations(reservations);
}

async function verificarHorario(horario) {
  const params = new URLSearchParams({ horario });
  const response = await fetch(`${API_BASE}/reservas/verificar-horario?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao verificar disponibilidade. [${response.status}] ${text}`);
  }
  const data = await response.json();
  return data.disponivel;
}

async function criarReserva(event) {
  event.preventDefault();
  hideMessage(messageContainer);

  const selectedCourt = courts.find((court) => court.id === courtSelect.value);
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const players = Number(playersInput.value);

  if (!date || !time || !selectedCourt) {
    showMessage(messageContainer, 'Preencha todos os campos do formulário.', 'error');
    return;
  }

  if (time < '09:00' || time > '22:00') {
    showMessage(messageContainer, 'Escolha um horário entre 09:00 e 22:00.', 'error');
    return;
  }

  const horario = `${date}T${time}:00`;

  try {
    const disponivel = await verificarHorario(horario);
    if (!disponivel) {
      showMessage(messageContainer, 'Horário indisponível. Escolha outro horário.', 'error');
      return;
    }

    const payload = {
      court: selectedCourt.name,
      vagas: players,
      preco: selectedCourt.price,
      horario
    };

    const response = await fetch(`${API_BASE}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Não foi possível criar a reserva.');
    }

    showMessage(messageContainer, 'Reserva criada com sucesso!', 'success');
    reservationForm.reset();
    updatePricePreview();
    const reservations = await fetchReservations();
    renderReservations(reservations);
  } catch (error) {
    showMessage(messageContainer, error.message || 'Erro ao realizar reserva.', 'error');
  }
}

function handleLogin(event) {
  event.preventDefault();
  hideMessage(authMessage);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    showMessage(authMessage, 'Informe email e senha para continuar.', 'error');
    return;
  }

  const user = findUser(email, password);
  if (!user) {
    showMessage(authMessage, 'Credenciais inválidas ou conta não encontrada.', 'error');
    return;
  }

  setSession({ name: user.name, email: user.email });
  loadDashboard();
}

function handleRegister(event) {
  event.preventDefault();
  hideMessage(authMessage);

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const passwordConfirm = document.getElementById('register-password-confirm').value.trim();

  if (!name || !email || !password || !passwordConfirm) {
    showMessage(authMessage, 'Preencha todos os campos para criar sua conta.', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showMessage(authMessage, 'As senhas não coincidem.', 'error');
    return;
  }

  if (emailExists(email)) {
    showMessage(authMessage, 'Este email já está em uso. Faça login ou escolha outro email.', 'error');
    return;
  }

  const users = getSavedUsers();
  users.push({ name, email, password });
  setSavedUsers(users);

  setSession({ name, email });
  loadDashboard();
}

function handleLogout() {
  clearSession();
  showView('login-view');
}

function updatePricePreview() {
  const selectedCourt = courts.find((court) => court.id === courtSelect.value);
  if (selectedCourt) {
    pricePreview.textContent = formatCurrency(selectedCourt.price);
  }
}

function setupEvents() {
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  showLoginBtn.addEventListener('click', () => showAuthForm('login'));
  showRegisterBtn.addEventListener('click', () => showAuthForm('register'));
  reservationForm.addEventListener('submit', criarReserva);
  logoutBtn.addEventListener('click', handleLogout);
  courtSelect.addEventListener('change', updatePricePreview);
}

async function init() {
  renderCourts();
  setupEvents();
  showAuthForm('login');
  updatePricePreview();
  await loadDashboard();
}

init();
