// ============================================================
// Expense Detail — Submit a single expense with approval chain
// API-backed version
// ============================================================

async function renderExpenseDetail() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const currencies = CurrencyService.getAvailableCurrencies();
  const chain = await DataStore.buildApprovalChain(company.id, user.id);

  document.getElementById('page-expense-detail').innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-5xl mx-auto w-full stagger-in">
    <div>
      <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Submit New Expense</h2>
      <p class="text-outline mt-1 font-medium">Create and submit a single expense claim for approval.</p>
    </div>

    <!-- Approval Pipeline Preview -->
    ${chain.length > 0 ? `
    <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm">
      <h4 class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Approval Pipeline Preview</h4>
      <div class="flex items-center gap-0 flex-wrap">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">${user.name.split(' ').map(n=>n[0]).join('')}</div>
          <div><p class="text-xs font-bold">${user.name}</p><p class="text-[10px] text-outline uppercase">${user.role}</p></div>
        </div>
        ${chain.map((s, i) => `
          <svg width="40" height="4" class="mx-1"><line x1="0" y1="2" x2="40" y2="2" stroke="#C1C7CC" stroke-width="2" stroke-dasharray="4 3"/></svg>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-xs">${s.approverName.split(' ').map(n=>n[0]).join('')}</div>
            <div><p class="text-xs font-bold">${s.approverName}</p><p class="text-[10px] text-outline uppercase">${s.role}</p></div>
          </div>
        `).join('')}
      </div>
    </div>` : `
    <div class="bg-[#FEF3C7] p-4 rounded-xl flex items-center gap-3">
      <span class="material-symbols-outlined text-[#92400E]">warning</span>
      <p class="text-sm text-[#92400E] font-medium">No approvers configured. Contact your admin to set up an approval chain.</p>
    </div>`}

    <!-- Expense Form -->
    <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5">
      <form id="expense-submit-form" onsubmit="event.preventDefault();submitSingleExpense();" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount & Currency</label>
            <div class="flex gap-0">
              <select id="exp-currency" onchange="updateExpConversion()" class="w-24 bg-surface-container-low border-r border-outline-variant/20 rounded-l-lg focus:ring-0 focus:bg-white transition-all px-3 py-3 text-on-surface text-sm appearance-none form-field">
                ${currencies.map(c => `<option ${c === company.currency ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
              <input id="exp-amount" oninput="updateExpConversion()" class="flex-1 bg-surface-container-low border-transparent rounded-r-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="number" step="0.01" placeholder="0.00" required/>
            </div>
            <div id="exp-converted" class="text-xs text-primary font-semibold px-1 currency-counter">≈ ${sym}0.00 ${company.currency}</div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category</label>
            <select id="exp-category" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface text-sm appearance-none form-field">
              ${CATEGORIES.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Expense Date</label>
            <input id="exp-date" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="date" value="${new Date().toISOString().split('T')[0]}" max="${new Date().toISOString().split('T')[0]}" required/>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
          <textarea id="exp-desc" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field min-h-[80px]" placeholder="Describe this expense..." required></textarea>
        </div>
        <div class="flex items-end gap-3 justify-end">
          <button type="button" onclick="navigate('dashboard')" class="px-6 py-3 bg-surface-container-high text-on-surface font-medium rounded-lg hover:bg-surface-dim transition-colors">Cancel</button>
          <button type="submit" id="exp-submit-btn" class="px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">send</span> Submit for Approval
          </button>
        </div>
      </form>
    </div>
  </div>`;
}

async function updateExpConversion() {
  const amt = parseFloat(document.getElementById('exp-amount').value) || 0;
  const curr = document.getElementById('exp-currency').value;
  const company = AuthState.getCurrentCompany();
  if (!company) return;
  const { convertedAmount } = await CurrencyService.convert(amt, curr, company.currency);
  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const el = document.getElementById('exp-converted');
  el.classList.add('currency-flash');
  el.textContent = `≈ ${sym}${convertedAmount.toFixed(2)} ${company.currency}`;
  setTimeout(() => el.classList.remove('currency-flash'), 300);
}

async function submitSingleExpense() {
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const currency = document.getElementById('exp-currency').value;
  const category = document.getElementById('exp-category').value;
  const date = document.getElementById('exp-date').value;
  const desc = document.getElementById('exp-desc').value.trim();

  if (!amount) { shakeField(document.getElementById('exp-amount')); return; }
  if (!desc) { shakeField(document.getElementById('exp-desc')); return; }

  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  const { convertedAmount, rate } = await CurrencyService.convert(amount, currency, company.currency);
  const chain = await DataStore.buildApprovalChain(company.id, user.id);

  const result = await DataStore.submitExpense(user.id, company.id, {
    amount, currency, convertedAmount, exchangeRate: rate,
    category, date, description: desc,
    approvalChain: chain,
  });

  // Submit animation
  const btn = document.getElementById('exp-submit-btn');
  if (btn) {
    btn.innerHTML = `<svg viewBox="0 0 52 52" width="24" height="24"><circle cx="26" cy="26" r="25" fill="#D1FAE5" stroke="#10B981" stroke-width="2"/><path d="M14 27 L22 35 L38 17" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" stroke-dashoffset="40" style="animation: drawCheck 0.5s ease forwards 0.1s"/></svg> Submitted!`;
    btn.disabled = true;
  }

  fireConfetti({ count: 60, spread: 60 });
  showToast(`Expense submitted — ${chain.length} approver(s) in pipeline`, 'success');

  await sleep(1500);
  navigate('expenses');
}

registerPage('expense-detail', renderExpenseDetail);
