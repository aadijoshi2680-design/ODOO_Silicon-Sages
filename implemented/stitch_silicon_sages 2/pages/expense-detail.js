// Expense Detail Page
function renderExpenseDetail() {
  document.getElementById('page-expense-detail').innerHTML = `
  <div class="p-14 space-y-10">
    <div class="flex items-center justify-between">
      <div>
        <nav class="flex items-center gap-2 text-sm text-on-surface-variant opacity-60 mb-2">
          <span class="cursor-pointer hover:underline" onclick="navigate('dashboard')">Expenses</span>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span>EXP-2025-042</span>
        </nav>
        <h2 class="font-headline text-3xl font-extrabold tracking-tight">Expense Detail</h2>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-2.5 bg-surface-container-high text-on-surface font-medium rounded-md hover:bg-surface-dim transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-sm">print</span>Export PDF</button>
        <button class="px-6 py-2.5 primary-gradient text-white font-semibold rounded-md shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"><span class="material-symbols-outlined text-sm">save</span>Save Changes</button>
      </div>
    </div>
    <!-- Status Tracker -->
    <div class="bg-surface-container-low p-8 rounded-xl">
      <div class="relative flex items-center justify-between max-w-3xl mx-auto">
        <div class="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/20 -translate-y-1/2"></div>
        <div class="absolute top-1/2 left-0 w-2/3 h-0.5 bg-primary -translate-y-1/2"></div>
        <div class="relative flex flex-col items-center gap-3"><div class="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-sm">check</span></div><span class="font-headline text-sm font-bold text-primary">Draft</span></div>
        <div class="relative flex flex-col items-center gap-3"><div class="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-sm">pending</span></div><span class="font-headline text-sm font-bold text-primary">Waiting approval</span></div>
        <div class="relative flex flex-col items-center gap-3"><div class="h-10 w-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center"><span class="material-symbols-outlined text-sm">verified</span></div><span class="font-headline text-sm font-medium text-on-surface-variant opacity-60">Approved</span></div>
      </div>
    </div>
    <!-- Bento Layout -->
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-8 space-y-8">
        <section class="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
          <div class="flex items-center justify-between mb-8">
            <h3 class="font-headline text-xl font-bold">General Information</h3>
            <button class="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"><span class="material-symbols-outlined text-base">attach_file</span>Attach Receipt</button>
          </div>
          <div class="grid grid-cols-2 gap-x-10 gap-y-8">
            <div class="space-y-2 col-span-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label><input class="w-full bg-surface-container-low border-transparent rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface" type="text" value="Client Dinner - Q3 Strategy Review"/></div>
            <div class="space-y-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Expense Date</label><div class="relative"><input class="w-full bg-surface-container-low border-transparent rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface" type="text" value="Oct 04, 2025"/><span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">calendar_today</span></div></div>
            <div class="space-y-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category</label><select class="w-full bg-surface-container-low border-transparent rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface appearance-none"><option>Meals &amp; Entertainment</option><option>Travel</option><option>Office Supplies</option></select></div>
            <div class="space-y-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Paid by</label><select class="w-full bg-surface-container-low border-transparent rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface appearance-none"><option>Personal Credit Card</option><option>Company Card (Mastercard ...4421)</option><option>Cash</option></select></div>
            <div class="space-y-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount &amp; Currency</label><div class="flex gap-0"><select class="w-24 bg-surface-container-low border-r border-outline-variant/20 rounded-l-md focus:ring-0 focus:bg-white transition-all px-4 py-3 text-on-surface appearance-none"><option>EUR</option><option>USD</option><option>GBP</option></select><input class="flex-1 bg-surface-container-low border-transparent rounded-r-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface" type="text" value="450.00"/></div></div>
            <div class="space-y-2 col-span-2"><label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Remarks</label><textarea class="w-full bg-surface-container-low border-transparent rounded-md focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface" rows="3">Attended by 4 representatives from the architecture firm and our account lead. Discussed Phase 2 budget allocations.</textarea></div>
          </div>
        </section>
        <div class="flex justify-end pt-4"><button class="group px-12 py-4 primary-gradient text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">Submit Expense <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">send</span></button></div>
      </div>
      <aside class="col-span-4 space-y-8">
        <section class="bg-primary text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
          <div class="absolute -right-10 -top-10 h-40 w-40 bg-white/5 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <h4 class="text-primary-fixed text-xs font-bold uppercase tracking-widest mb-6 opacity-80">Total Value</h4>
            <div class="space-y-1 mb-8"><p class="text-4xl font-headline font-extrabold tracking-tight">€450.00</p><p class="text-primary-fixed text-xl font-medium opacity-90">$482.15 USD</p></div>
            <div class="flex items-start gap-3 bg-black/10 p-4 rounded-lg"><span class="material-symbols-outlined text-primary-fixed">info</span><p class="text-xs leading-relaxed text-primary-fixed/80">Converted using real-time market rates as of Oct 4, 12:44 PM.</p></div>
          </div>
        </section>
        <section class="bg-surface-container-highest/50 p-8 rounded-xl border border-outline-variant/10">
          <h3 class="font-headline text-lg font-bold mb-6">Approval Log</h3>
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="relative"><div class="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white"><img alt="Approver" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC_P5BM5-U5TXoAfa7a3I8PWnFmHPCx7dcE1Sa5pcCkTa3vxVA0tAmrIlS23E1crM9ALp496EIBXUiJLs2ub7FEy0zxuFPfOII4ZyJcdsrar8E8KW3vi09VE0-TAqKRlWcu3gT3jScIQvwIxPjP0kK2WDe5V-rhO5w1BNQdUQ1eDQ3E11K57nwbxqeyTFaYTdOWfghTrYqE77QLj_a6c_irqlYdRzF7iYAPSyS3xocnRoxKNqwg2nY9aXXff6nhcPrlQEWqfYLjCY" class="w-full h-full object-cover"/></div><div class="absolute -right-1 -bottom-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-surface"><span class="material-symbols-outlined text-[10px] text-white" style="font-variation-settings:'FILL' 1;">check</span></div></div>
              <div class="flex-1"><div class="flex items-center justify-between mb-1"><span class="font-bold text-sm">Sarah Jenkins</span><span class="text-[10px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold uppercase">Approved</span></div><p class="text-xs text-on-surface-variant leading-snug">Budget verified. Aligns with Q3 marketing entertainment allocation.</p><p class="text-[10px] text-on-surface-variant opacity-50 mt-2">12:44 PM • Oct 04, 2025</p></div>
            </div>
            <div class="flex gap-4 opacity-50">
              <div class="h-10 w-10 rounded-full bg-surface-dim flex items-center justify-center"><span class="material-symbols-outlined text-on-surface-variant">person_search</span></div>
              <div class="flex-1"><div class="flex items-center justify-between mb-1"><span class="font-bold text-sm">Finance Dept</span><span class="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase">Pending</span></div><p class="text-xs italic">Awaiting final reconciliation...</p></div>
            </div>
          </div>
        </section>
        <section class="relative group cursor-pointer overflow-hidden rounded-xl border border-outline-variant/10">
          <img alt="Receipt" class="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCKaPTChs1KDsjOwcfq6CEosIH0bftxoyiWu7lA0TYsPIMpOccK7zMEGNvTtSKjSdIkOPAahsRMh0EPYek63zkseomHy5vkS8e6javpQGYWXguhDTT2uCYwIKB_2GAoWH1VLSEV_0RCW11IEG7Tx_xp7r7HOYH7XIamkcvoHSh0shyZUO8Zo7hth0a1XvZy0O1WyD5wGSZJHWnKFf08byPfVpsBCdCjQABJ3fK119HSf5lS_FPwDGMh7rjJCaEzq0u8Ff_mqVjjXc"/>
          <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-white text-3xl">zoom_in</span><span class="text-white text-xs font-bold mt-2">View Full Receipt</span></div>
        </section>
      </aside>
    </div>
  </div>`;
}

(function(){
  const _nav = window.navigate;
  window.navigate = function(page) {
    _nav(page);
    if (page === 'expense-detail') renderExpenseDetail();
  };
})();
