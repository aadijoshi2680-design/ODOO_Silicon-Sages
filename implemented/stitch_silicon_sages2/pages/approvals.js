// ============================================================
// Team Approvals — Admin/Manager/C-suite
// Pending + Previously Actioned with detail modal
// ============================================================

async function renderApprovals() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;
  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const container = document.getElementById('page-approvals');

  // Loading
  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full">
    <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Approvals to review</h2>
    <div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div><p class="text-sm text-outline mt-4">Loading approvals...</p></div>
  </div>`;

  // Fetch data
  const pending = await DataStore.getExpensesPendingApproval(user.id);
  const allExpenses = await DataStore.getExpensesByCompany(company.id);
  const actioned = allExpenses.filter(e => {
    const chain = e.approval_chain || [];
    return chain.some(s => s.approverId === user.id && (s.status === 'approved' || s.status === 'rejected'));
  });

  const pendingTotal = pending.reduce((s, e) => s + parseFloat(e.converted_amount || e.amount || 0), 0);

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Approvals to review</h2>
        <p class="text-outline mt-1 font-medium">Manage and audit pending expense requests from your team.</p>
      </div>
      <button onclick="exportApprovals()" class="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-primary font-bold text-sm hover:bg-surface-dim transition-all btn-press">
        <span class="material-symbols-outlined text-base">download</span> Export Report
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Pending Count</p>
        <p id="app-pending-count" class="text-3xl font-headline font-extrabold text-on-surface">0</p>
        <p class="text-xs text-outline mt-1">requests</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Pending Total</p>
        <p id="app-pending-total" class="text-3xl font-headline font-extrabold text-on-surface">${sym}0</p>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 shadow-sm">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Previously Actioned</p>
        <p id="app-actioned-count" class="text-3xl font-headline font-extrabold text-on-surface">0</p>
        <p class="text-xs text-outline mt-1">total</p>
      </div>
    </div>

    <!-- Pending Approval Table -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-5 bg-surface-container-low/50">
        <h3 class="font-headline font-bold text-lg text-on-surface">Pending Approval</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-3">Employee</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-center">Progress</th>
              <th class="px-4 py-3 text-right">Amount (${company.currency})</th>
              <th class="px-8 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            ${pending.length === 0 ? `<tr><td colspan="6" class="px-8 py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-outline/20 mb-2">verified</span>
              <p class="text-sm text-outline font-medium">All caught up! No pending approvals.</p>
            </td></tr>` : pending.map((e, i) => pendingApprovalRow(e, sym, i, user.id)).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Previously Actioned -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-5 bg-surface-container-low/50 flex items-center justify-between">
        <h3 class="font-headline font-bold text-lg text-on-surface">Previously Actioned</h3>
        <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${actioned.length} items</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-3">Employee</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3 text-center">Decision</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-8 py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            ${actioned.length === 0 ? `<tr><td colspan="7" class="px-8 py-8 text-center text-sm text-outline">No previously actioned items</td></tr>` :
              actioned.map((e, i) => actionedRow(e, sym, i, user.id)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Detail Modal -->
  <div id="approval-detail-modal" class="hidden fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeDetailModal()">
    <div class="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 scale-in">
      <div id="approval-detail-content"></div>
    </div>
  </div>`;

  // Animate stats
  countUp(document.getElementById('app-pending-count'), pending.length, 600);
  countUp(document.getElementById('app-pending-total'), Math.round(pendingTotal), 900, sym);
  countUp(document.getElementById('app-actioned-count'), actioned.length, 600);
}

