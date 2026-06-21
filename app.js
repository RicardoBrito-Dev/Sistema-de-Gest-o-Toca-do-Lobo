/* ================================================================
   TOCA DO LOBO – Sistema de Gestão · app.js
   ================================================================ */

// ── STORAGE KEYS ──────────────────────────────────────────────────
const KEYS = {
  attendance: 'tdl_attendance',
  expenses:   'tdl_expenses',
  settings:   'tdl_settings',
  session:    'tdl_session',
  socios:     'tdl_socios'
};

// ── DEFAULT SETTINGS ──────────────────────────────────────────────
const DEFAULTS = {
  weaponRental: 40,   // sem arma própria
  fieldFeeOwn:  10,   // com arma própria
  magazinePrice:15,   // por carregador
  drinkPrice:   5,    // por bebida
  username:    'admin',
  password:    'toca2026'
};

// ── STATE ──────────────────────────────────────────────────────────
let attendance  = [];
let expenses    = [];
let socios      = [];
let settings    = { ...DEFAULTS };
let currentPeriod      = 'month';
let editingPlayerId    = null;
let editingExpenseId   = null;
let editingSocioId     = null;
let confirmCallback    = null;

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
function init() {
  loadData();
  checkAuth();
  setupListeners();
  setDateDefaults();
}

function loadData() {
  try {
    attendance = JSON.parse(localStorage.getItem(KEYS.attendance) || '[]');
    expenses   = JSON.parse(localStorage.getItem(KEYS.expenses)   || '[]');
    socios     = JSON.parse(localStorage.getItem(KEYS.socios)     || '[]');
    const saved = JSON.parse(localStorage.getItem(KEYS.settings)  || '{}');
    settings   = { ...DEFAULTS, ...saved };
  } catch (e) {
    attendance = []; expenses = []; socios = []; settings = { ...DEFAULTS };
  }
}

function persist() {
  localStorage.setItem(KEYS.attendance, JSON.stringify(attendance));
  localStorage.setItem(KEYS.expenses,   JSON.stringify(expenses));
  localStorage.setItem(KEYS.socios,     JSON.stringify(socios));
  localStorage.setItem(KEYS.settings,   JSON.stringify(settings));
}

