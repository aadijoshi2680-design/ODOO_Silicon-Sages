// ============================================================
// Dashboard Page — Role-aware
// Admin/C-suite: Total expenditure, dept-wise, chart, recent
// Employee: Wallet summary, quick actions
// ============================================================

async function renderDashboard() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const role = user.role;
  const isExecutive = EXECUTIVE_ROLES.includes(role);
  const sym = CurrencyService.getCurrencySymbol(company.currency);

  if (isExecutive) {
    await renderAdminDashboard(user, company, sym);
  } else {
    await renderEmployeeDashboard(user, company, sym);
  }
}

// ============================================================
// ADMIN / C-SUITE DASHBOARD
// ============================================================

async function renderAdminDashboard(user, company, sym) {
  const container = document.getElementById('page-dashboard');
  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Executive Dashboard</h2>
        <p class="text-outline mt-1 font-medium">Company-wide expenditure overview — ${company.name}</p>
      </div>
      <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${user.role.toUpperCase()}</span>
    </div>
    <div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div><p class="text-sm text-outline mt-4">Loading analytics...</p></div>
  </div>`;

  // Fetch stats from API
  const stats = await DataStore.getExpenseStats(company.id);

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <!-- Header -->
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Executive Dashboard</h2>
        <p class="text-outline mt-1 font-medium">Company-wide expenditure overview — ${company.name}</p>
      </div>
      <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${user.role.toUpperCase()}</span>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-[#D1FAE5] flex items-center justify-center"><span class="material-symbols-outlined text-[#065F46]">payments</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Total Expenditure</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">Approved expenses</p>
        <p id="stat-total" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center"><span class="material-symbols-outlined text-[#92400E]">pending_actions</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Pending Approvals</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">Awaiting review</p>
        <p id="stat-pending" class="text-3xl font-headline font-extrabold text-on-surface">0</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center"><span class="material-symbols-outlined text-primary">account_balance</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">All-Time Total</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">All submitted</p>
        <p id="stat-alltime" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
    </div>

    <!-- Month-wise Chart + Department-wise -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Chart (3 cols) -->
      <div class="lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">bar_chart</span> Monthly Expenditure
          </h3>
          <span class="text-[10px] font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">Last 12 months</span>
        </div>
        <div style="height:280px;position:relative;">
          <canvas id="monthly-chart"></canvas>
        </div>
      </div>

      <!-- Department-wise (2 cols) -->
      <div class="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">domain</span> By Department
          </h3>
        </div>
        <div class="mb-4">
          <input id="dept-filter" type="text" placeholder="Filter departments..." oninput="filterDeptList()"
            class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-2.5 text-sm text-on-surface form-field"/>
        </div>
        <div id="dept-list" class="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
          ${stats.departmentWise.length === 0 ? '<p class="text-sm text-outline text-center py-6">No department data yet</p>' :
            stats.departmentWise.map(d => deptRow(d, sym, stats.totalExpenditure)).join('')}
        </div>
      </div>
    </div>

    <!-- Recent Expenditures -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-5 flex items-center justify-between bg-surface-container-low/50">
        <h3 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span> Recent Expenditures
        </h3>
        <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${stats.recentExpenses.length} latest</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-3">Employee</th>
              <th class="px-4 py-3">Department</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Amount (${company.currency})</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-8 py-3">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            ${stats.recentExpenses.length === 0 ?
              `<tr><td colspan="7" class="px-8 py-12 text-center text-sm text-outline">No expenses submitted yet</td></tr>` :
              stats.recentExpenses.map((e, i) => recentExpenseRow(e, sym, i)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  // Animate stats
  const statTotal = document.getElementById('stat-total');
  const statPending = document.getElementById('stat-pending');
  const statAlltime = document.getElementById('stat-alltime');
  if (statTotal) countUp(statTotal, Math.round(stats.totalExpenditure), 1200, sym);
  if (statPending) countUp(statPending, stats.pendingCount, 800);
  if (statAlltime) countUp(statAlltime, Math.round(stats.allTimeTotal || 0), 1200, sym);

  // Render Chart.js
  renderMonthlyChart(stats.monthWise, sym);
}

function deptRow(dept, sym, total) {
  const pct = total > 0 ? Math.round((dept.total / total) * 100) : 0;
  const colors = ['#376479','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#06B6D4','#84CC16'];
  const ci = Math.abs(dept.department.charCodeAt(0)) % colors.length;
  return `
    <div class="dept-row flex items-center justify-between p-3 rounded-lg hover:bg-surface-dim/30 transition-colors" data-name="${dept.department.toLowerCase()}">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full" style="background:${colors[ci]}"></div>
        <div>
          <p class="text-sm font-semibold text-on-surface">${dept.department}</p>
          <p class="text-[11px] text-outline">${dept.count} expense${dept.count !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-on-surface">${sym}${Math.round(dept.total).toLocaleString()}</p>
        <p class="text-[10px] font-semibold text-outline">${pct}%</p>
      </div>
    </div>`;
}

function filterDeptList() {
  const q = document.getElementById('dept-filter').value.toLowerCase();
  document.querySelectorAll('.dept-row').forEach(r => {
    r.style.display = r.dataset.name.includes(q) ? '' : 'none';
  });
}

function recentExpenseRow(e, sym, i) {
  const statusColors = {
    pending: 'bg-[#FEF3C7] text-[#92400E]',
    approved: 'bg-[#D1FAE5] text-[#065F46]',
    rejected: 'bg-[#FEF2F2] text-[#991B1B]',
  };
  const sc = statusColors[e.status] || statusColors.pending;
  return `
    <tr class="hover:bg-surface-dim/30 transition-colors row-enter" style="animation-delay:${i*0.04}s">
      <td class="px-8 py-4 text-sm font-medium text-on-surface">${e.submitter_name || 'Unknown'}</td>
      <td class="px-4 py-4"><span class="text-xs font-bold text-outline bg-surface-container-high px-2 py-1 rounded">${e.department_name || 'Unassigned'}</span></td>
      <td class="px-4 py-4 text-sm text-on-surface-variant max-w-[180px] truncate">${e.description || '—'}</td>
      <td class="px-4 py-4"><span class="text-[10px] font-bold uppercase bg-surface-container-high px-2 py-1 rounded text-outline">${e.category || '—'}</span></td>
      <td class="px-4 py-4 text-sm font-bold text-right text-primary">${sym}${Math.round(e.converted_amount || e.amount || 0).toLocaleString()}</td>
      <td class="px-4 py-4 text-center"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc}">${e.status}</span></td>
      <td class="px-8 py-4 text-sm text-on-surface-variant">${fmtDateShort(e.submitted_at || e.date)}</td>
    </tr>`;
}

function renderMonthlyChart(monthData, sym) {
  const canvas = document.getElementById('monthly-chart');
  if (!canvas) return;

  // Ensure at least some months are shown
  let labels = monthData.map(m => m.label);
  let data = monthData.map(m => m.total);

  if (labels.length === 0) {
    // Show last 6 months with zero data
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      data.push(0);
    }
  }

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `Expenditure (${sym})`,
        data,
        backgroundColor: 'rgba(55, 100, 121, 0.7)',
        borderColor: '#376479',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1D1C15',
          titleFont: { family: "'DM Serif Display', serif" },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => `${sym}${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#71787D' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 11, family: "'Inter', sans-serif" }, color: '#71787D',
            callback: v => `${sym}${v.toLocaleString()}`
          }
        }
      }
    }
  });
}

