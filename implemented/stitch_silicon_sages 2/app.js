// ============================================================
// Financial Architect - Single Page Application
// ============================================================

const PAGES = ['auth','dashboard','expenses','expense-detail','approvals','settings'];
let currentPage = 'auth';

// ---- ROUTER ----
function navigate(page) {
  currentPage = page;
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === page);
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
    renderSidebar(page);
    renderTopnav(page);
  }
  window.location.hash = page;
}

// ---- SIDEBAR ----
function renderSidebar(activePage) {
  const navItems = [
    { id:'dashboard', icon:'dashboard', label:'Dashboard' },
    { id:'expenses', icon:'receipt_long', label:'My Expenses' },
    { id:'approvals', icon:'rule', label:'Team Approvals' },
    { id:'settings', icon:'settings', label:'Settings' },
  ];
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
          <span class="material-symbols-outlined" ${activePage===n.id?'style="font-variation-settings:\'FILL\' 1;"':''}>${n.icon}</span>
          <span class="text-sm">${n.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="mt-auto flex flex-col gap-1">
      <button onclick="navigate('expenses')" class="mb-4 w-full primary-gradient text-white py-2.5 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
        <span class="material-symbols-outlined text-sm">add</span> New Expense
      </button>
      <a href="#" class="text-on-surface opacity-70 hover:opacity-100 rounded-lg flex items-center gap-3 px-3 py-2.5 transition-all">
        <span class="material-symbols-outlined">contact_support</span><span class="text-sm">Support</span>
      </a>
      <a href="#" onclick="navigate('auth');return false;" class="text-on-surface opacity-70 hover:opacity-100 rounded-lg flex items-center gap-3 px-3 py-2.5 transition-all">
        <span class="material-symbols-outlined">logout</span><span class="text-sm">Logout</span>
      </a>
    </div>
  `;
}

// ---- TOPNAV ----
function renderTopnav(page) {
  const titles = {dashboard:'Financial Overview',expenses:'My Expenses','expense-detail':'Expense Detail',approvals:'Team Approvals',settings:'Admin Settings'};
  document.getElementById('topnav').innerHTML = `
    <div class="flex items-center gap-4">
      <div class="relative group">
        <span class="absolute inset-y-0 left-3 flex items-center text-outline">
          <span class="material-symbols-outlined text-lg">search</span>
        </span>
        <input class="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 transition-all" placeholder="Search transactions..." type="text"/>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <button class="text-on-surface hover:bg-surface-dim p-2 rounded-full transition-colors"><span class="material-symbols-outlined">notifications</span></button>
      <button class="text-on-surface hover:bg-surface-dim p-2 rounded-full transition-colors"><span class="material-symbols-outlined">help_outline</span></button>
      <div class="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
        <div class="text-right">
          <p class="text-sm font-bold text-primary">Alex Chen</p>
          <p class="text-[10px] uppercase tracking-wider text-outline font-semibold">Product Lead</p>
        </div>
        <img alt="User Profile" class="w-10 h-10 rounded-full object-cover border-2 border-primary-container"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpFAFmCuppVoFQ2hmZPZbw5hMDVCqRdTG5hgjuqUuhHiuq3m72zvYn4u6FGeZ73v9rP5SMyQEOgq6dSx5wtU7Z9IydltFr5MFx7ecM4B7vhwH5EkE0u3N914gr8QfswOCUVq0NoJRpQ-2XI5RToZfEK6hFv77ezz_ZvJgjdL1CBoVwW6M8ge3L9ZQ1Aps_dQ9079OAjd0LaPG2yY34uRDqjP5u0yX4Km740GBlPLHwFKEbPfy35ulNudtDwLmeKwpDsVpVNlYlOjs"/>
      </div>
    </div>
  `;
}

// ---- AUTH PAGE ----
function renderAuth() {
  document.getElementById('page-auth').innerHTML = `
  <main class="flex flex-col md:flex-row w-full min-h-screen">
    <section class="flex-1 bg-surface-container-low flex items-center justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="max-w-md w-full relative z-10">
        <header class="mb-10">
          <div class="flex items-center gap-2 mb-6">
            <span class="material-symbols-outlined text-primary text-3xl">architecture</span>
            <h1 class="font-headline font-extrabold text-2xl text-primary tracking-tight">Financial Architect</h1>
          </div>
          <h2 class="font-headline font-bold text-3xl mb-2 text-on-surface">Company Registration</h2>
          <p class="text-on-surface-variant font-medium opacity-80">Establish your corporate expense infrastructure.</p>
        </header>
        <form class="space-y-5" onsubmit="event.preventDefault();navigate('dashboard');">
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_name">Company Admin Name</label>
          <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="admin_name" placeholder="John Doe" type="text"/></div>
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_email">Email Address</label>
          <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="admin_email" placeholder="admin@company.com" type="email"/></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_pass">Password</label>
            <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="admin_pass" placeholder="••••••••" type="password"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="admin_confirm">Confirm</label>
            <input class="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="admin_confirm" placeholder="••••••••" type="password"/></div>
          </div>
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="country">Headquarters Location</label>
            <div class="relative">
              <select class="w-full h-12 px-4 pr-10 rounded-xl bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none appearance-none text-on-surface" id="country">
                <option value="us">United States (USD)</option><option value="uk">United Kingdom (GBP)</option><option value="eu">European Union (EUR)</option><option value="sg">Singapore (SGD)</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
            <div class="flex items-start gap-2 mt-2 px-1"><span class="material-symbols-outlined text-primary text-sm mt-0.5">info</span><p class="text-[11px] font-medium text-on-surface-variant leading-tight">The selected country's currency will be locked as your organization's primary base currency for all reporting.</p></div>
          </div>
          <button type="submit" class="w-full h-12 mt-4 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] active:scale-[0.98] transition-all">Create Admin Account</button>
        </form>
      </div>
    </section>
    <section class="flex-1 bg-surface-container-lowest flex items-center justify-center p-8 md:p-16 lg:p-24 relative">
      <div class="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <img alt="Abstract architectural blueprint" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3-r6ojzx4lztgf5WgbldEIzBPP0Bku3a5bZzPnsbaVOVJjxDzhOiGMsL36yrFkaBq9NWN9ORXhhLvkGGikntt3Nr_NuyMRAHuWOebOX_v_4Z7mFX3bUak3z64MhSqOXWYZOUgr_Id6XUgDVL3C6h-VxdTmD8oj70tP6gwusfMhqhVtRVELHVnUjIoeM8Poul2zp8Gwdq2BqcS5X70pp5ns26AtHda-lVW_3FZbIzHfJDKPCxId5kJFA0i9yaJy3SvoKjd-PaXX0Y"/>
      </div>
      <div class="max-w-md w-full glass-card p-8 md:p-12 rounded-[2rem] shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] relative z-10 border border-outline-variant/10">
        <header class="mb-8 text-center">
          <h2 class="font-headline font-bold text-3xl mb-2 text-on-surface">Welcome Back</h2>
          <p class="text-on-surface-variant font-medium">Log in to manage your expenditures.</p>
        </header>
        <form class="space-y-6" onsubmit="event.preventDefault();navigate('dashboard');">
          <div class="space-y-1.5"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" for="signin_email">Email</label>
            <div class="relative"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">alternate_email</span>
            <input class="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-low/50 border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="signin_email" placeholder="name@work.com" type="email"/></div></div>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-1"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="signin_pass">Password</label><a class="text-[11px] font-bold text-primary hover:underline transition-all" href="#">Forgot password?</a></div>
            <div class="relative"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
            <input class="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-low/50 border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface" id="signin_pass" placeholder="••••••••" type="password"/></div></div>
          <div class="pt-2"><button type="submit" class="w-full h-14 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">Access Dashboard <span class="material-symbols-outlined text-xl">arrow_forward</span></button></div>
          <div class="text-center pt-4 border-t border-outline-variant/10"><p class="text-sm text-on-surface-variant font-medium">Don't have an account? <a class="text-primary font-bold hover:underline transition-all ml-1" href="#">Sign up</a></p></div>
        </form>
        <div class="mt-12 flex justify-center items-center gap-6 opacity-40">
          <div class="flex items-center gap-1.5 grayscale"><span class="material-symbols-outlined text-lg">shield</span><span class="text-[10px] font-bold uppercase tracking-widest">Enterprise Secure</span></div>
          <div class="flex items-center gap-1.5 grayscale"><span class="material-symbols-outlined text-lg">cloud_done</span><span class="text-[10px] font-bold uppercase tracking-widest">Real-time sync</span></div>
        </div>
      </div>
    </section>
  </main>
  <div class="fixed bottom-8 right-8 z-50">
    <button class="w-14 h-14 rounded-full bg-surface-container-highest shadow-[0_12px_32px_-4px_rgba(29,28,21,0.1)] flex items-center justify-center text-primary hover:bg-surface-dim transition-colors group">
      <span class="material-symbols-outlined">contact_support</span>
      <span class="absolute right-16 bg-on-surface text-surface text-[10px] py-1.5 px-3 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Get Help</span>
    </button>
  </div>`;
}

// ---- PAGES (loaded from separate files) ----
function loadPageScripts() {
  const scripts = ['pages/dashboard.js','pages/expense-detail.js','pages/approvals.js','pages/settings.js'];
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderAuth();
  loadPageScripts();
  // Check hash for initial route
  const hash = window.location.hash.replace('#','');
  if (hash && PAGES.includes(hash)) {
    navigate(hash);
  } else {
    navigate('auth');
  }
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#','');
  if (hash && PAGES.includes(hash) && hash !== currentPage) {
    navigate(hash);
  }
});
