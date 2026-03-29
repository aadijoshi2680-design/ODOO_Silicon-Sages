// Dashboard Page
function renderDashboard() {
  document.getElementById('page-dashboard').innerHTML = `
  <div class="p-12 space-y-10">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Financial Overview</h2>
        <p class="text-outline mt-1 font-medium">Manage your personal expenses and reimbursement claims.</p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-primary font-bold text-sm hover:bg-surface-dim transition-all active:scale-95">
          <span class="material-symbols-outlined">upload</span> Upload
        </button>
        <button onclick="navigate('expense-detail')" class="flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
          <span class="material-symbols-outlined">add_circle</span> New Expense
        </button>
      </div>
    </div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed"><span class="material-symbols-outlined">edit_note</span></div>
          <span class="text-xs font-bold text-outline uppercase tracking-widest">Draft</span>
        </div>
        <div><p class="text-sm font-medium text-outline">To submit</p><p class="text-3xl font-headline font-extrabold text-on-surface">$1,420.50</p></div>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-primary-fixed rounded-lg text-on-primary-fixed"><span class="material-symbols-outlined">schedule</span></div>
          <span class="text-xs font-bold text-outline uppercase tracking-widest">Pending</span>
        </div>
        <div><p class="text-sm font-medium text-outline">Waiting approval</p><p class="text-3xl font-headline font-extrabold text-on-surface">$3,840.00</p></div>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-[#e8f5e9] rounded-lg text-[#2e7d32]"><span class="material-symbols-outlined">verified</span></div>
          <span class="text-xs font-bold text-outline uppercase tracking-widest">Completed</span>
        </div>
        <div><p class="text-sm font-medium text-outline">Approved (Last 30 Days)</p><p class="text-3xl font-headline font-extrabold text-on-surface">$12,150.25</p></div>
      </div>
    </div>
    <!-- Recent Activity Table -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)]">
      <div class="px-8 py-6 flex items-center justify-between bg-surface-container-low/50">
        <h3 class="font-headline font-bold text-xl text-on-surface">Recent Activity</h3>
        <div class="flex items-center gap-4">
          <button class="text-sm font-semibold text-primary hover:underline">Download CSV</button>
          <div class="h-4 w-[1px] bg-outline-variant/30"></div>
          <button class="p-1.5 hover:bg-surface-dim rounded-md transition-colors"><span class="material-symbols-outlined text-outline">filter_list</span></button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr><th class="px-8 py-4">Employee</th><th class="px-6 py-4">Description</th><th class="px-6 py-4">Date</th><th class="px-6 py-4">Category</th><th class="px-6 py-4">Paid By</th><th class="px-6 py-4">Remarks</th><th class="px-6 py-4 text-right">Amount</th><th class="px-8 py-4 text-center">Status</th></tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            ${dashboardRows()}
          </tbody>
        </table>
      </div>
      <div class="px-8 py-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex items-center justify-between">
        <p class="text-xs text-outline font-medium">Showing 4 of 12 expenses</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-white border border-outline-variant/20 rounded text-xs font-bold disabled:opacity-50" disabled>Previous</button>
          <button class="px-3 py-1 bg-white border border-outline-variant/20 rounded text-xs font-bold hover:bg-surface-dim transition-colors">Next</button>
        </div>
      </div>
    </div>
    <!-- Promo Section -->
    <div class="flex gap-8 items-stretch">
      <div class="flex-1 bg-primary text-white p-10 rounded-3xl relative overflow-hidden flex items-center shadow-xl">
        <div class="relative z-10 w-2/3">
          <h4 class="font-headline font-extrabold text-3xl mb-4">Master your budget.</h4>
          <p class="text-primary-fixed opacity-80 mb-6 leading-relaxed">Our new AI-powered OCR can now scan receipts in 14 languages with 99.8% accuracy. Try uploading your next expense today.</p>
          <button class="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors">Learn More</button>
        </div>
        <div class="absolute right-[-5%] top-[-10%] w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div class="absolute right-10 bottom-0 opacity-20 transform rotate-12"><span class="material-symbols-outlined text-[200px]" style="font-variation-settings:'FILL' 1;">receipt_long</span></div>
      </div>
      <div class="w-80 bg-tertiary text-on-tertiary p-8 rounded-3xl flex flex-col justify-between">
        <div>
          <span class="material-symbols-outlined text-4xl mb-4 text-tertiary-fixed">tips_and_updates</span>
          <h5 class="font-headline font-bold text-xl mb-2 text-tertiary-fixed">Pro Tip</h5>
          <p class="text-sm opacity-80">Bulk upload your receipts at the end of the week to reduce approval cycle times by up to 40%.</p>
        </div>
        <div class="mt-8 flex -space-x-3 overflow-hidden">
          <img alt="Avatar" class="inline-block h-8 w-8 rounded-full ring-2 ring-tertiary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2Sawnmkxu3IZYF7qA4dUjcttihq05Iq3wuOr0WKKusIzkLq_BnOs0jeD9P7ErsaMUA0w0sxqMyPBk7xN2aCkrtpuaTM7YV8zmke0d71HsTWIW2x3fXzc2KWzatFS7j6YctR2uh1UfHT9cue73iu8zew_VxM_--x9yTIMGppOf3uMQyf8MEF60tXiPBf4Le5yNRBlK-HGHSkkeiWgI2ipwyaEPyKWKLTJt2jQj99wqleHjbbmegr8Vss0BJWFIxzwbFCVGUn9hWIU"/>
          <img alt="Avatar" class="inline-block h-8 w-8 rounded-full ring-2 ring-tertiary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHmg52dQ4u6EiAzpzJos4IXBzi7S9RzeRwnJj9OBQ8Om3JjnzO3lXo-uGqWll2vD9uPYNQoYkPqKXpuoWovJdvYzwe5KbXQ0g70IfWYmzj1SU2MkRwDxm0pcrpPRuU0JM0riKfQYGI46hWdHaIBAXaBfvhJFcl6M3JbFmlwJPC3hOAZnFLE5dLEPComOEkuI5pP2Zeiov1DdBjY_U5Zz_au5sh3RPvIo37wnKqAFuRuF35f2iBMuAROMT7_gTx9LO17skSoarR9UA"/>
          <img alt="Avatar" class="inline-block h-8 w-8 rounded-full ring-2 ring-tertiary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7VE1KmiZk4dX4kpQUPq-IFjIf9tFYs5-0DQQoJeMQO9YsoxX6ITcROVt2I2TcWG_pQc1curxrihIc9vGyNqHnEJqC9GehePApdq698kpb0YG8Z81DR0vzEc2Z6mp-beSscO4JIzyb6NwA3G9NtCtuADU99_niphDtCcHbkdPjkugbYv5Pllq_1fQDZpZ62sc7zJrai4ZAu4PfgopqRL0-b0XeThB0n0DEZPbhhwgMzhEfuT7RAape5dFVovVqYX2VkiU44uB5El4"/>
          <div class="flex items-center justify-center h-8 w-8 rounded-full bg-tertiary-container ring-2 ring-tertiary text-[10px] font-bold">+12</div>
        </div>
      </div>
    </div>
  </div>`;
}