// ════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════
function checkAuth() {
  if (sessionStorage.getItem(KEYS.session) === 'ok') {
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-page').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('hidden');
  document.getElementById('user-badge').textContent = '👤 ' + settings.username;
  updateDashboard();
  renderAttendance();
  loadSettingsUI();
}

function handleLogin(e) {
  e.preventDefault();
  const user = q('#username').value.trim();
  const pass = q('#password').value;
  const errEl = q('#login-error');

  if (user === settings.username && pass === settings.password) {
    sessionStorage.setItem(KEYS.session, 'ok');
    errEl.classList.add('hidden');
    showApp();
  } else {
    errEl.classList.remove('hidden');
    q('#password').value = '';
    q('.login-container').classList.add('shake');
    setTimeout(() => q('.login-container').classList.remove('shake'), 500);
  }
}

function handleLogout() {
  sessionStorage.removeItem(KEYS.session);
  showLogin();
  q('#username').value = '';
  q('#password').value = '';
}

// ════════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════════
function switchTab(tab) {
  // Desktop sidebar
  qAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Mobile bottom nav
  qAll('.mobile-nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

  qAll('.tab-content').forEach(s => { s.classList.add('hidden'); s.classList.remove('active'); });

  const el = q(`#tab-${tab}`);
  el.classList.remove('hidden');
  // small delay so animation triggers
  requestAnimationFrame(() => el.classList.add('active'));

  const TITLES = {
    dashboard:     'Dashboard',
    presenca:      'Registro de Presenças',
    financeiro:    'Financeiro',
    comandas:      'Comandas',
    socios:        'Sócios',
    configuracoes: 'Configurações'
  };
  q('#page-title').textContent = TITLES[tab] || tab;

  if (tab === 'dashboard')     updateDashboard();
  if (tab === 'financeiro')    renderFinanceiro();
  if (tab === 'comandas')      renderComandas();
  if (tab === 'socios')        renderSocios();
  if (tab === 'configuracoes') loadSettingsUI();
}

// ════════════════════════════════════════════════════════════════
// DATE UTILITIES
// ════════════════════════════════════════════════════════════════
function setDateDefaults() {
  const today = todayStr();
  q('#attendance-date-filter').value = today;
  q('#fin-custom-date').value        = today;
  q('#cmd-date-filter').value        = today;

  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  q('#page-date').textContent = new Date().toLocaleDateString('pt-BR', opts);
}

function todayStr() {
  const d = new Date();
  return ymd(d);
}

function ymd(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2,'0');
  const dy = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dy}`;
}

function getRange(period, customDate) {
  const now = new Date();

  if (period === 'day') {
    const ds = customDate || todayStr();
    return { start: ds, end: ds };
  }

  if (period === 'week') {
    const dow = now.getDay(); // 0=Sun
    const offset = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now); mon.setDate(now.getDate() + offset);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: ymd(mon), end: ymd(sun) };
  }

  if (period === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: ymd(first), end: ymd(last) };
  }
}

function inRange(ds, range) {
  return ds >= range.start && ds <= range.end;
}

function fmtDate(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' });
}

// ════════════════════════════════════════════════════════════════
// CALCULATIONS
// ════════════════════════════════════════════════════════════════
function getChargeableMags(hasWeapon, magazines) {
  let mags = magazines || 0;
  if (!hasWeapon) {
    mags = Math.max(0, mags - 2);
  }
  return mags;
}

function calcTotal(p) {
  const field   = p.hasWeapon ? settings.fieldFeeOwn : settings.weaponRental;
  const mags    = getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
  const drinks  = (p.drinks    || 0) * settings.drinkPrice;
  return field + mags + drinks;
}

function brl(v) {
  return v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
function updateDashboard() {
  const range = getRange('month');
  const mAtt  = attendance.filter(p => inRange(p.date, range));
  const mExp  = expenses.filter(e   => inRange(e.date, range));

  const income  = mAtt.reduce((s, p) => s + calcTotal(p), 0);
  const expense = mExp.reduce((s, e) => s + e.amount, 0);
  const balance = income - expense;

  q('#dash-income').textContent  = brl(income);
  q('#dash-expense').textContent = brl(expense);
  q('#dash-players').textContent = mAtt.length;

  const balEl = q('#dash-balance');
  balEl.textContent = brl(balance);
  balEl.className   = 'stat-value ' + (balance >= 0 ? 'positive' : 'negative');

  // Recent: last 5 distinct dates
  const recentEl = q('#recent-attendance');
  const allSorted = [...attendance].sort((a, b) => b.date.localeCompare(a.date));

  if (allSorted.length === 0) {
    recentEl.innerHTML = '<p class="empty-state">Nenhum registro encontrado</p>';
    return;
  }

  // group by date, take first 5 dates
  const grouped = {};
  allSorted.forEach(p => {
    if (!grouped[p.date]) grouped[p.date] = [];
    grouped[p.date].push(p);
  });

  const dates = Object.keys(grouped).slice(0, 5);

  recentEl.innerHTML = dates.map(date => {
    const players = grouped[date];
    const dayTotal = players.reduce((s, p) => s + calcTotal(p), 0);
    return `
      <div class="recent-day">
        <div class="recent-day-header">
          <span class="recent-date">📅 ${fmtDate(date)}</span>
          <span class="recent-day-total">${players.length} jogador(es) · ${brl(dayTotal)}</span>
        </div>
        <div class="recent-players">
          ${players.map(p => `
            <div class="recent-player">
              <span>${p.name}</span>
              <span class="player-badge ${p.hasWeapon ? 'badge-own' : 'badge-rental'}">${p.hasWeapon ? '🪖 Própria' : '🔫 Alugada'}</span>
              <span class="player-total">${brl(calcTotal(p))}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ════════════════════════════════════════════════════════════════
// ATTENDANCE
// ════════════════════════════════════════════════════════════════
function renderAttendance() {
  const dateFilter = q('#attendance-date-filter').value;
  const filtered   = attendance.filter(p => p.date === dateFilter);

  const total    = filtered.reduce((s, p) => s + calcTotal(p), 0);
  const mags     = filtered.reduce((s, p) => s + (p.magazines || 0), 0);
  const drinks   = filtered.reduce((s, p) => s + (p.drinks    || 0), 0);

  q('#day-players-count').textContent = filtered.length;
  q('#day-total').textContent         = brl(total);
  q('#day-magazines').textContent     = mags;
  q('#day-drinks').textContent        = drinks;

  const tbody = q('#attendance-tbody');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum jogador registrado nesta data</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr class="fade-in">
      <td data-label="Nome"><strong>${esc(p.name)}</strong></td>
      <td data-label="Armamento"><span class="player-badge ${p.hasWeapon ? 'badge-own' : 'badge-rental'}">${p.hasWeapon ? '🪖 Própria' : '🔫 Alugada'}</span></td>
      <td data-label="Carregadores" class="text-center">${p.magazines || 0}</td>
      <td data-label="Bebidas" class="text-center">${p.drinks    || 0}</td>
      <td data-label="Total" class="text-right"><span class="value-positive">${brl(calcTotal(p))}</span></td>
      <td data-label="Ações" class="text-center" style="white-space:nowrap">
        <button class="btn-icon" onclick="editPlayer('${p.id}')" title="Editar">✏️</button>
        <button class="btn-icon danger" onclick="confirmDelete('player','${p.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// ─ Modal: open add ─────────────────────────────────────────────
function openAddPlayerModal() {
  editingPlayerId = null;
  q('#player-edit-id').value = '';
  q('#player-form').reset();
  q('#p-date').value      = q('#attendance-date-filter').value;
  q('#p-magazines').value = 0;
  q('#p-drinks').value    = 0;
  q('#modal-player-title').textContent = '🎯 Adicionar Jogador';
  setWeaponChoice(false);
  updatePlayerPreview();
  q('#modal-player').classList.remove('hidden');
  setTimeout(() => q('#p-name').focus(), 80);
}

// ─ Modal: open edit ────────────────────────────────────────────
function editPlayer(id) {
  const p = attendance.find(x => x.id === id);
  if (!p) return;

  editingPlayerId = id;
  q('#player-edit-id').value = id;
  q('#p-name').value         = p.name;
  q('#p-date').value         = p.date;
  q('#p-magazines').value    = p.magazines || 0;
  q('#p-drinks').value       = p.drinks    || 0;
  q('#modal-player-title').textContent = '✏️ Editar Jogador';
  setWeaponChoice(p.hasWeapon);
  updatePlayerPreview();
  q('#modal-player').classList.remove('hidden');
}

function closePlayerModal() {
  q('#modal-player').classList.add('hidden');
  editingPlayerId = null;
}

// ─ Weapon toggle ───────────────────────────────────────────────
function setWeaponChoice(hasWeapon) {
  q('#p-has-weapon').value = hasWeapon ? 'true' : 'false';
  q('#btn-no-weapon').classList.toggle('active',  !hasWeapon);
  q('#btn-has-weapon').classList.toggle('active', hasWeapon);
  updateWeaponButtonPrices();
  updatePlayerPreview();
}

function updateWeaponButtonPrices() {
  q('#price-no-weapon').textContent  = brl(settings.weaponRental);
  q('#price-has-weapon').textContent = brl(settings.fieldFeeOwn);
}

// ─ Preview ─────────────────────────────────────────────────────
function updatePlayerPreview() {
  const hasWeapon = q('#p-has-weapon').value === 'true';
  const mags      = parseInt(q('#p-magazines').value) || 0;
  const drinks    = parseInt(q('#p-drinks').value)    || 0;

  const field     = hasWeapon ? settings.fieldFeeOwn : settings.weaponRental;
  const magCost   = getChargeableMags(hasWeapon, mags) * settings.magazinePrice;
  const drinkCost = drinks * settings.drinkPrice;
  const total     = field + magCost + drinkCost;

  q('#bk-field').textContent  = brl(field);
  q('#bk-mag').textContent    = brl(magCost);
  q('#bk-drink').textContent  = brl(drinkCost);
  q('#player-total-preview').textContent = brl(total);
}

// ─ Save player ─────────────────────────────────────────────────
function savePlayer(e) {
  e.preventDefault();
  const name      = q('#p-name').value.trim();
  const date      = q('#p-date').value;
  const hasWeapon = q('#p-has-weapon').value === 'true';
  const magazines = parseInt(q('#p-magazines').value) || 0;
  const drinks    = parseInt(q('#p-drinks').value)    || 0;

  if (!name || !date) return;

  if (editingPlayerId) {
    const idx = attendance.findIndex(x => x.id === editingPlayerId);
    if (idx !== -1) attendance[idx] = { ...attendance[idx], name, date, hasWeapon, magazines, drinks };
    toast('Jogador atualizado! ✅');
  } else {
    attendance.push({ id: uid(), name, date, hasWeapon, magazines, drinks });
    toast('Jogador adicionado! ✅');
  }

  persist();
  closePlayerModal();
  renderAttendance();
  updateDashboard();
  renderComandas();
}

// ─ Delete player ───────────────────────────────────────────────
function deletePlayer(id) {
  attendance = attendance.filter(p => p.id !== id);
  persist();
  renderAttendance();
  updateDashboard();
  renderComandas();
  toast('Jogador removido!');
}

// ════════════════════════════════════════════════════════════════
// FINANCEIRO
// ════════════════════════════════════════════════════════════════
function switchPeriod(period) {
  currentPeriod = period;
  qAll('.period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
  q('#fin-custom-date').style.display = period === 'day' ? 'inline-block' : 'none';
  renderFinanceiro();
}

function renderFinanceiro() {
  const customDate = q('#fin-custom-date').value;
  const range = getRange(currentPeriod, currentPeriod === 'day' ? customDate : null);

  const periodAtt = attendance.filter(p => inRange(p.date, range));
  const periodExp = expenses.filter(e   => inRange(e.date, range));

  // Income breakdown
  let fieldFeeTotal  = 0;
  let rentalTotal    = 0;
  let magTotal       = 0;
  let drinkTotal     = 0;

  periodAtt.forEach(p => {
    if (p.hasWeapon) fieldFeeTotal += settings.fieldFeeOwn;
    else             rentalTotal   += settings.weaponRental;
    magTotal   += getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
    drinkTotal += (p.drinks    || 0) * settings.drinkPrice;
  });

  const totalIncome  = fieldFeeTotal + rentalTotal + magTotal + drinkTotal;
  const totalExpense = periodExp.reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;

  q('#fin-field-fee').textContent    = brl(fieldFeeTotal);
  q('#fin-weapon-rental').textContent= brl(rentalTotal);
  q('#fin-magazines').textContent    = brl(magTotal);
  q('#fin-drinks-income').textContent= brl(drinkTotal);
  q('#fin-total-income').textContent = brl(totalIncome);
  q('#fin-total-expense').textContent= brl(totalExpense);

  // Balance
  const balEl = q('#fin-balance');
  balEl.textContent = brl(balance);
  balEl.className = 'balance-value ' + (balance >= 0 ? 'positive' : 'negative');

  // Bar
  const bar = q('#balance-bar');
  if (totalIncome > 0) {
    const pct = Math.max(0, Math.min(100, (balance / totalIncome) * 100));
    bar.style.width = pct + '%';
    bar.className   = 'balance-bar ' + (balance >= 0 ? 'pos' : 'neg');
  } else {
    bar.style.width = '0%';
  }

  // Label
  q('#balance-label').textContent = periodLabel(currentPeriod, range);

  // Expense mini-list inside card
  const expListEl = q('#fin-expenses-list');
  if (periodExp.length === 0) {
    expListEl.innerHTML = '<p class="empty-state">Sem despesas no período</p>';
  } else {
    expListEl.innerHTML = periodExp.map(e => `
      <div class="fin-row">
        <span>${esc(e.category)}: ${esc(e.description)}</span>
        <strong>${brl(e.amount)}</strong>
      </div>
    `).join('');
  }

  // Expenses table
  const tbody = q('#expenses-tbody');
  if (periodExp.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma despesa no período</td></tr>';
    return;
  }
  tbody.innerHTML = periodExp.map(e => `
    <tr class="fade-in">
      <td data-label="Data" style="white-space:nowrap">${fmtDate(e.date)}</td>
      <td data-label="Categoria"><span class="player-badge badge-expense">${esc(e.category)}</span></td>
      <td data-label="Descrição">${esc(e.description)}</td>
      <td data-label="Valor" class="text-right"><span class="value-negative">${brl(e.amount)}</span></td>
      <td data-label="Ações" class="text-center" style="white-space:nowrap">
        <button class="btn-icon" onclick="editExpense('${e.id}')" title="Editar">✏️</button>
        <button class="btn-icon danger" onclick="confirmDelete('expense','${e.id}')" title="Excluir">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function periodLabel(period, range) {
  if (period === 'day')   return `Data: ${fmtDate(range.start)}`;
  if (period === 'week')  return `Semana: ${fmtDate(range.start)} – ${fmtDate(range.end)}`;
  if (period === 'month') {
    const opts = { month:'long', year:'numeric' };
    const [y, m] = range.start.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', opts);
  }
  return '';
}

// ─ Add expense modal ───────────────────────────────────────────
function openAddExpenseModal() {
  editingExpenseId = null;
  q('#expense-form').reset();
  q('#e-date').value = todayStr();
  q('#modal-expense-title').textContent = '📉 Lançar Despesa';
  q('#modal-expense').classList.remove('hidden');
  setTimeout(() => q('#e-description').focus(), 80);
}

function editExpense(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  editingExpenseId = id;
  q('#expense-edit-id').value   = id;
  q('#e-date').value            = e.date;
  q('#e-category').value        = e.category;
  q('#e-description').value     = e.description;
  q('#e-amount').value          = e.amount;
  q('#modal-expense-title').textContent = '✏️ Editar Despesa';
  q('#modal-expense').classList.remove('hidden');
}

function closeExpenseModal() {
  q('#modal-expense').classList.add('hidden');
  editingExpenseId = null;
}

function saveExpense(e) {
  e.preventDefault();
  const date        = q('#e-date').value;
  const category    = q('#e-category').value;
  const description = q('#e-description').value.trim();
  const amount      = parseFloat(q('#e-amount').value) || 0;

  if (!date || !description || amount <= 0) {
    toast('Preencha todos os campos corretamente!', 'error');
    return;
  }

  if (editingExpenseId) {
    const idx = expenses.findIndex(x => x.id === editingExpenseId);
    if (idx !== -1) expenses[idx] = { ...expenses[idx], date, category, description, amount };
    toast('Despesa atualizada! ✅');
  } else {
    expenses.push({ id: uid(), date, category, description, amount });
    toast('Despesa lançada! ✅');
  }

  persist();
  closeExpenseModal();
  renderFinanceiro();
  updateDashboard();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  persist();
  renderFinanceiro();
  updateDashboard();
  toast('Despesa removida!');
}

// ════════════════════════════════════════════════════════════════
// COMANDAS
// ════════════════════════════════════════════════════════════════
let comandasFilterType = 'player';

function renderComandas() {
  const today = todayStr();
  const selectedDate = q('#cmd-date-filter').value || today;
  const searchText = q('#cmd-player-filter').value.toLowerCase().trim();
  
  let filtered = [];

  let dateRecords = attendance.filter(p => p.date === selectedDate).sort((a, b) => a.name.localeCompare(b.name));
  
  if (searchText) {
    dateRecords = dateRecords.filter(p => p.name.toLowerCase().includes(searchText));
  }
  
  if (dateRecords.length > 0) {
    const totalGrupo = dateRecords.reduce((s, p) => s + calcTotal(p), 0);
    filtered.push({ 
      type: 'date', 
      date: selectedDate, 
      dateLabel: fmtDate(selectedDate),
      records: dateRecords,
      total: totalGrupo
    });
  }

  const container = q('#comandas-container');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">📋 Nenhuma comanda encontrada para este filtro</div>';
    return;
  }

  container.innerHTML = filtered.map((group, idx) => {
    const groupLabel = group.type === 'player' ? group.name : `📅 ${group.dateLabel}`;
    const records = group.records;

    return `
      <div class="comanda-card fade-in">
        <div class="comanda-header">
          <div class="comanda-title">
            <h3>${esc(groupLabel)}</h3>
            <span class="comanda-summary">
              🎯 ${records.length} jogador(es) · 💰 ${brl(group.total)}
            </span>
          </div>
          <button class="btn-primary btn-sm" onclick="openComandaModal(${idx}, '${group.type}')" title="Ver e imprimir">📋 Imprimir</button>
        </div>

        <div class="comanda-list">
          ${records.length > 4 ? '' : `
          <div class="comanda-row" style="background: rgba(74,138,64,.12); font-weight: 700; border-bottom: 2px solid rgba(74,138,64,.25);">
            <div class="row-name">Jogador</div>
            <div class="row-weapon">Armamento</div>
            <div class="row-mags">Carreg.</div>
            <div class="row-drinks">Bebidas</div>
            <div class="row-prices">Preços</div>
            <div class="row-total">Total</div>
          </div>
          `}
          ${records.map((p, pIdx) => {
            const armamento = p.hasWeapon ? '🪖 Própria' : '🔫 Alugada';
            const precoArma = p.hasWeapon ? settings.fieldFeeOwn : settings.weaponRental;
            const precoMags = getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
            const precoBebidas = (p.drinks || 0) * settings.drinkPrice;
            const total = calcTotal(p);
            
            const isCollapsible = records.length > 4;

            if (isCollapsible) {
              return `
                <details class="cmd-details ${pIdx % 2 === 0 ? '' : 'alt'}" data-player-id="${p.id}">
                  <summary class="cmd-summary">
                    <span class="cmd-summary-name">${esc(p.name)}</span>
                    <strong class="cmd-total" data-player-id="${p.id}">${brl(total)}</strong>
                  </summary>
                  <div class="cmd-details-body">
                    <div class="comanda-row" style="padding: 0; border: none; background: transparent;">
                      <div class="row-weapon">${armamento}</div>
                      <div class="row-mags">
                        <div class="cmd-input-wrapper">
                          <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'magazines', -1)">-</button>
                          <input type="number" min="0" value="${p.magazines || 0}" class="cmd-input cmd-mags" data-player-id="${p.id}" onchange="updateComandaField('${p.id}', 'magazines', this.value)" />
                          <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'magazines', 1)">+</button>
                        </div>
                      </div>
                      <div class="row-drinks">
                        <div class="cmd-input-wrapper">
                          <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'drinks', -1)">-</button>
                          <input type="number" min="0" value="${p.drinks || 0}" class="cmd-input cmd-drinks" data-player-id="${p.id}" onchange="updateComandaField('${p.id}', 'drinks', this.value)" />
                          <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'drinks', 1)">+</button>
                        </div>
                      </div>
                      <div class="row-prices">
                        <span class="price">${brl(precoArma)}</span>
                        <span class="price cmd-mag-price" data-player-id="${p.id}">${brl(precoMags)}</span>
                        <span class="price cmd-drink-price" data-player-id="${p.id}">${brl(precoBebidas)}</span>
                      </div>
                    </div>
                  </div>
                </details>
              `;
            } else {
              return `
                <div class="comanda-row ${pIdx % 2 === 0 ? '' : 'alt'}" data-player-id="${p.id}">
                  <div class="row-name">${esc(p.name)}</div>
                  <div class="row-weapon">${armamento}</div>
                  <div class="row-mags">
                    <div class="cmd-input-wrapper">
                      <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'magazines', -1)">-</button>
                      <input type="number" min="0" value="${p.magazines || 0}" class="cmd-input cmd-mags" data-player-id="${p.id}" onchange="updateComandaField('${p.id}', 'magazines', this.value)" />
                      <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'magazines', 1)">+</button>
                    </div>
                  </div>
                  <div class="row-drinks">
                    <div class="cmd-input-wrapper">
                      <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'drinks', -1)">-</button>
                      <input type="number" min="0" value="${p.drinks || 0}" class="cmd-input cmd-drinks" data-player-id="${p.id}" onchange="updateComandaField('${p.id}', 'drinks', this.value)" />
                      <button class="btn-cmd-adj" onclick="adjustComandaField('${p.id}', 'drinks', 1)">+</button>
                    </div>
                  </div>
                  <div class="row-prices">
                    <span class="price">${brl(precoArma)}</span>
                    <span class="price cmd-mag-price" data-player-id="${p.id}">${brl(precoMags)}</span>
                    <span class="price cmd-drink-price" data-player-id="${p.id}">${brl(precoBebidas)}</span>
                  </div>
                  <div class="row-total cmd-total" data-player-id="${p.id}"><strong>${brl(total)}</strong></div>
                </div>
              `;
            }
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ─ Editar campo na comanda ──────────────────────────────────────
function updateComandaField(playerId, fieldName, value) {
  const player = attendance.find(p => p.id === playerId);
  if (!player) return;

  const newValue = Math.max(0, parseInt(value) || 0);
  player[fieldName] = newValue;

  persist();
  updateDashboard();
  
  // Atualizar apenas a linha do jogador na tela (sem re-renderizar tudo)
  const precoArma = player.hasWeapon ? settings.fieldFeeOwn : settings.weaponRental;
  const precoMags = getChargeableMags(player.hasWeapon, player.magazines) * settings.magazinePrice;
  const precoBebidas = (player.drinks || 0) * settings.drinkPrice;
  const total = calcTotal(player);

  const magPriceEl = q(`.cmd-mag-price[data-player-id="${playerId}"]`);
  const drinkPriceEl = q(`.cmd-drink-price[data-player-id="${playerId}"]`);
  const totalEl = q(`.cmd-total[data-player-id="${playerId}"]`);

  if (magPriceEl) magPriceEl.textContent = brl(precoMags);
  if (drinkPriceEl)  drinkPriceEl.textContent = brl(precoBebidas);
  if (totalEl) totalEl.innerHTML = `<strong>${brl(total)}</strong>`;
  
  // Efeito visual de update
  if (magPriceEl) {
    magPriceEl.style.opacity = '0.5';
    setTimeout(() => magPriceEl.style.opacity = '1', 150);
  }

  // Atualizar o resumo total da comanda
  updateComandaTotals();
  
  toast('✏️ Comanda atualizada!');
}

function adjustComandaField(playerId, fieldName, delta) {
  const player = attendance.find(p => p.id === playerId);
  if (!player) return;
  
  const current = player[fieldName] || 0;
  const newValue = Math.max(0, current + delta);
  
  const inputClass = fieldName === 'magazines' ? '.cmd-mags' : '.cmd-drinks';
  const input = q(`${inputClass}[data-player-id="${playerId}"]`);
  if (input) {
    input.value = newValue;
  }
  
  updateComandaField(playerId, fieldName, newValue);
}

// ─ Atualizar totais da comanda ─────────────────────────────────
function updateComandaTotals() {
  const filterType = q('#cmd-filter-type').value || 'date';
  const today = todayStr();

  let filtered = [];

  if (filterType === 'date') {
    const selectedDate = q('#cmd-date-filter').value || today;
    const dateRecords = attendance.filter(p => p.date === selectedDate);
    if (dateRecords.length > 0) {
      const totalGrupo = dateRecords.reduce((s, p) => s + calcTotal(p), 0);
      filtered.push({ records: dateRecords, total: totalGrupo });
    }
  } else if (filterType === 'player') {
    const searchText = q('#cmd-player-filter').value.toLowerCase().trim();
    const grouped = {};
    
    attendance.forEach(p => {
      if (!grouped[p.name]) grouped[p.name] = [];
      grouped[p.name].push(p);
    });

    Object.keys(grouped).sort().forEach(name => {
      if (searchText === '' || name.toLowerCase().includes(searchText)) {
        const totalGrupo = grouped[name].reduce((s, p) => s + calcTotal(p), 0);
        filtered.push({ records: grouped[name], total: totalGrupo });
      }
    });
  }

  // Atualizar resumos
  qAll('.comanda-summary').forEach((el, idx) => {
    if (filtered[idx]) {
      const count = filtered[idx].records.length;
      const total = filtered[idx].total;
      el.textContent = `🎯 ${count} jogador(es) · 💰 ${brl(total)}`;
    }
  });
}

function openComandaModal(groupIdx, groupType) {
  const filterType = q('#cmd-filter-type').value;
  let filtered = [];

  if (filterType === 'player') {
    const searchText = q('#cmd-player-filter').value.toLowerCase().trim();
    const grouped = {};
    attendance.forEach(p => {
      if (!grouped[p.name]) grouped[p.name] = [];
      grouped[p.name].push(p);
    });

    Object.keys(grouped).forEach(name => {
      if (searchText === '' || name.toLowerCase().includes(searchText)) {
        filtered.push({ type: 'player', name, records: grouped[name] });
      }
    });
  } else {
    const selectedDate = q('#cmd-date-filter').value;
    if (selectedDate) {
      const grouped = {};
      const dateRecords = attendance.filter(p => p.date === selectedDate);
      dateRecords.forEach(p => {
        if (!grouped[p.date]) grouped[p.date] = [];
        grouped[p.date].push(p);
      });
      Object.keys(grouped).forEach(date => {
        filtered.push({ type: 'date', date, records: grouped[date] });
      });
    }
  }

  if (groupIdx < 0 || groupIdx >= filtered.length) return;

  const group = filtered[groupIdx];
  const groupLabel = group.type === 'player' ? group.name : fmtDate(group.date);
  const records = group.records.sort((a, b) => a.date.localeCompare(b.date));

  const totalGeral = records.reduce((s, p) => s + calcTotal(p), 0);
  const detalhesHTML = records.map(p => {
    const armamento = p.hasWeapon ? '🪖 Arma Própria' : '🔫 Arma Alugada';
    const precoArma = p.hasWeapon ? settings.fieldFeeOwn : settings.weaponRental;
    const precoMags = getChargeableMags(p.hasWeapon, p.magazines) * settings.magazinePrice;
    const precoBebidas = (p.drinks || 0) * settings.drinkPrice;

    return `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${fmtDate(p.date)}</td>
        <td>${armamento}</td>
        <td class="text-center">${p.magazines || 0}</td>
        <td class="text-center">${p.drinks || 0}</td>
        <td class="text-right">${brl(precoArma)}</td>
        <td class="text-right">${brl(precoMags)}</td>
        <td class="text-right">${brl(precoBebidas)}</td>
        <td class="text-right"><strong>${brl(calcTotal(p))}</strong></td>
      </tr>
    `;
  }).join('');

  const comandaHTML = `
    <div class="comanda-invoice">
      <div class="invoice-header">
        <div class="invoice-title">
          <h2>TOCA DO LOBO</h2>
          <p>Campo de Airsoft</p>
        </div>
        <div class="invoice-info">
          <div>📋 <strong>COMANDA</strong></div>
          <div>🎯 ${esc(groupLabel)}</div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Jogador</th>
            <th>Data</th>
            <th>Armamento</th>
            <th>Carregadores</th>
            <th>Bebidas</th>
            <th>Arm.</th>
            <th>Carreg.</th>
            <th>Bebida</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${detalhesHTML}
        </tbody>
      </table>

      <div class="invoice-total">
        <div class="invoice-total-row">
          <span class="invoice-total-label">TOTAL GERAL:</span>
          <span class="invoice-total-value">${brl(totalGeral)}</span>
        </div>
      </div>

      <div class="invoice-footer">
        <p>Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>Obrigado pela sua visita! 🐺</p>
      </div>
    </div>
  `;

  q('#modal-comanda-title').textContent = `📋 Comanda – ${esc(groupLabel)}`;
  q('#comanda-print-area').innerHTML = comandaHTML;
  q('#modal-comanda').classList.remove('hidden');
}

function closeComandaModal() {
  q('#modal-comanda').classList.add('hidden');
}

function printComanda() {
  const printArea = q('#comanda-print-area').innerHTML;
  const printWindow = window.open('', '', 'width=800,height=600');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Comanda - Toca do Lobo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          background: #fff;
          color: #333;
        }
        .comanda-invoice { max-width: 800px; margin: 0 auto; }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .invoice-title h2 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .invoice-title p { font-size: 12px; color: #666; }
        .invoice-info {
          text-align: right;
          font-weight: bold;
        }
        .invoice-info div { margin: 5px 0; }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        .invoice-table thead {
          background: #f5f5f5;
          font-weight: bold;
        }
        .invoice-table th, .invoice-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .invoice-table th { background: #e8e8e8; }
        .invoice-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .invoice-total {
          margin: 20px 0;
          text-align: right;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        .invoice-total-row {
          font-size: 16px;
          font-weight: bold;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
        }
        .invoice-total-label { width: 200px; }
        .invoice-total-value { width: 150px; }
        .invoice-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        .invoice-footer p { margin: 5px 0; }
        @media print {
          body { margin: 0; padding: 0; }
          .comanda-invoice { max-width: 100%; }
        }
      </style>
    </head>
    <body>
      ${printArea}
      <script>
        window.print();
        window.onafterprint = function() { window.close(); };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

// ════════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════════
function loadSettingsUI() {
  q('#cfg-weapon-rental').value = settings.weaponRental;
  q('#cfg-field-own').value     = settings.fieldFeeOwn;
  q('#cfg-magazine').value      = settings.magazinePrice;
  q('#cfg-drink').value         = settings.drinkPrice;
  q('#cfg-username').value      = settings.username;
  q('#cfg-password').value      = '';
}

function saveConfig() {
  const wr = parseFloat(q('#cfg-weapon-rental').value);
  const fo = parseFloat(q('#cfg-field-own').value);
  const mp = parseFloat(q('#cfg-magazine').value);
  const dp = parseFloat(q('#cfg-drink').value);

  if ([wr, fo, mp, dp].some(v => isNaN(v) || v < 0)) {
    toast('Valores inválidos!', 'error');
    return;
  }

  settings.weaponRental  = wr;
  settings.fieldFeeOwn   = fo;
  settings.magazinePrice = mp;
  settings.drinkPrice    = dp;

  // Refresh weapon button prices in modal
  updateWeaponButtonPrices();

  persist();
  toast('Preços salvos! ✅');
}

function saveCredentials() {
  const newUser = q('#cfg-username').value.trim();
  const newPass = q('#cfg-password').value;

  if (!newUser) { toast('Nome de usuário inválido!', 'error'); return; }

  settings.username = newUser;
  if (newPass) settings.password = newPass;

  persist();
  q('#user-badge').textContent = '👤 ' + settings.username;
  q('#cfg-password').value = '';
  toast('Credenciais atualizadas! ✅');
}

// ════════════════════════════════════════════════════════════════
// SÓCIOS
// ════════════════════════════════════════════════════════════════
function countVisitsBySocio(socioName) {
  return attendance.filter(p => p.name === socioName).length;
}

function getLastVisitBySocio(socioName) {
  const records = attendance.filter(p => p.name === socioName).sort((a, b) => b.date.localeCompare(a.date));
  return records.length > 0 ? records[0].date : null;
}

function getDaysInactive(socioName) {
  const lastVisit = getLastVisitBySocio(socioName);
  if (!lastVisit) return 999; // Nunca veio
  
  const [y, m, d] = lastVisit.split('-').map(Number);
  const lastDate = new Date(y, m - 1, d);
  const now = new Date();
  const diffTime = now - lastDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getActivityStatus(daysInactive) {
  if (daysInactive > 60) return 'very-inactive';
  if (daysInactive > 30) return 'inactive';
  return 'active';
}

function renderSocios() {
  const filterStatus = q('#socios-filter-status').value || 'all';
  const searchText = q('#socios-player-filter').value.toLowerCase().trim();

  let filtered = socios.filter(s => {
    const matchSearch = searchText === '' || s.name.toLowerCase().includes(searchText);
    const daysInactive = getDaysInactive(s.name);
    const status = getActivityStatus(daysInactive);
    
    if (filterStatus === 'all') return matchSearch;
    return matchSearch && status === filterStatus;
  });

  const tbody = q('#socios-tbody');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum sócio encontrado com esse filtro</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const visits = countVisitsBySocio(s.name);
    const lastVisit = getLastVisitBySocio(s.name);
    const daysInactive = getDaysInactive(s.name);
    const status = getActivityStatus(daysInactive);
    
    let statusBadge = '✅ Ativo';
    let statusColor = 'badge-active';
    if (status === 'inactive') {
      statusBadge = '⚠️ Inativo';
      statusColor = 'badge-warning';
    } else if (status === 'very-inactive') {
      statusBadge = '🔴 Crítico';
      statusColor = 'badge-critical';
    }

    const lastVisitText = lastVisit ? fmtDate(lastVisit) : 'Nunca veio';
    
    return `
      <tr class="fade-in">
        <td data-label="Nome"><strong>${esc(s.name)}</strong></td>
        <td data-label="Status de Filiação"><span class="player-badge ${statusColor}">${statusBadge}</span></td>
        <td data-label="Visitas" class="text-center"><strong>${visits}</strong></td>
        <td data-label="Última Visita" style="white-space:nowrap">${lastVisitText}</td>
        <td data-label="Dias de Inatividade" class="text-center"><strong>${daysInactive} dias</strong></td>
        <td data-label="Valor Mensal" class="text-right">${brl(s.monthlyFee)}</td>
        <td data-label="Ações" class="text-center" style="white-space:nowrap">
          <button class="btn-icon" onclick="editSocio('${s.id}')" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="confirmDelete('socio','${s.id}')" title="Excluir">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddSocioModal() {
  editingSocioId = null;
  q('#socio-edit-id').value = '';
  q('#socio-form').reset();
  q('#s-join-date').value = todayStr();
  q('#modal-socio-title').textContent = '👥 Novo Sócio';
  q('#modal-socio').classList.remove('hidden');
  setTimeout(() => q('#s-name').focus(), 80);
}