function pendingApprovalRow(e, sym, i, userId) {
  const chain = e.approval_chain || [];
  const totalSteps = chain.length;
  const approved = chain.filter(s => s.status === 'approved').length;
  const pct = totalSteps > 0 ? Math.round((approved / totalSteps) * 100) : 0;

  // Find the current step and check if it's this user's turn
  const currentStep = chain.filter(s => s.status === 'pending').sort((a, b) => a.step - b.step)[0];
  const isMyTurn = currentStep && currentStep.approverId === userId;
  const myStep = chain.find(s => s.approverId === userId && s.status === 'pending');

  return `
    <tr class="hover:bg-surface-dim/30 transition-colors row-enter ${!isMyTurn ? 'opacity-60' : ''}" style="animation-delay:${i*0.05}s">
      <td class="px-8 py-4 text-sm font-medium text-on-surface">${e.submitter_name || 'Unknown'}</td>
      <td class="px-4 py-4 text-sm text-on-surface-variant max-w-[180px] truncate">${e.description || '—'}</td>
      <td class="px-4 py-4"><span class="text-[10px] font-bold uppercase bg-surface-container-high px-2 py-1 rounded text-outline">${e.category || '—'}</span></td>
      <td class="px-4 py-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <div class="approval-bar-track flex-1"><div class="approval-bar-fill primary-gradient" style="width:${pct}%"></div></div>
            <span class="text-[10px] font-bold text-outline">${approved}/${totalSteps}</span>
          </div>
          <span class="text-[9px] font-bold ${isMyTurn ? 'text-[#065F46]' : 'text-outline'}">
            ${isMyTurn ? `✦ Step ${currentStep.step} of ${totalSteps} — Your Turn` : `Waiting: Step ${currentStep ? currentStep.step : '?'} (${currentStep ? currentStep.approverName : '?'})`}
          </span>
        </div>
      </td>
      <td class="px-4 py-4 text-sm font-bold text-right text-primary">${sym}${Math.round(e.converted_amount || e.amount || 0).toLocaleString()}</td>
      <td class="px-8 py-4 text-center">
        ${isMyTurn ? `
        <div class="flex items-center gap-2 justify-center">
          <button onclick="handleApprove(${e.id}, ${userId})" class="px-3 py-1.5 bg-[#D1FAE5] text-[#065F46] text-[11px] font-bold rounded-lg hover:bg-[#A7F3D0] transition-colors btn-press">
            <span class="material-symbols-outlined text-sm align-middle mr-1">check</span>Approve
          </button>
          <button onclick="handleReject(${e.id}, ${userId})" class="px-3 py-1.5 bg-[#FEF2F2] text-[#991B1B] text-[11px] font-bold rounded-lg hover:bg-[#FECACA] transition-colors btn-press">
            <span class="material-symbols-outlined text-sm align-middle mr-1">close</span>Reject
          </button>
        </div>` : `
        <span class="text-[10px] text-outline italic">Not your turn</span>`}
      </td>
    </tr>`;
}

function actionedRow(e, sym, i, userId) {
  const chain = e.approval_chain || [];
  const myStep = chain.find(s => s.approverId === userId && (s.status === 'approved' || s.status === 'rejected'));
  const status = myStep ? myStep.status : e.status;
  const decidedAt = myStep ? myStep.decidedAt : e.submitted_at;
  const sc = status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF2F2] text-[#991B1B]';

  return `
    <tr class="hover:bg-surface-dim/30 transition-colors row-enter" style="animation-delay:${i*0.04}s">
      <td class="px-8 py-4 text-sm font-medium text-on-surface">${e.submitter_name || 'Unknown'}</td>
      <td class="px-4 py-4 text-sm text-on-surface-variant max-w-[180px] truncate">${e.description || '—'}</td>
      <td class="px-4 py-4"><span class="text-[10px] font-bold uppercase bg-surface-container-high px-2 py-1 rounded text-outline">${e.category || '—'}</span></td>
      <td class="px-4 py-4 text-sm font-bold text-right text-primary">${sym}${Math.round(e.converted_amount || e.amount || 0).toLocaleString()}</td>
      <td class="px-4 py-4 text-center"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc}">${status}</span></td>
      <td class="px-4 py-4 text-sm text-on-surface-variant">${fmtDateShort(decidedAt)}</td>
      <td class="px-8 py-4 text-center">
        <button onclick='showExpenseDetail(${JSON.stringify(e).replace(/'/g, "&#39;")})' class="px-3 py-1.5 bg-primary-fixed text-primary text-[11px] font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors btn-press">
          <span class="material-symbols-outlined text-sm align-middle mr-1">visibility</span>Details
        </button>
      </td>
    </tr>`;
}

