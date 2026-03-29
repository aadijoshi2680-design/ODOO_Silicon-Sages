// ============================================================
// My Expenses Page — API-backed, employee view
// ============================================================

async function renderExpenses() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;
  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const container = document.getElementById('page-expenses');

  container.innerHTML = `<div class="p-8 lg:p-12"><div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div></div></div>`;

  const expenses = await DataStore.getExpensesByUser(user.id);
  const total = expenses.length;
  const pending = expenses.filter(e => e.status === 'pending');
  const approved = expenses.filter(e => e.status === 'approved');
  const rejected = expenses.filter(e => e.status === 'rejected');

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">My Expenses</h2>
        <p class="text-outline mt-1 font-medium">Track your submitted expenses and their approval progress.</p>
      </div>
      <button onclick="navigate('expense-detail')" class="flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:opacity-90 transition-all btn-press">
        <span class="material-symbols-outlined text-sm">add_circle</span> New Expense
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Total Submitted</p>
        <p id="exp-total" class="text-2xl font-headline font-extrabold text-on-surface">0</p>
      </div>
      <div class="bg-[#FEF3C7]/40 p-5 rounded-xl border border-[#F59E0B]/10">
        <p class="text-[10px] font-bold text-[#92400E] uppercase tracking-widest mb-1">Pending</p>
        <p id="exp-pending" class="text-2xl font-headline font-extrabold text-[#92400E]">0</p>
      </div>
      <div class="bg-[#D1FAE5]/40 p-5 rounded-xl border border-[#10B981]/10">
        <p class="text-[10px] font-bold text-[#065F46] uppercase tracking-widest mb-1">Approved</p>
        <p id="exp-approved" class="text-2xl font-headline font-extrabold text-[#065F46]">0</p>
      </div>
      <div class="bg-[#FEF2F2]/40 p-5 rounded-xl border border-[#EF4444]/10">
        <p class="text-[10px] font-bold text-[#991B1B] uppercase tracking-widest mb-1">Rejected</p>
        <p id="exp-rejected" class="text-2xl font-headline font-extrabold text-[#991B1B]">0</p>
      </div>
    </div>

    <!-- Expense History Table -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-5 flex items-center justify-between bg-surface-container-low/50">
        <h3 class="font-headline font-bold text-lg text-on-surface">Expense History</h3>
        <select id="exp-status-filter" onchange="filterExpenseList()" class="text-xs font-bold bg-surface-container-high px-3 py-1.5 rounded-lg border-none appearance-none cursor-pointer">
          <option value="all">ALL STATUS</option>
          <option value="pending">PENDING</option>
          <option value="approved">APPROVED</option>
          <option value="rejected">REJECTED</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-3">Description</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Original</th>
              <th class="px-4 py-3 text-right">Converted (${company.currency})</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Approval</th>
              <th class="px-8 py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10" id="expense-history-tbody">
            ${expenses.length === 0 ? `
              <tr><td colspan="8" class="px-8 py-12 text-center">
                <span class="material-symbols-outlined text-4xl text-outline/20 mb-2">receipt_long</span>
                <p class="text-sm text-outline font-medium mb-2">No expenses yet</p>
                <p class="text-xs text-outline">Submit your first expense to start tracking approvals.</p>
              </td></tr>` :
              expenses.map((e, i) => expenseHistoryRow(e, sym, i)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  countUp(document.getElementById('exp-total'), total, 600);
  countUp(document.getElementById('exp-pending'), pending.length, 600);
  countUp(document.getElementById('exp-approved'), approved.length, 600);
  countUp(document.getElementById('exp-rejected'), rejected.length, 600);
}

function expenseHistoryRow(e, sym, i) {
  const sc = { pending: 'bg-[#FEF3C7] text-[#92400E]', approved: 'bg-[#D1FAE5] text-[#065F46]', rejected: 'bg-[#FEF2F2] text-[#991B1B]' };
  const chain = e.approval_chain || [];
  const total = chain.length;
  const approved = chain.filter(s => s.status === 'approved').length;

  return `
    <tr class="hover:bg-surface-dim/30 transition-colors row-enter expense-row" style="animation-delay:${i*0.04}s" data-status="${e.status}">
      <td class="px-8 py-4 text-sm font-medium text-on-surface max-w-[180px] truncate">${e.description || '—'}</td>
      <td class="px-4 py-4 text-sm text-on-surface-variant">${fmtDateShort(e.date || e.submitted_at)}</td>
      <td class="px-4 py-4"><span class="text-[10px] font-bold uppercase bg-surface-container-high px-2 py-1 rounded text-outline">${e.category || '—'}</span></td>
      <td class="px-4 py-4 text-sm text-right">${e.currency} ${parseFloat(e.amount).toLocaleString()}</td>
      <td class="px-4 py-4 text-sm font-bold text-right text-primary">${sym}${Math.round(parseFloat(e.converted_amount || e.amount)).toLocaleString()}</td>
      <td class="px-4 py-4 text-center"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc[e.status] || sc.pending}">${e.status}</span></td>
      <td class="px-4 py-4 text-center">
        <div class="flex items-center gap-1 justify-center">
          ${chain.map(s => `<div class="w-2.5 h-2.5 rounded-full ${s.status === 'approved' ? 'bg-[#10B981]' : s.status === 'rejected' ? 'bg-[#EF4444]' : s.status === 'skipped' ? 'bg-[#9CA3AF]' : 'bg-outline-variant/30'}" title="${s.approverName}: ${s.status}"></div>`).join('')}
          <span class="text-[10px] text-outline ml-1">${approved}/${total}</span>
        </div>
      </td>
      <td class="px-8 py-4 text-center">
        <button onclick='showExpenseDetail(${JSON.stringify(e).replace(/'/g, "&#39;")})' class="text-primary hover:underline text-xs font-bold">View</button>
      </td>
    </tr>`;
}

function filterExpenseList() {
  const filter = document.getElementById('exp-status-filter').value;
  document.querySelectorAll('.expense-row').forEach(r => {
    r.style.display = (filter === 'all' || r.dataset.status === filter) ? '' : 'none';
  });
}

registerPage('expenses', renderExpenses);
