// ============================================================
// Financial Architect — Core SPA v2
// Extended roles, role-based nav, API-backed auth
// ============================================================

const PAGES = ['auth','dashboard','expenses','expense-detail','wallet','bundles','approvals','settings'];
let currentPage = 'auth';

// Role groups
const EXECUTIVE_ROLES = ['admin','cfo','ceo','coo','director'];
const MANAGER_ROLES = ['manager'];
const EMPLOYEE_ROLES = ['employee'];

// ============================================================
// UTILITIES
// ============================================================

const sleep = ms => new Promise(r => setTimeout(r, ms));

function fmtDateShort(dateStr) {
  try { const d = new Date(dateStr); if (isNaN(d)) return dateStr; return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function fmtDateFull(dateStr) {
  try { const d = new Date(dateStr); if (isNaN(d)) return dateStr; return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}

function countUp(element, end, duration = 1200, prefix = '', suffix = '') {
  let startTime = null;
  const step = (ts) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = progress * (2 - progress);
    const current = Math.floor(eased * end);
    element.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function animateNumber(element, start, end, duration = 500, prefix = '', decimals = 2) {
  let startTime = null;
  const animate = (ts) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    element.textContent = prefix + current.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function typewriterFill(inputElement, value, speed = 35) {
  return new Promise(resolve => {
    let i = 0; inputElement.value = '';
    inputElement.classList.add('typewriter-cursor');
    const interval = setInterval(() => {
      inputElement.value = value.slice(0, i + 1); i++;
      if (i >= value.length) { clearInterval(interval); inputElement.classList.remove('typewriter-cursor'); resolve(); }
    }, speed);
  });
}

function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
  const colors = {
    success: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]',
    error: 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]',
    info: 'bg-primary-fixed text-on-primary-fixed border-primary',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]'
  };
  const toast = document.createElement('div');
  toast.className = `toast-enter flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border-l-4 ${colors[type]} backdrop-blur-sm`;
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">${icons[type]}</span><span class="text-sm font-semibold">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.remove('toast-enter'); toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); }, duration);
}

function shakeField(el) {
  el.classList.add('invalid');
  el.addEventListener('animationend', () => el.classList.remove('invalid'), { once: true });
}

function fireConfetti(opts = {}) {
  if (typeof confetti === 'function') {
    confetti({ particleCount: opts.count || 100, spread: opts.spread || 80, origin: opts.origin || { y: 0.5 }, colors: opts.colors || ['#376479','#10B981','#F59E0B','#EF4444','#729eb5','#EC4899'], ticks: 200 });
  }
}

function fireGoldBurst(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = Array.from({length:16},(_,i) => ({angle:(i/16)*Math.PI*2, size:Math.random()*8+6}));
  let start = null;
  const animate = (ts) => {
    if (!start) start = ts; const t = (ts - start) / 600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { const d=t*100; ctx.globalAlpha=Math.max(0,1-t); ctx.fillStyle='#F59E0B'; ctx.font=`${p.size}px serif`; ctx.fillText('★',cx+Math.cos(p.angle)*d,cy+Math.sin(p.angle)*d); });
    if (t < 1) requestAnimationFrame(animate); else canvas.remove();
  };
  requestAnimationFrame(animate);
}

function ringBell() {
  const bell = document.getElementById('bell-icon');
  if (bell) { bell.classList.add('ringing'); bell.addEventListener('animationend', () => bell.classList.remove('ringing'), { once: true }); }
}