function showExpenseDetail(expense) {
  const modal = document.getElementById('approval-detail-modal');
  const content = document.getElementById('approval-detail-content');
  const company = AuthState.getCurrentCompany();
  const sym = company ? CurrencyService.getCurrencySymbol(company.currency) : '₹';
  const chain = expense.approval_chain || [];

  content.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-headline text-xl font-bold text-on-surface">Expense Details</h3>
      <button onclick="closeDetailModal()" class="text-on-surface-variant hover:text-on-surface transition-colors">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-surface-container-low p-4 rounded-xl">
          <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Employee</p>
          <p class="text-sm font-semibold text-on-surface">${expense.submitter_name || 'Unknown'}</p>
        </div>
        <div class="bg-surface-container-low p-4 rounded-xl">
          <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Department</p>
          <p class="text-sm font-semibold text-on-surface">${expense.department_name || 'Unassigned'}</p>
        </div>
        <div class="bg-surface-container-low p-4 rounded-xl">
          <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Amount</p>
          <p class="text-sm font-bold text-primary">${expense.currency} ${parseFloat(expense.amount).toLocaleString()} → ${sym}${Math.round(expense.converted_amount || expense.amount).toLocaleString()}</p>
        </div>
        <div class="bg-surface-container-low p-4 rounded-xl">
          <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Category</p>
          <p class="text-sm font-semibold text-on-surface">${expense.category || '—'}</p>
        </div>
      </div>
      <div class="bg-surface-container-low p-4 rounded-xl">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Description — Where the money was used</p>
        <p class="text-sm text-on-surface leading-relaxed">${expense.description || 'No description provided'}</p>
      </div>
      <div class="bg-surface-container-low p-4 rounded-xl">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Date</p>
        <p class="text-sm text-on-surface">${fmtDateFull(expense.date || expense.submitted_at)}</p>
      </div>
      <div class="bg-surface-container-low p-4 rounded-xl">
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Status</p>
        <span class="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase ${expense.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : expense.status === 'rejected' ? 'bg-[#FEF2F2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'}">${expense.status}</span>
      </div>

      <!-- Approval Chain -->
      ${chain.length > 0 ? `
      <div>
        <p class="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Approval Chain</p>
        <div class="space-y-2">
          ${chain.map(step => {
            const stColor = step.status === 'approved' ? 'border-[#10B981] bg-[#D1FAE5]/50' :
                           step.status === 'rejected' ? 'border-[#EF4444] bg-[#FEF2F2]/50' :
                           step.status === 'skipped' ? 'border-[#9CA3AF] bg-[#F3F4F6]/50' :
                           'border-outline-variant/20 bg-surface-container-low/50';
            return `
            <div class="flex items-center justify-between p-3 rounded-lg border ${stColor}">
              <div>
                <p class="text-sm font-semibold text-on-surface">Step ${step.step}: ${step.approverName}</p>
                <p class="text-[10px] text-outline uppercase">${step.role}</p>
                ${step.comment ? `<p class="text-xs text-on-surface-variant mt-1 italic">"${step.comment}"</p>` : ''}
              </div>
              <span class="text-[10px] font-bold uppercase ${step.status === 'approved' ? 'text-[#065F46]' : step.status === 'rejected' ? 'text-[#991B1B]' : 'text-outline'}">${step.status}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>`;

  modal.classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('approval-detail-modal').classList.add('hidden');
}

async function handleApprove(expenseId, userId) {
  const comment = prompt('Add a comment (optional):') || '';
  const result = await DataStore.approveExpenseStep(expenseId, userId, comment);
  if (result && !result.error) {
    if (result.auto_approved) {
      showToast(`🚀 ${result.auto_reason || 'Auto-approved by conditional rule!'}`, 'success', 5000);
    } else if (result.status === 'approved') {
      showToast('Expense fully approved ✓ All steps complete!', 'success');
    } else {
      showToast('Step approved ✓ Moving to next approver', 'success');
    }
    fireConfetti({ count: 40, spread: 60 });
    renderApprovals();
  } else {
    showToast(result?.error || 'Failed to approve', 'error');
  }
}

async function handleReject(expenseId, userId) {
  const comment = prompt('Reason for rejection:');
  if (comment === null) return; // cancelled
  const result = await DataStore.rejectExpenseStep(expenseId, userId, comment);
  if (result && !result.error) {
    showToast('Expense rejected — remaining steps skipped', 'warning');
    renderApprovals();
  } else {
    showToast(result?.error || 'Failed to reject', 'error');
  }
}

function exportApprovals() {
  showToast('Export feature coming soon', 'info');
}

registerPage('approvals', renderApprovals);