function dashboardRows() {
  const rows = [
    {desc:'AWS Monthly Billing - Production',date:'Oct 24, 2023',cat:'Software',paid:'Corporate Card',remark:'Cloud infrastructure',amt:'$840.50',status:'Draft',statusClass:'bg-error-container text-on-error-container'},
    {desc:'Client Dinner - Blue Ginger',date:'Oct 22, 2023',cat:'Entertainment',paid:'Personal',remark:'Project Kickoff',amt:'$320.00',status:'Submitted',statusClass:'bg-[#e8f5e9] text-[#2e7d32]'},
    {desc:'Flight: SFO to JFK',date:'Oct 18, 2023',cat:'Travel',paid:'Corporate Card',remark:'Quarterly Review',amt:'$1,250.00',status:'Processing',statusClass:'bg-primary-fixed text-on-primary-fixed'},
    {desc:'Team Lunch - Urban Greens',date:'Oct 15, 2023',cat:'Meals',paid:'Personal',remark:'Birthday celebration',amt:'$158.20',status:'Draft',statusClass:'bg-error-container text-on-error-container'},
  ];
  return rows.map(r => `
    <tr class="hover:bg-surface-dim/30 transition-colors cursor-pointer" onclick="navigate('expense-detail')">
      <td class="px-8 py-5"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">AC</div><span class="font-semibold text-sm">Alex Chen</span></div></td>
      <td class="px-6 py-5 text-sm font-medium">${r.desc}</td>
      <td class="px-6 py-5 text-sm text-on-surface-variant">${r.date}</td>
      <td class="px-6 py-5"><span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant uppercase">${r.cat}</span></td>
      <td class="px-6 py-5 text-sm">${r.paid}</td>
      <td class="px-6 py-5 text-sm text-outline italic">${r.remark}</td>
      <td class="px-6 py-5 text-sm font-bold text-right">${r.amt}</td>
      <td class="px-8 py-5 text-center"><span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.statusClass}">${r.status}</span></td>
    </tr>`).join('');
}

// Hook into navigation
const origNav = navigate;
const _origNavigate = navigate;
(function(){
  const _nav = navigate;
  window.navigate = function(page) {
    _nav(page);
    if (page === 'dashboard' || page === 'expenses') renderDashboard();
  };
})();
renderDashboard();