function editSocio(id) {
  const s = socios.find(x => x.id === id);
  if (!s) return;

  editingSocioId = id;
  q('#socio-edit-id').value = id;
  q('#s-name').value = s.name;
  q('#s-monthly-fee').value = s.monthlyFee;
  q('#s-join-date').value = s.joinDate;
  q('#s-phone').value = s.phone || '';
  q('#s-notes').value = s.notes || '';
  q('#modal-socio-title').textContent = '✏️ Editar Sócio';
  q('#modal-socio').classList.remove('hidden');
}

function closeSocioModal() {
  q('#modal-socio').classList.add('hidden');
  editingSocioId = null;
}

function saveSocio(e) {
  e.preventDefault();
  const name      = q('#s-name').value.trim();
  const monthlyFee = parseFloat(q('#s-monthly-fee').value) || 0;
  const joinDate  = q('#s-join-date').value;
  const phone     = q('#s-phone').value.trim();
  const notes     = q('#s-notes').value.trim();

  if (!name || !joinDate || monthlyFee <= 0) {
    toast('Preencha todos os campos obrigatórios!', 'error');
    return;
  }

  if (editingSocioId) {
    const idx = socios.findIndex(x => x.id === editingSocioId);
    if (idx !== -1) {
      socios[idx] = { ...socios[idx], name, monthlyFee, joinDate, phone, notes };
    }
    toast('Sócio atualizado! ✅');
  } else {
    socios.push({ id: uid(), name, monthlyFee, joinDate, phone, notes });
    toast('Sócio adicionado! ✅');
  }

  persist();
  closeSocioModal();
  renderSocios();
  updateDashboard();
}