function renderSkeleton(type = 'card', count = 3) {
  if (type === 'table-row') {
    return Array.from({length:count}, () => `<tr><td class="px-8 py-5"><div class="flex items-center gap-3"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-text" style="width:100px"></div></div></td><td class="px-6 py-5"><div class="skeleton skeleton-text" style="width:180px"></div></td><td class="px-6 py-5"><div class="skeleton skeleton-text" style="width:80px"></div></td><td class="px-6 py-5"><div class="skeleton skeleton-text" style="width:60px"></div></td><td class="px-6 py-5"><div class="skeleton skeleton-text" style="width:80px"></div></td></tr>`).join('');
  }
  if (type === 'stat-card') {
    return Array.from({length:count}, () => `<div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm h-40"><div class="flex justify-between items-start mb-6"><div class="skeleton" style="width:40px;height:40px;border-radius:10px"></div><div class="skeleton skeleton-text" style="width:50px"></div></div><div class="skeleton skeleton-text" style="width:100px;margin-bottom:8px"></div><div class="skeleton skeleton-heading" style="width:150px"></div></div>`).join('');
  }
  return '';
}

// ============================================================
// ROUTER
// ============================================================

const pageRenderers = {};
function registerPage(name, renderer) { pageRenderers[name] = renderer; }

function navigate(page) {
  if (page !== 'auth' && !AuthState.isLoggedIn()) { page = 'auth'; }

  // Role-based page access enforcement
  const user = AuthState.getCurrentUser();
  if (user && page !== 'auth') {
    const role = user.role;
    if (EXECUTIVE_ROLES.includes(role)) {
      // Admin/C-suite: dashboard, approvals, settings (admin only for settings)
      if (['expenses','wallet','bundles','expense-detail'].includes(page)) {
        page = 'dashboard';
      }
      if (page === 'settings' && role !== 'admin') {
        page = 'dashboard'; // C-suite can see dashboard but not user management
      }
    } else if (MANAGER_ROLES.includes(role)) {
      // Manager: only approvals
      if (['dashboard','expenses','wallet','bundles','expense-detail','settings'].includes(page)) {
        page = 'approvals';
      }
    }
    // Employee: dashboard, expenses, wallet, bundles, expense-detail — no approvals, no settings
    if (EMPLOYEE_ROLES.includes(role)) {
      if (['approvals','settings'].includes(page)) {
        page = 'dashboard';
      }
    }
  }

  currentPage = page;
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) { el.classList.remove('active'); if (p !== page) el.classList.add('hidden'); }
  });

  const shell = document.getElementById('app-shell');
  const authPage = document.getElementById('page-auth');

  if (page === 'auth') {
    shell.classList.add('hidden');
    authPage.classList.remove('hidden');
    authPage.classList.add('active');
  } else {
    authPage.classList.add('hidden');
    authPage.classList.remove('active');
    shell.classList.remove('hidden');
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) { pageEl.classList.remove('hidden'); pageEl.classList.add('active'); }
    renderSidebar(page);
    renderTopnav(page);
  }

  if (pageRenderers[page]) pageRenderers[page]();
  window.location.hash = page;
}

// ============================================================
// SIDEBAR — Role-based (Extended Roles)
// ============================================================