// ============================================================
// EMPLOYEE DASHBOARD
// ============================================================

async function renderEmployeeDashboard(user, company, sym) {
  const container = document.getElementById('page-dashboard');

  // Fetch wallet & expense data
  const walletEntries = await DataStore.getWalletEntries(user.id);
  const expenses = await DataStore.getExpensesByUser(user.id);
  const walletItems = walletEntries.filter(e => e.status === 'wallet');
  const pendingWallet = walletItems.reduce((s, e) => s + parseFloat(e.converted_amount || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedTotal = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + parseFloat(e.converted_amount || 0), 0);

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Financial Overview</h2>
        <p class="text-outline mt-1 font-medium">Manage your personal expenses and reimbursement claims.</p>
      </div>
      <div class="flex gap-3">
        <button onclick="navigate('wallet');setTimeout(()=>toggleOcrUpload&&toggleOcrUpload(),300)" class="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-primary font-bold text-sm hover:bg-surface-dim transition-all btn-press">
          <span class="material-symbols-outlined">cloud_upload</span> Upload
        </button>
        <button onclick="navigate('expense-detail')" class="flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:opacity-90 transition-all btn-press">
          <span class="material-symbols-outlined text-sm">add_circle</span> New Expense
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center"><span class="material-symbols-outlined text-primary">account_balance_wallet</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Pending Wallet</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">In wallet</p>
        <p id="emp-wallet" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center"><span class="material-symbols-outlined text-[#92400E]">hourglass_top</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Pending</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">Waiting approval</p>
        <p id="emp-pending" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl bg-[#D1FAE5] flex items-center justify-center"><span class="material-symbols-outlined text-[#065F46]">check_circle</span></div>
          <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Completed</span>
        </div>
        <p class="text-sm text-on-surface-variant mb-1">Approved (Last 30 Days)</p>
        <p id="emp-approved" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div onclick="navigate('wallet')" class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all card-hover">
        <span class="material-symbols-outlined text-primary text-2xl mb-3 block">account_balance_wallet</span>
        <p class="text-sm font-bold text-on-surface">My Wallet</p><p class="text-xs text-outline">Log expenses quickly</p>
      </div>
      <div onclick="navigate('bundles')" class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all card-hover">
        <span class="material-symbols-outlined text-primary text-2xl mb-3 block">inventory_2</span>
        <p class="text-sm font-bold text-on-surface">Create Bundle</p><p class="text-xs text-outline">Group & submit</p>
      </div>
      <div onclick="navigate('wallet');setTimeout(()=>toggleOcrUpload&&toggleOcrUpload(),300)" class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all card-hover">
        <span class="material-symbols-outlined text-primary text-2xl mb-3 block">document_scanner</span>
        <p class="text-sm font-bold text-on-surface">Scan Receipt</p><p class="text-xs text-outline">OCR auto-fill</p>
      </div>
      <div onclick="navigate('expenses')" class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all card-hover">
        <span class="material-symbols-outlined text-primary text-2xl mb-3 block">receipt_long</span>
        <p class="text-sm font-bold text-on-surface">My Expenses</p><p class="text-xs text-outline">Track approvals</p>
      </div>
    </div>
  </div>`;

  // Animate
  const empW = document.getElementById('emp-wallet');
  const empP = document.getElementById('emp-pending');
  const empA = document.getElementById('emp-approved');
  if (empW) countUp(empW, Math.round(pendingWallet), 1200, sym);
  if (empP) countUp(empP, Math.round(pendingExpenses.reduce((s,e) => s + parseFloat(e.converted_amount || 0), 0)), 1200, sym);
  if (empA) countUp(empA, Math.round(approvedTotal), 1200, sym);
}

registerPage('dashboard', renderDashboard);