function deleteSocio(id) {
  socios = socios.filter(s => s.id !== id);
  persist();
  renderSocios();
  updateDashboard();
  toast('Sócio removido!');
}

// ════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ════════════════════════════════════════════════════════════════
function confirmDelete(type, id) {
  const msgs = {
    player:  'Deseja excluir este jogador? Esta ação não pode ser desfeita.',
    expense: 'Deseja excluir esta despesa? Esta ação não pode ser desfeita.',
    socio:   'Deseja excluir este sócio? Esta ação não pode ser desfeita.'
  };
  q('#confirm-message').textContent = msgs[type] || 'Confirmar exclusão?';
  confirmCallback = () => {
    if (type === 'player')  deletePlayer(id);
    if (type === 'expense') deleteExpense(id);
    if (type === 'socio')   deleteSocio(id);
  };
  q('#confirm-dialog').classList.remove('hidden');
}

function closeConfirm() {
  q('#confirm-dialog').classList.add('hidden');
  confirmCallback = null;
}

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════
let toastTimer = null;
function toast(msg, type = 'success') {
  const el = q('#toast');
  el.textContent = msg;
  el.className   = 'toast' + (type === 'error' ? ' error' : '');
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════════════════════════════
function setupListeners() {
  // Auth
  q('#login-form').addEventListener('submit', handleLogin);
  q('#logout-btn').addEventListener('click',  handleLogout);
  q('#mobile-logout-btn').addEventListener('click', handleLogout);

  // Navigation – desktop sidebar
  qAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  // Navigation – mobile bottom nav
  qAll('.mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Presença
  q('#attendance-date-filter').addEventListener('change', renderAttendance);
  q('#btn-add-player').addEventListener('click', openAddPlayerModal);

  // Player modal
  q('#close-player-modal').addEventListener('click',   closePlayerModal);
  q('#cancel-player-modal').addEventListener('click',  closePlayerModal);
  q('#modal-player-overlay').addEventListener('click', closePlayerModal);
  q('#player-form').addEventListener('submit', savePlayer);
  q('#btn-no-weapon').addEventListener('click',  () => setWeaponChoice(false));
  q('#btn-has-weapon').addEventListener('click', () => setWeaponChoice(true));
  q('#p-magazines').addEventListener('input', updatePlayerPreview);
  q('#p-drinks').addEventListener('input',    updatePlayerPreview);

  // Financeiro
  qAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPeriod(btn.dataset.period));
  });
  q('#fin-custom-date').addEventListener('change', () => {
    if (currentPeriod === 'day') renderFinanceiro();
  });
  q('#btn-add-expense').addEventListener('click', openAddExpenseModal);

  // Expense modal
  q('#close-expense-modal').addEventListener('click',   closeExpenseModal);
  q('#cancel-expense-modal').addEventListener('click',  closeExpenseModal);
  q('#modal-expense-overlay').addEventListener('click', closeExpenseModal);
  q('#expense-form').addEventListener('submit', saveExpense);

  // Comandas
  q('#cmd-player-filter').addEventListener('input', renderComandas);
  q('#cmd-date-filter').addEventListener('change', renderComandas);

  // Comanda modal
  q('#close-comanda-modal').addEventListener('click',   closeComandaModal);
  q('#cancel-comanda-modal').addEventListener('click',  closeComandaModal);
  q('#modal-comanda-overlay').addEventListener('click', closeComandaModal);
  q('#print-comanda-btn').addEventListener('click', printComanda);

  // Sócios
  q('#socios-filter-status').addEventListener('change', renderSocios);
  q('#socios-player-filter').addEventListener('input', renderSocios);
  q('#btn-add-socio').addEventListener('click', openAddSocioModal);

  // Socio modal
  q('#close-socio-modal').addEventListener('click',   closeSocioModal);
  q('#cancel-socio-modal').addEventListener('click',  closeSocioModal);
  q('#modal-socio-overlay').addEventListener('click', closeSocioModal);
  q('#socio-form').addEventListener('submit', saveSocio);

  // Settings
  q('#btn-save-config').addEventListener('click',       saveConfig);
  q('#btn-save-credentials').addEventListener('click',  saveCredentials);

  // Confirm dialog
  q('#confirm-ok').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirm();
  });
  q('#confirm-cancel').addEventListener('click',  closeConfirm);
  q('#confirm-overlay').addEventListener('click', closeConfirm);

  // Close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePlayerModal();
      closeExpenseModal();
      closeConfirm();
    }
  });
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
function q(sel)    { return document.querySelector(sel); }
function qAll(sel) { return document.querySelectorAll(sel); }
function esc(str)  {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ════════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
