// ============================================================
// My Wallet Page — API-backed with OCR & direct submit
// Employee can submit entries directly for approval
// ============================================================

const CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Entertainment', 'Other'];

function getStatusBadge(status) {
  const map = {
    wallet: { label: 'In Wallet', class: 'bg-primary-fixed text-on-primary-fixed-variant', icon: 'account_balance_wallet' },
    bundle: { label: 'In Bundle', class: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'inventory_2' },
    submitted: { label: 'Submitted', class: 'bg-surface-container-highest text-on-surface-variant', icon: 'send' },
  };
  const s = map[status] || map.wallet;
  return `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.class}"><span class="material-symbols-outlined text-[11px]">${s.icon}</span>${s.label}</span>`;
}

async function renderWallet() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const container = document.getElementById('page-wallet');
  container.innerHTML = `<div class="p-8 lg:p-12"><div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div><p class="text-sm text-outline mt-4">Loading wallet...</p></div></div>`;

  const allEntries = await DataStore.getWalletEntries(user.id);
  const walletItems = allEntries.filter(e => e.status === 'wallet');
  const runningTotal = walletItems.reduce((sum, e) => sum + parseFloat(e.converted_amount || 0), 0);
  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const currencies = CurrencyService.getAvailableCurrencies();

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <!-- Header -->
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">My Wallet</h2>
        <p class="text-outline mt-1 font-medium">Log expenses on the go. Submit them when you're ready.</p>
      </div>
      <div class="flex gap-3">
        <button onclick="toggleOcrUpload()" class="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-primary font-bold text-sm hover:bg-surface-dim transition-all btn-press">
          <span class="material-symbols-outlined">document_scanner</span> Scan Receipt
        </button>
        <button onclick="toggleAddEntry()" class="flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press">
          <span class="material-symbols-outlined text-sm">add_circle</span> Add Entry
        </button>
      </div>
    </div>

    <!-- Add Entry Form (hidden) -->
    <div id="wallet-add-form" class="hidden">
      <section class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5 fade-in-up">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">edit_note</span> New Wallet Entry
          </h3>
          <button onclick="toggleAddEntry()" class="text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form id="wallet-entry-form" onsubmit="event.preventDefault();addWalletEntry();" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount & Currency</label>
            <div class="flex gap-0">
              <select id="entry-currency" onchange="updateConversion()" class="w-24 bg-surface-container-low border-r border-outline-variant/20 rounded-l-lg focus:ring-0 focus:bg-white transition-all px-3 py-3 text-on-surface text-sm appearance-none form-field">
                ${currencies.map(c => `<option ${c === company.currency ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
              <input id="entry-amount" oninput="updateConversion()" class="flex-1 bg-surface-container-low border-transparent rounded-r-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="number" step="0.01" placeholder="0.00" required/>
            </div>
            <div id="entry-converted" class="text-xs text-primary font-semibold px-1 currency-counter">≈ ${sym}0.00 ${company.currency}</div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category</label>
            <select id="entry-category" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface text-sm appearance-none form-field">
              ${CATEGORIES.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Expense Date</label>
            <input id="entry-date" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="date" value="${new Date().toISOString().split('T')[0]}" max="${new Date().toISOString().split('T')[0]}" required/>
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
            <input id="entry-desc" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="text" placeholder="What was this expense for?" required/>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tags (Optional)</label>
            <input id="entry-tags" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field" type="text" placeholder="e.g. client, Project X"/>
          </div>
          <div class="flex items-end md:col-span-2 lg:col-span-3 gap-3 justify-end">
            <button type="button" onclick="toggleAddEntry()" class="px-6 py-3 bg-surface-container-high text-on-surface font-medium rounded-lg hover:bg-surface-dim transition-colors">Cancel</button>
            <button type="submit" class="px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">add</span> Add to Wallet
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- OCR Upload Section (hidden) -->
    <div id="wallet-ocr-section" class="hidden">
      <section class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5 fade-in-up">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">document_scanner</span> AI Receipt Scanner
            <span class="text-[10px] font-bold bg-primary-fixed text-primary px-2 py-0.5 rounded-full ml-2">GEMINI VISION</span>
          </h3>
          <button onclick="toggleOcrUpload()" class="text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div id="ocr-drop-zone" class="relative border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer group" onclick="document.getElementById('ocr-file-input').click()">
              <input id="ocr-file-input" type="file" accept="image/*,.pdf" class="hidden" onchange="handleOcrUpload(event)"/>
              <div id="ocr-preview" class="hidden relative"><img id="ocr-preview-img" class="w-full rounded-lg" alt="Receipt preview"/></div>
              <div id="ocr-placeholder" class="py-8">
                <span class="material-symbols-outlined text-5xl text-outline/30 group-hover:text-primary/50 transition-colors">cloud_upload</span>
                <p class="mt-4 font-semibold text-on-surface-variant">Drop receipt image here</p>
                <p class="text-xs text-outline mt-1">or click to browse (JPG, PNG, WebP)</p>
              </div>
            </div>
          </div>
          <div>
            <div id="ocr-results" class="space-y-4">
              <div class="flex items-center gap-3 mb-6">
                <div class="dot-pulse" id="ocr-loading" style="display:none"><span></span><span></span><span></span></div>
                <span id="ocr-status" class="text-sm font-medium text-on-surface-variant">Upload a receipt to begin scanning</span>
                <span id="ocr-badge" class="hidden inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46]">
                  <span class="material-symbols-outlined text-[12px]">check_circle</span> OCR Complete
                </span>
              </div>
              <div class="space-y-3">
                <div class="space-y-1"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount</label>
                <input id="ocr-amount" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" type="text" placeholder="—" readonly/></div>
                <div class="space-y-1"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Currency</label>
                <input id="ocr-currency" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" type="text" placeholder="—" readonly/></div>
                <div class="space-y-1"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Date</label>
                <input id="ocr-date" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" type="text" placeholder="—" readonly/></div>
                <div class="space-y-1"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Vendor</label>
                <input id="ocr-vendor" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" type="text" placeholder="—" readonly/></div>
                <div class="space-y-1"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category</label>
                <input id="ocr-category" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" type="text" placeholder="—" readonly/></div>
                <div id="ocr-reasoning" class="hidden mt-2 p-3 bg-primary-fixed/30 rounded-lg">
                  <p class="text-[11px] font-bold text-primary mb-1">AI REASONING</p>
                  <p id="ocr-reasoning-text" class="text-xs text-on-surface-variant"></p>
                </div>
              </div>
              <button id="ocr-save-btn" class="hidden w-full py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press mt-4" onclick="saveOcrToWallet()">
                Save to Wallet
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Wallet Table -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-6 flex items-center justify-between bg-surface-container-low/50">
        <div class="flex items-center gap-4">
          <h3 class="font-headline font-bold text-xl text-on-surface">Wallet Entries</h3>
          <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${allEntries.length} entries</span>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="submitSelectedToApproval()" class="flex items-center gap-2 text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] px-4 py-2 rounded-lg transition-all btn-press shadow-sm">
            <span class="material-symbols-outlined text-base">send</span> Send to Approval
          </button>
          <button onclick="navigate('bundles')" class="flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all">
            <span class="material-symbols-outlined text-base">inventory_2</span> Create Bundle
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-4 w-10"><input type="checkbox" class="wallet-checkbox" onchange="toggleAllWallet(this)"/></th>
              <th class="px-4 py-4">Date</th>
              <th class="px-4 py-4">Category</th>
              <th class="px-4 py-4">Description</th>
              <th class="px-4 py-4 text-right">Amount</th>
              <th class="px-4 py-4 text-right">Converted (${company.currency})</th>
              <th class="px-4 py-4 text-center">Status</th>
              <th class="px-4 py-4">Tags</th>
              <th class="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10" id="wallet-tbody">
            ${allEntries.length === 0 ? `
            <tr><td colspan="9" class="px-8 py-12 text-center">
              <span class="material-symbols-outlined text-4xl text-outline/20 mb-2">account_balance_wallet</span>
              <p class="text-sm text-outline font-medium">Your wallet is empty. Add your first expense!</p>
            </td></tr>` : allEntries.map((e, i) => walletRow(e, i, sym)).join('')}
          </tbody>
        </table>
      </div>
      <div class="px-8 py-5 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary">functions</span>
          <span class="text-sm font-bold text-primary">Running Total (In Wallet only)</span>
        </div>
        <span id="wallet-total" class="text-2xl font-headline font-extrabold text-primary">${sym}0</span>
      </div>
    </div>
  </div>`;

  const totalEl = document.getElementById('wallet-total');
  if (totalEl) countUp(totalEl, Math.round(runningTotal), 1200, sym, '');
}

function walletRow(entry, index, sym) {
  const isEditable = entry.status === 'wallet';
  const rowClass = entry.status === 'submitted'
    ? 'bg-surface-container-low/40 opacity-60'
    : 'hover:bg-surface-dim/30 transition-colors';
  const tags = (typeof entry.tags === 'string' ? JSON.parse(entry.tags || '[]') : entry.tags) || [];

  return `
    <tr class="${rowClass} row-enter" style="animation-delay:${index * 0.05}s">
      <td class="px-8 py-4"><input type="checkbox" class="wallet-checkbox wallet-item-check" data-id="${entry.id}" ${!isEditable ? 'disabled' : ''}/></td>
      <td class="px-4 py-4 text-sm text-on-surface-variant">${fmtDateShort(entry.date)}</td>
      <td class="px-4 py-4"><span class="px-2.5 py-1 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant uppercase">${entry.category}</span></td>
      <td class="px-4 py-4 text-sm font-medium text-on-surface max-w-[200px] truncate">${entry.description}</td>
      <td class="px-4 py-4 text-sm font-bold text-right">${entry.currency} ${Number(entry.amount).toLocaleString()}</td>
      <td class="px-4 py-4 text-sm font-bold text-right text-primary">${sym}${Math.round(parseFloat(entry.converted_amount || 0)).toLocaleString()}</td>
      <td class="px-4 py-4 text-center">${getStatusBadge(entry.status)}</td>
      <td class="px-4 py-4">${tags.map(t => `<span class="tag-chip">${t}</span>`).join(' ')}</td>
      <td class="px-8 py-4 text-right">
        ${isEditable ? `
          <div class="flex justify-end gap-2">
            <button onclick="submitSingleToApproval(${entry.id})" class="p-1.5 hover:bg-[#D1FAE5] rounded-md transition-colors" title="Send to Approval">
              <span class="material-symbols-outlined text-sm text-[#065F46]">send</span>
            </button>
            <button onclick="handleDeleteWalletEntry(${entry.id})" class="p-1.5 hover:bg-error/10 rounded-md transition-colors" title="Delete">
              <span class="material-symbols-outlined text-sm text-error">delete</span>
            </button>
          </div>
        ` : '<span class="text-[10px] text-outline italic">Locked</span>'}
      </td>
    </tr>`;
}

// ---- Direct submit to approval ----
async function submitSingleToApproval(entryId) {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const entries = await DataStore.getWalletEntries(user.id);
  const entry = entries.find(e => e.id === entryId);
  if (!entry || entry.status !== 'wallet') { showToast('Entry not available', 'error'); return; }

  const chain = await DataStore.buildApprovalChain(company.id, user.id);
  if (chain.length === 0) { showToast('No approvers configured. Contact admin.', 'warning'); return; }

  const result = await DataStore.submitExpense(user.id, company.id, {
    amount: entry.amount,
    currency: entry.currency,
    convertedAmount: entry.converted_amount,
    exchangeRate: entry.exchange_rate,
    category: entry.category,
    description: entry.description,
    date: entry.date,
    approvalChain: chain,
    walletEntryIds: [entryId],
  });

  if (result && !result.error) {
    showToast('Expense sent for approval ✓', 'success');
    fireConfetti({ count: 30, spread: 50 });
    renderWallet();
  } else {
    showToast('Failed to submit', 'error');
  }
}

async function submitSelectedToApproval() {
  const checked = document.querySelectorAll('.wallet-item-check:checked');
  if (checked.length === 0) { showToast('Select wallet entries to submit', 'warning'); return; }

  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
  const entries = await DataStore.getWalletEntries(user.id);
  const selected = entries.filter(e => ids.includes(e.id) && e.status === 'wallet');

  if (selected.length === 0) { showToast('No eligible entries', 'error'); return; }

  const chain = await DataStore.buildApprovalChain(company.id, user.id);
  if (chain.length === 0) { showToast('No approvers configured', 'warning'); return; }

  // Submit each individually
  let success = 0;
  for (const entry of selected) {
    const result = await DataStore.submitExpense(user.id, company.id, {
      amount: entry.amount,
      currency: entry.currency,
      convertedAmount: entry.converted_amount,
      exchangeRate: entry.exchange_rate,
      category: entry.category,
      description: entry.description,
      date: entry.date,
      approvalChain: chain,
      walletEntryIds: [entry.id],
    });
    if (result && !result.error) success++;
  }

  showToast(`${success} expense(s) sent for approval ✓`, 'success');
  if (success > 0) fireConfetti({ count: 50, spread: 70 });
  renderWallet();
}

function toggleAddEntry() {
  const form = document.getElementById('wallet-add-form');
  const ocr = document.getElementById('wallet-ocr-section');
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden')) ocr.classList.add('hidden');
}

function toggleOcrUpload() {
  const ocr = document.getElementById('wallet-ocr-section');
  const form = document.getElementById('wallet-add-form');
  ocr.classList.toggle('hidden');
  if (!ocr.classList.contains('hidden')) form.classList.add('hidden');
}

async function updateConversion() {
  const amt = parseFloat(document.getElementById('entry-amount').value) || 0;
  const curr = document.getElementById('entry-currency').value;
  const company = AuthState.getCurrentCompany();
  if (!company) return;
  const { convertedAmount } = await CurrencyService.convert(amt, curr, company.currency);
  const sym = CurrencyService.getCurrencySymbol(company.currency);
  const el = document.getElementById('entry-converted');
  el.classList.add('currency-flash');
  el.textContent = `≈ ${sym}${convertedAmount.toFixed(2)} ${company.currency}`;
  setTimeout(() => el.classList.remove('currency-flash'), 300);
}

async function addWalletEntry() {
  const amount = parseFloat(document.getElementById('entry-amount').value);
  const currency = document.getElementById('entry-currency').value;
  const category = document.getElementById('entry-category').value;
  const date = document.getElementById('entry-date').value;
  const desc = document.getElementById('entry-desc').value;
  const tagsRaw = document.getElementById('entry-tags').value;

  if (!amount || !desc) {
    if (!amount) shakeField(document.getElementById('entry-amount'));
    if (!desc) shakeField(document.getElementById('entry-desc'));
    return;
  }

  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  const { convertedAmount, rate } = await CurrencyService.convert(amount, currency, company.currency);
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  await DataStore.addWalletEntry(user.id, {
    date, category, description: desc,
    amount, currency,
    convertedAmount, exchangeRate: rate,
    tags,
  });

  toggleAddEntry();
  renderWallet();
  showToast('Entry added to wallet ✓', 'success');
}

async function handleDeleteWalletEntry(id) {
  const success = await DataStore.deleteWalletEntry(id);
  if (success) { renderWallet(); showToast('Entry removed', 'info'); }
}

function toggleAllWallet(masterCheckbox) {
  document.querySelectorAll('.wallet-item-check:not(:disabled)').forEach(cb => { cb.checked = masterCheckbox.checked; });
}

// ---- OCR ----
async function handleOcrUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById('ocr-preview');
  const previewImg = document.getElementById('ocr-preview-img');
  const placeholder = document.getElementById('ocr-placeholder');
  const loading = document.getElementById('ocr-loading');
  const status = document.getElementById('ocr-status');
  const badge = document.getElementById('ocr-badge');
  const saveBtn = document.getElementById('ocr-save-btn');
  const reasoningDiv = document.getElementById('ocr-reasoning');

  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageBase64 = e.target.result;
    previewImg.src = imageBase64;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');

    const scanLine = document.createElement('div'); scanLine.className = 'ocr-line';
    const overlay = document.createElement('div'); overlay.className = 'ocr-overlay';
    preview.appendChild(overlay); preview.appendChild(scanLine);

    loading.style.display = 'flex';
    status.textContent = 'Scanning receipt with AI Vision...';
    badge.classList.add('hidden'); saveBtn.classList.add('hidden'); reasoningDiv.classList.add('hidden');

    const ocrPromise = OCRService.scanReceipt(imageBase64);
    await sleep(1300);
    scanLine.remove(); overlay.remove();
    status.textContent = 'Extracting financial data...';

    let ocrData;
    try {
      const result = await ocrPromise;
      if (result.success) { ocrData = result.data; }
      else { ocrData = OCRService.mockScan(); showToast('Using demo OCR data (API unavailable)', 'warning'); }
    } catch (err) { ocrData = OCRService.mockScan(); showToast('Using demo OCR data', 'warning'); }

    await typewriterFill(document.getElementById('ocr-amount'), String(ocrData.total || 0));
    await typewriterFill(document.getElementById('ocr-currency'), ocrData.currency || 'INR');
    await typewriterFill(document.getElementById('ocr-date'), ocrData.date || 'Unknown');
    await typewriterFill(document.getElementById('ocr-vendor'), ocrData.merchant || 'Unknown Vendor');
    await typewriterFill(document.getElementById('ocr-category'), ocrData.category || 'Other');

    if (ocrData.reasoning) { reasoningDiv.classList.remove('hidden'); document.getElementById('ocr-reasoning-text').textContent = ocrData.reasoning; }

    loading.style.display = 'none'; status.textContent = '';
    badge.classList.remove('hidden'); saveBtn.classList.remove('hidden');
    ['ocr-amount','ocr-currency','ocr-date','ocr-vendor','ocr-category'].forEach(id => { document.getElementById(id).removeAttribute('readonly'); });
  };
  reader.readAsDataURL(file);
}

async function saveOcrToWallet() {
  const amount = parseFloat(String(document.getElementById('ocr-amount').value).replace(/,/g, '')) || 0;
  const currency = document.getElementById('ocr-currency').value || 'INR';
  const dateStr = document.getElementById('ocr-date').value;
  const vendor = document.getElementById('ocr-vendor').value;
  const category = document.getElementById('ocr-category').value;

  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company) return;

  const { convertedAmount, rate } = await CurrencyService.convert(amount, currency, company.currency);
  let date = dateStr;
  try { const p = new Date(dateStr); if (!isNaN(p)) date = p.toISOString().split('T')[0]; } catch {}

  await DataStore.addWalletEntry(user.id, {
    date: date || new Date().toISOString().split('T')[0],
    category: category || 'Other',
    description: vendor || 'Scanned Receipt',
    amount, currency,
    convertedAmount, exchangeRate: rate,
    tags: ['scanned', 'ocr'],
  });

  toggleOcrUpload();
  renderWallet();
  showToast('OCR data saved to wallet ✓', 'success');
}

registerPage('wallet', renderWallet);