function renderSidebar(activePage) {
  const user = AuthState.getCurrentUser();
  const role = user ? user.role : 'employee';

  let navItems = [];

  if (EXECUTIVE_ROLES.includes(role)) {
    // Admin + C-suite: Dashboard (overview), Approvals
    navItems = [
      { id:'dashboard', icon:'dashboard', label:'Dashboard' },
      { id:'approvals', icon:'rule', label:'Team Approvals' },
    ];
    // Only admin gets User Management
    if (role === 'admin') {
      navItems.push({ id:'settings', icon:'group', label:'User Management' });
    }
  } else if (MANAGER_ROLES.includes(role)) {
    // Manager: only Team Approvals
    navItems = [
      { id:'approvals', icon:'rule', label:'Team Approvals' },
    ];
  } else {
    // Employee
    navItems = [
      { id:'dashboard', icon:'dashboard', label:'Dashboard' },
      { id:'expenses', icon:'receipt_long', label:'My Expenses' },
      { id:'wallet', icon:'account_balance_wallet', label:'My Wallet' },
      { id:'bundles', icon:'inventory_2', label:'Bundles' },
    ];
  }

  // Show/hide "+ New Expense" button (only employees)
  const showNewExpense = EMPLOYEE_ROLES.includes(role);

  document.getElementById('sidebar').innerHTML = `
    <div class="mb-8 px-2">
      <h1 class="font-headline text-xl font-extrabold text-primary">ExpensePro</h1>
      <p class="text-xs opacity-60 font-medium">Enterprise Tier</p>
    </div>
    <nav class="flex flex-col gap-1 flex-1">
      ${navItems.map(n => `
        <a href="#" onclick="navigate('${n.id}');return false;"
           class="nav-item ${activePage===n.id?'active':''} flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out
           ${activePage===n.id ? '' : 'text-on-surface hover:text-primary hover:bg-surface-dim'}">
          <span class="material-symbols-outlined" ${activePage===n.id?'style="font-variation-settings:\'FILL\' 1;"':''} >${n.icon}</span>
          <span class="text-sm">${n.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="mt-auto flex flex-col gap-1">
      ${showNewExpense ? `
      <button onclick="navigate('expense-detail')" class="mb-4 w-full primary-gradient text-white py-2.5 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all btn-press">
        <span class="material-symbols-outlined text-sm">add</span> New Expense
      </button>` : ''}
      <a href="#" onclick="handleLogout();return false;" class="text-on-surface opacity-70 hover:opacity-100 rounded-lg flex items-center gap-3 px-3 py-2.5 transition-all">
        <span class="material-symbols-outlined">logout</span><span class="text-sm">Logout</span>
      </a>
    </div>
  `;
}

// ============================================================
// TOPNAV
// ============================================================

function renderTopnav(page) {
  const user = AuthState.getCurrentUser();
  const roleLabel = user ? user.role.toUpperCase() : 'EMPLOYEE';
  const userName = user ? user.name : 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  document.getElementById('topnav').innerHTML = `
    <div class="flex items-center gap-4">
      <div class="relative group">
        <span class="absolute inset-y-0 left-3 flex items-center text-outline"><span class="material-symbols-outlined text-lg">search</span></span>
        <input class="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 transition-all" placeholder="Search transactions..." type="text"/>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <button id="bell-btn" onclick="ringBell();showToast('Checking notifications...','info')" class="relative text-on-surface hover:bg-surface-dim p-2 rounded-full transition-colors">
        <span id="bell-icon" class="material-symbols-outlined bell-icon">notifications</span>
        <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error rounded-full text-[9px] text-white font-bold flex items-center justify-center notif-badge">•</span>
      </button>
      <div class="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
        <div class="text-right">
          <p class="text-sm font-bold text-primary">${userName}</p>
          <p class="text-[10px] uppercase tracking-wider text-outline font-semibold">${roleLabel}</p>
        </div>
        <div id="user-avatar" class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm border-2 border-primary-fixed manager-avatar">${initials}</div>
      </div>
    </div>
  `;
}

// ============================================================
// AUTH PAGE
// ============================================================

async function renderAuth() {
  let countriesHtml = '<option value="USD" data-country="United States">United States (USD)</option>';
  document.getElementById('page-auth').innerHTML = buildAuthHtml(countriesHtml);

  try {
    const countries = await CurrencyService.fetchCountries();
    const select = document.getElementById('country');
    if (select && countries.length > 0) {
      select.innerHTML = countries.map(c =>
        `<option value="${c.currency}" data-country="${c.name}" ${c.currency === 'INR' ? 'selected' : ''}>${c.name} (${c.currency})</option>`
      ).join('');
    }
  } catch (e) {
    console.warn('Failed to load countries:', e);
  }
}

function buildAuthHtml(countriesHtml) {
  return `
  <main class="flex flex-col md:flex-row w-full min-h-screen">
    <section class="flex-1 bg-surface-container-low flex items-center justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-48 h-48 bg-tertiary-fixed/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
      <div class="max-w-md w-full relative z-10 stagger-in">
        <header class="mb-10">
          <div class="flex items-center gap-2 mb-6"><span class="material-symbols-outlined text-primary text-3xl">architecture</span><h1 class="font-headline font-extrabold text-2xl text-primary tracking-tight">Financial Architect</h1></div>
          <h2 class="font-headline font-bold text-3xl mb-2 text-on-surface">Company Registration</h2>
          <p class="text-on-surface-variant font-medium opacity-80">Establish your corporate expense infrastructure.</p>
        </header>
        <form class="space-y-5" onsubmit="event.preventDefault();handleSignup();">
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_name">Company Admin Name</label>
          <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="admin_name" placeholder="John Doe" type="text" required/></div>
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_email">Email Address</label>
          <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="admin_email" placeholder="admin@company.com" type="email" required/></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_pass">Password</label>
            <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="admin_pass" placeholder="••••••••" type="password" required/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_confirm">Confirm</label>
            <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="admin_confirm" placeholder="••••••••" type="password" required/></div>
          </div>
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="company_name">Company Name</label>
          <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="company_name" placeholder="Acme Corp" type="text" required/></div>
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="country">Headquarters Location</label>
            <div class="relative">
              <select class="w-full h-12 px-4 pr-10 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none appearance-none text-on-surface" id="country">
                ${countriesHtml}
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
            <div class="flex items-start gap-2 mt-2 px-1"><span class="material-symbols-outlined text-primary text-sm mt-0.5">info</span><p class="text-[11px] font-medium text-on-surface-variant leading-tight">The selected country's currency will be locked as your organization's primary base currency.</p></div>
          </div>
          <button type="submit" class="w-full h-12 mt-4 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] active:scale-[0.98] transition-all btn-press">Create Admin Account</button>
        </form>
      </div>
    </section>
    <section class="flex-1 bg-surface-container-lowest flex items-center justify-center p-8 md:p-16 lg:p-24 relative">
      <div class="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <img alt="Abstract architectural blueprint" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3-r6ojzx4lztgf5WgbldEIzBPP0Bku3a5bZzPnsbaVOVJjxDzhOiGMsL36yrFkaBq9NWN9ORXhhLvkGGikntt3Nr_NuyMRAHuWOebOX_v_4Z7mFX3bUak3z64MhSqOXWYZOUgr_Id6XUgDVL3C6h-VxdTmD8oj70tP6gwusfMhqhVtRVELHVnUjIoeM8Poul2zp8Gwdq2BqcS5X70pp5ns26AtHda-lVW_3FZbIzHfJDKPCxId5kJFA0i9yaJy3SvoKjd-PaXX0Y"/>
      </div>
      <div class="max-w-md w-full glass-card p-8 md:p-12 rounded-[2rem] shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] relative z-10 border border-outline-variant/10 stagger-in">
        <header class="mb-8 text-center">
          <h2 class="font-headline font-bold text-3xl mb-2 text-on-surface">Welcome Back</h2>
          <p class="text-on-surface-variant font-medium">Log in to manage your expenditures.</p>
        </header>
        <form class="space-y-6" onsubmit="event.preventDefault();handleLogin();">
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="signin_email">Email</label>
            <div class="relative"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">alternate_email</span>
            <input class="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-low/50 border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="signin_email" placeholder="name@work.com" type="email" required/></div></div>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-1"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="signin_pass">Password</label><a class="text-[11px] font-bold text-primary hover:underline" href="#">Forgot password?</a></div>
            <div class="relative"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
            <input class="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-low/50 border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none form-field" id="signin_pass" placeholder="••••••••" type="password" required/></div></div>
          <div class="pt-2"><button type="submit" class="w-full h-14 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-press">Access Dashboard <span class="material-symbols-outlined text-xl">arrow_forward</span></button></div>
          <div id="login-error" class="hidden text-center text-sm text-error font-semibold"></div>
          <div class="text-center pt-4 border-t border-outline-variant/10"><p class="text-sm text-on-surface-variant font-medium">Don't have an account? <a class="text-primary font-bold hover:underline ml-1" href="#" onclick="document.querySelector('section:first-child').scrollIntoView({behavior:'smooth'})">Sign up</a></p></div>
        </form>
        <div class="mt-12 flex justify-center items-center gap-6 opacity-40">
          <div class="flex items-center gap-1.5 grayscale"><span class="material-symbols-outlined text-lg">shield</span><span class="text-[10px] font-bold uppercase tracking-widest">Enterprise Secure</span></div>
          <div class="flex items-center gap-1.5 grayscale"><span class="material-symbols-outlined text-lg">cloud_done</span><span class="text-[10px] font-bold uppercase tracking-widest">Real-time sync</span></div>
        </div>
      </div>
    </section>
  </main>`;
}

// ============================================================
// AUTH HANDLERS (now async — API-backed)
// ============================================================

async function handleSignup() {
  const name = document.getElementById('admin_name').value.trim();
  const email = document.getElementById('admin_email').value.trim();
  const pass = document.getElementById('admin_pass').value;
  const confirm = document.getElementById('admin_confirm').value;
  const companyName = document.getElementById('company_name').value.trim();
  const countrySelect = document.getElementById('country');
  const currency = countrySelect.value;
  const country = countrySelect.options[countrySelect.selectedIndex]?.dataset?.country || 'Unknown';

  if (!name) { shakeField(document.getElementById('admin_name')); return; }
  if (!email) { shakeField(document.getElementById('admin_email')); return; }
  if (!pass || pass.length < 4) { shakeField(document.getElementById('admin_pass')); showToast('Password must be at least 4 characters', 'error'); return; }
  if (pass !== confirm) { shakeField(document.getElementById('admin_confirm')); showToast('Passwords do not match', 'error'); return; }

  const result = await AuthState.signup({ name, email, password: pass, country, currency, companyName });
  if (result.error) { showToast(result.error, 'error'); return; }

  showToast(`Welcome ${name}! Company "${companyName}" created with ${currency} as base currency.`, 'success', 5000);
  fireConfetti({ count: 80, spread: 80 });
  navigate('dashboard');
}

async function handleLogin() {
  const email = document.getElementById('signin_email').value.trim();
  const pass = document.getElementById('signin_pass').value;
  const errorDiv = document.getElementById('login-error');

  if (!email) { shakeField(document.getElementById('signin_email')); return; }
  if (!pass) { shakeField(document.getElementById('signin_pass')); return; }

  const result = await AuthState.login(email, pass);
  if (result.error) {
    if (errorDiv) { errorDiv.classList.remove('hidden'); errorDiv.textContent = result.error; }
    shakeField(document.getElementById('signin_email'));
    showToast(result.error, 'error');
    return;
  }

  showToast(`Welcome back, ${result.user.name}!`, 'success');

  // Route based on role
  const role = result.user.role;
  if (EXECUTIVE_ROLES.includes(role)) navigate('dashboard');
  else if (MANAGER_ROLES.includes(role)) navigate('approvals');
  else navigate('dashboard');
}

function handleLogout() {
  AuthState.logout();
  navigate('auth');
  showToast('Logged out successfully', 'info');
}

registerPage('auth', renderAuth);

// ============================================================
// INIT
// ============================================================

function loadPageScripts() {
  const scripts = ['pages/dashboard.js','pages/expenses.js','pages/expense-detail.js','pages/wallet.js','pages/bundles.js','pages/approvals.js','pages/settings.js'];
  scripts.forEach(src => { const s = document.createElement('script'); s.src = src; document.body.appendChild(s); });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPageScripts();
  if (AuthState.isLoggedIn()) {
    const hash = window.location.hash.replace('#','');
    const user = AuthState.getCurrentUser();
    const role = user ? user.role : 'employee';
    let defaultPage = 'dashboard';
    if (MANAGER_ROLES.includes(role)) defaultPage = 'approvals';
    navigate(PAGES.includes(hash) && hash !== 'auth' ? hash : defaultPage);
  } else {
    renderAuth();
    navigate('auth');
  }
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#','');
  if (hash && PAGES.includes(hash) && hash !== currentPage) navigate(hash);
});
