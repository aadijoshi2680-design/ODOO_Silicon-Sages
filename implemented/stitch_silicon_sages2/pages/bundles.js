// ============================================================
// Bundles Page — API-backed bundle management
// Simplified: primarily directs users to use direct wallet submit
// ============================================================

async function renderBundles() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const container = document.getElementById('page-bundles');

  container.innerHTML = `<div class="p-8 lg:p-12"><div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div></div></div>`;

  const walletEntries = await DataStore.getWalletEntries(user.id);
  const walletItems = walletEntries.filter(e => e.status === 'wallet');
  const submittedItems = walletEntries.filter(e => e.status === 'submitted');

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Expense Bundles</h2>
        <p class="text-outline mt-1 font-medium">Group wallet entries and submit them together for approval.</p>
      </div>
      <button onclick="showCreateBundleModal()" class="flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press">
        <span class="material-symbols-outlined text-sm">add_circle</span> Create Bundle
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm card-hover">
        <p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">In Wallet</p>
        <p class="text-3xl font-headline font-extrabold text-on-surface" id="bundle-stat-available">0</p>
      </div>
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm card-hover">
        <p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Submitted</p>
        <p class="text-3xl font-headline font-extrabold text-on-surface" id="bundle-stat-submitted">0</p>
      </div>
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm card-hover">
        <p class="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">Wallet Total</p>
        <p class="text-3xl font-headline font-extrabold text-primary" id="bundle-stat-total">${sym}0</p>
      </div>
    </div>

    <!-- Quick Submit Info -->
    <div class="bg-primary-fixed/20 p-6 rounded-xl flex items-start gap-4">
      <span class="material-symbols-outlined text-primary text-2xl mt-0.5">tips_and_updates</span>
      <div>
        <p class="text-sm font-bold text-on-surface mb-1">Direct Submit Available</p>
        <p class="text-xs text-on-surface-variant">You can now submit individual wallet entries directly for approval from the <a href="#" onclick="navigate('wallet');return false;" class="text-primary font-bold hover:underline">My Wallet</a> page — no need to create a bundle first!</p>
      </div>
    </div>

    <!-- Available Wallet Entries for Bundling -->
    <section>
      <h3 class="font-headline font-bold text-xl text-on-surface mb-4">Available for Bundling</h3>
      ${walletItems.length === 0 ? `
      <div class="bg-surface-container-lowest p-12 rounded-2xl text-center border border-outline-variant/5">
        <span class="material-symbols-outlined text-5xl text-outline/20 mb-3">inventory_2</span>
        <p class="text-lg font-headline font-bold text-on-surface-variant mb-1">No wallet entries available</p>
        <p class="text-sm text-outline mb-6">Add expenses to your wallet first, or submit them individually.</p>
        <button onclick="navigate('wallet')" class="px-6 py-2.5 primary-gradient text-white font-bold rounded-lg text-sm hover:opacity-90 transition-all btn-press">Go to Wallet</button>
      </div>` : `
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th class="px-8 py-3 w-10"><input type="checkbox" id="bundle-select-all" onchange="toggleAllBundleEntries(this)"/></th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Description</th>
                <th class="px-4 py-3 text-right">Amount (${company.currency})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              ${walletItems.map((e, i) => `
              <tr class="hover:bg-surface-dim/30 transition-colors row-enter" style="animation-delay:${i*0.04}s">
                <td class="px-8 py-3"><input type="checkbox" class="bundle-entry-check" data-id="${e.id}" data-amount="${e.converted_amount || 0}"/></td>
                <td class="px-4 py-3 text-sm text-on-surface-variant">${fmtDateShort(e.date)}</td>
                <td class="px-4 py-3"><span class="text-[10px] font-bold uppercase bg-surface-container-high px-2 py-0.5 rounded text-outline">${e.category}</span></td>
                <td class="px-4 py-3 text-sm font-medium text-on-surface">${e.description}</td>
                <td class="px-4 py-3 text-sm font-bold text-right text-primary">${sym}${Math.round(parseFloat(e.converted_amount || 0)).toLocaleString()}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="px-8 py-4 bg-surface-container-low/30 flex items-center justify-between border-t border-outline-variant/10">
          <span id="bundle-selected-total" class="text-sm font-bold text-outline">0 entries selected (${sym}0)</span>
          <button onclick="submitBundleFromSelection()" class="px-6 py-2.5 primary-gradient text-white font-bold rounded-lg text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">send</span> Submit Selected as Bundle
          </button>
        </div>
      </div>`}
    </section>
  </div>`;

  // Animate stats
  countUp(document.getElementById('bundle-stat-available'), walletItems.length, 600);
  countUp(document.getElementById('bundle-stat-submitted'), submittedItems.length, 600);
  const walletTotal = walletItems.reduce((s, e) => s + parseFloat(e.converted_amount || 0), 0);
  countUp(document.getElementById('bundle-stat-total'), Math.round(walletTotal), 800, sym);

  // checkbox listeners
  setTimeout(() => {
    document.querySelectorAll('.bundle-entry-check').forEach(cb => {
      cb.addEventListener('change', updateBundleSelectedTotal);
    });
  }, 100);
}

function toggleAllBundleEntries(master) {
  document.querySelectorAll('.bundle-entry-check').forEach(cb => { cb.checked = master.checked; });
  updateBundleSelectedTotal();
}

function updateBundleSelectedTotal() {
  const company = AuthState.getCurrentCompany();
  const sym = company ? CurrencyService.getCurrencySymbol(company.currency) : '₹';
  let total = 0; let count = 0;
  document.querySelectorAll('.bundle-entry-check:checked').forEach(cb => {
    total += parseFloat(cb.dataset.amount) || 0;
    count++;
  });
  const el = document.getElementById('bundle-selected-total');
  if (el) el.textContent = `${count} entries selected (${sym}${Math.round(total).toLocaleString()})`;
}

async function submitBundleFromSelection() {
  const checked = document.querySelectorAll('.bundle-entry-check:checked');
  if (checked.length === 0) { showToast('Select at least one entry', 'warning'); return; }

  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
  const entries = await DataStore.getWalletEntries(user.id);
  const selected = entries.filter(e => ids.includes(e.id) && e.status === 'wallet');

  if (selected.length === 0) { showToast('No eligible entries', 'error'); return; }

  const chain = await DataStore.buildApprovalChain(company.id, user.id);
  if (chain.length === 0) { showToast('No approvers configured', 'warning'); return; }

  const total = selected.reduce((s, e) => s + parseFloat(e.converted_amount || 0), 0);

  const result = await DataStore.submitExpense(user.id, company.id, {
    amount: total,
    currency: company.currency,
    convertedAmount: total,
    exchangeRate: 1,
    category: 'Bundle',
    description: `Bundle: ${selected.length} expenses`,
    date: new Date().toISOString().split('T')[0],
    approvalChain: chain,
    walletEntryIds: ids,
  });

  if (result && !result.error) {
    fireConfetti({ count: 80, spread: 70 });
    showToast(`Bundle submitted — ${chain.length} approver(s) in pipeline`, 'success');
    renderBundles();
  } else {
    showToast('Failed to submit bundle', 'error');
  }
}

function showCreateBundleModal() {
  // Redirect to wallet for a more streamlined experience
  navigate('wallet');
  showToast('Tip: Select entries and use "Send to Approval" to submit directly', 'info');
}

registerPage('bundles', renderBundles);
