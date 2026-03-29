// Approvals Page
function renderApprovals() {
  document.getElementById('page-approvals').innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><h2 class="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Approvals to review</h2><p class="text-on-surface-variant font-body mt-1">Manage and audit pending expense requests from your direct reports.</p></div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-md font-medium text-sm hover:bg-surface-dim transition-colors"><span class="material-symbols-outlined text-sm">filter_list</span>Filter</button>
        <button class="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-md font-medium text-sm hover:bg-surface-dim transition-colors"><span class="material-symbols-outlined text-sm">download</span>Export Report</button>
      </div>
    </div>
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] border border-outline-variant/10"><p class="text-xs font-bold text-primary-container uppercase tracking-wider mb-2">Pending Count</p><div class="flex items-baseline gap-2"><span class="text-4xl font-headline font-extrabold text-on-surface">12</span><span class="text-sm text-on-surface-variant font-medium">requests</span></div></div>
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] border border-outline-variant/10"><p class="text-xs font-bold text-primary-container uppercase tracking-wider mb-2">Pending Total</p><div class="flex items-baseline gap-2"><span class="text-4xl font-headline font-extrabold text-on-surface">₹412,450</span><span class="text-sm text-error font-medium">↑ 12% vs last mo</span></div></div>
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] border border-outline-variant/10"><p class="text-xs font-bold text-primary-container uppercase tracking-wider mb-2">Avg. Response Time</p><div class="flex items-baseline gap-2"><span class="text-4xl font-headline font-extrabold text-on-surface">4.2</span><span class="text-sm text-on-surface-variant font-medium">hours</span></div></div>
    </div>
    <!-- Table -->
    <section class="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto"><table class="w-full border-collapse text-left">
        <thead><tr class="bg-surface-container-high/50 border-b border-outline-variant/15">
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Approval Subject</th>
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Request Owner</th>
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</th>
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Amount (INR)</th>
          <th class="px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
        </tr></thead>
        <tbody class="divide-y divide-outline-variant/10">
          ${approvalRows()}
        </tbody>
      </table></div>
      <div class="px-6 py-4 bg-surface-container-high/30 border-t border-outline-variant/15 flex items-center justify-between">
        <p class="text-xs text-on-surface-variant font-medium">Showing 4 of 12 pending requests</p>
        <div class="flex gap-2"><button class="p-1.5 hover:bg-surface-dim rounded-md disabled:opacity-30" disabled><span class="material-symbols-outlined text-lg">chevron_left</span></button><button class="p-1.5 hover:bg-surface-dim rounded-md"><span class="material-symbols-outlined text-lg">chevron_right</span></button></div>
      </div>
    </section>
    <!-- Bottom Info -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 bg-primary-fixed/30 p-8 rounded-2xl border border-primary-container/20">
        <div class="flex items-start gap-4">
          <div class="p-3 bg-primary text-white rounded-full"><span class="material-symbols-outlined">auto_awesome</span></div>
          <div><h3 class="font-headline text-xl font-bold text-on-primary-fixed-variant">AI Integrity Check</h3><p class="text-on-primary-fixed-variant/80 mt-2 leading-relaxed">Our Financial Architect AI has analyzed these 12 requests. 10 requests match employee spending patterns and project codes. 2 requests are flagged for additional review due to budget threshold proximity.</p><button class="mt-4 text-primary font-bold text-sm flex items-center gap-2 hover:underline">View Full Audit Trace <span class="material-symbols-outlined text-sm">arrow_forward</span></button></div>
        </div>
      </div>
      <div class="lg:col-span-4 bg-surface-container-highest p-8 rounded-2xl border border-outline-variant/15">
        <h4 class="font-headline font-bold text-on-surface">Team Budget Utilization</h4>
        <div class="mt-6 space-y-4">
          <div><div class="flex justify-between text-xs font-bold uppercase mb-1"><span>Travel &amp; Events</span><span>82%</span></div><div class="h-2 w-full bg-surface-dim rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:82%"></div></div></div>
          <div><div class="flex justify-between text-xs font-bold uppercase mb-1"><span>Software &amp; Subs</span><span>45%</span></div><div class="h-2 w-full bg-surface-dim rounded-full overflow-hidden"><div class="h-full bg-primary-container" style="width:45%"></div></div></div>
          <p class="text-[11px] text-on-surface-variant mt-4 leading-snug">Budget resets in 14 days. Current approval velocity is stable.</p>
        </div>
      </div>
    </div>
  </div>`;
}

function approvalRows() {
  const data = [
    {icon:'flight',iconBg:'bg-primary-fixed text-on-primary-fixed-variant',title:'Q3 Client Summit - Airfare',inv:'#EXP-9921 • Aug 14',owner:'Sarah Jenkins',ownerImg:'https://lh3.googleusercontent.com/aida-public/AB6AXuDhx1Aiom9sbujP5K_aonfAWG7mszlypVIu9kI-wN5s-CyAFWAe4CwzeBzkqPBtDNB7bVXAC1BKJiOG50IxucZ2mSPnWBzel477-IVLeh597P9CGGUInf2sioUyar9wckoaeESQ8OfpxLLfszy6VQJ5Aa2HyjVKtmIScXJg4iduuWGl_NMEiHkxbY0k7n8zXGQPuIontHam6JXLiV45ogfyCf53hjdODdJdmOOh-G8FvQ0Nhv751_dh6uLesNhMquBCoUw2UrVxKNE',cat:'Travel',status:'Processing',amt:'₹86,500',usd:'$1,042',actions:true},
    {icon:'laptop_mac',iconBg:'bg-tertiary-fixed text-on-tertiary-fixed-variant',title:'Cloud Architecture Suite Sub.',inv:'#EXP-8842 • Aug 12',owner:'David Chen',ownerImg:'https://lh3.googleusercontent.com/aida-public/AB6AXuA1xoBXfu4N2tGxr4kd9yuo5AbQNBl97UJrWTQF63Yl_NobkysZFKwzdKHbNuluRpUAfKRErElyZn2QfDkqqEsiTYF-ImvxzFgQF0II9XlKBrGviBnUvzYWgjl24Dm7V1nXYB1iYq18cgaYvcBKUMi7WHUrnX9158J1xItEJi5WKcZl2LhHRvExiOpeHXssu-4Bwb0SyLV4tKJ2wK71zLZKcxDfm6Fj03FkbdU0b8t9eSNo50kqQi_GSoo22Wfs9a5QpoPNPPP-WmY',cat:'Software',status:'Processing',amt:'₹49,896',usd:'$601',actions:true},
    {icon:'restaurant',iconBg:'bg-surface-container-high text-on-surface-variant',title:'Client Lunch - Tech Synergy',inv:'#EXP-8770 • Aug 10',owner:'Michael Ross',ownerImg:'https://lh3.googleusercontent.com/aida-public/AB6AXuAcOfudYoyhSC4EOBd2M8qU1jUcvMxVMooCD-uDdQSQE3eNBa9k960NmdK1gcYYLHVgSAnoYjj56CUza-dqkX_vgXanu0GrpFkmxDNXlM9YjA_taf7Ufs1h2Mgpg7t1QzgOdll28WhW9km-_YTFmDrBzeA-o7-LYmB3wKquwdwjdn8-4WrzyN9QHhCueC-3bJwlBaJaWOUW65MoVDzTVLs3sn-9PX5-dtLQoqo3KfD78L9UnCa4B7nq1cf9eIURORTCKuqznajxveM',cat:'Meals',status:'Approved',amt:'₹12,450',usd:'$150',actions:false},
    {icon:'local_taxi',iconBg:'bg-secondary-container text-on-secondary-container',title:'Airport Transfer - BLR',inv:'#EXP-9945 • Aug 15',owner:'Sarah Jenkins',ownerImg:'https://lh3.googleusercontent.com/aida-public/AB6AXuAaBGO3DUTLrIyD3ZI9nRmk7DivkGvZ-cPNMrj5aXlRbHLtXoOH9JkUwbLEA-ysOhYTeUcmWAN26z7m-HPGo1n8-FFGpgZxtzhJNw-CieeNeEwCbn2Cr1Sc879xBBLCIIuBr4WboMGrL-JOkrAGPjDAvTgKntuSu3iioi8_dFbYEcAwE6b7Jxct7XoP1uYZwFDL1BOUoKtjDvTHqIQ-LKzbnirliZ0pz-2p6hbWUfV9tQ3iaFURPJCHeDCrmGqPDf9MKBi9J68BSKI',cat:'Travel',status:'Processing',amt:'₹2,850',usd:'$34',actions:true},
  ];
  return data.map(r => {
    const isApproved = r.status === 'Approved';
    const rowClass = isApproved ? 'bg-surface-container-low/40 opacity-70' : 'bg-surface-container-lowest hover:bg-surface-dim transition-colors group';
    const statusChip = isApproved
      ? `<span class="px-3 py-1 bg-[#2e7d32]/20 text-[#2e7d32] rounded-full text-[11px] font-bold uppercase tracking-tight flex items-center justify-center gap-1 mx-auto w-max"><span class="material-symbols-outlined text-[12px]">done_all</span>Approved</span>`
      : `<span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[11px] font-bold uppercase tracking-tight">Processing</span>`;
    const actionsHtml = r.actions
      ? `<div class="flex justify-end gap-2"><button class="h-8 px-3 bg-error/10 text-error hover:bg-error hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"><span class="material-symbols-outlined text-sm">close</span>Reject</button><button class="h-8 px-3 bg-[#2e7d32]/10 text-[#2e7d32] hover:bg-[#2e7d32] hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"><span class="material-symbols-outlined text-sm">check</span>Approve</button></div>`
      : `<span class="text-xs italic text-on-surface-variant">Read-only</span>`;
    return `<tr class="${rowClass}">
      <td class="px-6 py-5"><div class="flex items-center gap-3"><div class="h-10 w-10 rounded-lg ${r.iconBg} flex items-center justify-center"><span class="material-symbols-outlined">${r.icon}</span></div><div><p class="font-semibold text-on-surface">${r.title}</p><p class="text-xs text-on-surface-variant">Invoice ${r.inv}</p></div></div></td>
      <td class="px-6 py-5"><div class="flex items-center gap-2"><div class="h-6 w-6 rounded-full overflow-hidden ${isApproved?'grayscale':''}"><img class="h-full w-full object-cover" src="${r.ownerImg}"/></div><span class="text-sm font-medium">${r.owner}</span></div></td>
      <td class="px-6 py-5"><span class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[11px] font-bold uppercase">${r.cat}</span></td>
      <td class="px-6 py-5 text-center">${statusChip}</td>
      <td class="px-6 py-5 text-right"><p class="font-bold text-on-surface">${r.amt}</p><p class="text-[10px] text-on-surface-variant opacity-60">${r.usd} USD equivalent</p></td>
      <td class="px-6 py-5 text-right">${actionsHtml}</td>
    </tr>`;
  }).join('');
}

(function(){
  const _nav = window.navigate;
  window.navigate = function(page) {
    _nav(page);
    if (page === 'approvals') renderApprovals();
  };
})();
