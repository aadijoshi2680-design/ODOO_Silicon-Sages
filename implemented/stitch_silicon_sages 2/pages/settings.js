// Settings / Admin Approval Rules Page
function renderSettings() {
  document.getElementById('page-settings').innerHTML = `
  <main class="p-10 max-w-7xl mx-auto w-full space-y-10">
    <section class="space-y-4">
      <div class="flex items-baseline justify-between">
        <h3 class="font-headline text-2xl font-bold text-on-surface tracking-tight">Active Team Directory</h3>
        <p class="text-sm text-on-surface-variant font-body">Manage individual access and manager assignments</p>
      </div>
      <div class="bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead><tr class="bg-surface-container-low">
            <th class="px-6 py-4 font-headline text-sm font-semibold text-primary">User</th>
            <th class="px-6 py-4 font-headline text-sm font-semibold text-primary">Manager</th>
            <th class="px-6 py-4 font-headline text-sm font-semibold text-primary">Email</th>
            <th class="px-6 py-4 font-headline text-sm font-semibold text-primary text-right">Actions</th>
          </tr></thead>
          <tbody class="divide-y divide-outline-variant/10">
            <tr class="hover:bg-surface-dim/30 transition-colors"><td class="px-6 py-4 text-sm font-medium">Andreas Müller</td><td class="px-6 py-4 text-sm text-on-surface-variant">John Doe</td><td class="px-6 py-4 text-sm text-on-surface-variant">andreas.m@company.com</td><td class="px-6 py-4 text-right"><button class="text-xs font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-white transition-all">Send password</button></td></tr>
            <tr class="hover:bg-surface-dim/30 transition-colors"><td class="px-6 py-4 text-sm font-medium">Mitch Henderson</td><td class="px-6 py-4 text-sm text-on-surface-variant">John Doe</td><td class="px-6 py-4 text-sm text-on-surface-variant">mitch.h@company.com</td><td class="px-6 py-4 text-right"><button class="text-xs font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-white transition-all">Send password</button></td></tr>
            <tr class="hover:bg-surface-dim/30 transition-colors"><td class="px-6 py-4 text-sm font-medium">John Doe</td><td class="px-6 py-4 text-sm text-on-surface-variant">Sarah Jenkins</td><td class="px-6 py-4 text-sm text-on-surface-variant">j.doe@company.com</td><td class="px-6 py-4 text-right"><button class="text-xs font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-white transition-all">Send password</button></td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-surface-container-low p-8 rounded-xl space-y-8">
          <div><h3 class="font-headline text-xl font-bold text-on-surface">Approval rule for miscellaneous expenses</h3><p class="text-sm text-on-surface-variant mt-1">Define triggers and required workflows for non-standard spend.</p></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Triggering User</label><div class="relative"><select class="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all appearance-none text-sm"><option>Select User</option><option>Andreas Müller</option><option>Mitch Henderson</option></select><span class="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">unfold_more</span></div></div>
            <div class="space-y-2"><label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Primary Manager</label><div class="relative"><select class="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary transition-all appearance-none text-sm"><option>Select Manager</option><option>John Doe</option><option>Sarah Jenkins</option></select><span class="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">unfold_more</span></div></div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between"><h4 class="font-headline text-lg font-semibold text-on-surface">Secondary Approvers</h4><span class="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Required for Compliance</span></div>
            <div class="bg-surface-container-lowest rounded-lg ring-1 ring-outline-variant/10 divide-y divide-outline-variant/10">
              <div class="flex items-center justify-between p-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">JD</div><span class="text-sm font-medium">John Doe</span></div><div class="flex items-center gap-2"><label class="text-xs text-on-surface-variant">Required</label><input checked type="checkbox" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"/></div></div>
              <div class="flex items-center justify-between p-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold text-xs">MH</div><span class="text-sm font-medium">Mitch Henderson</span></div><div class="flex items-center gap-2"><label class="text-xs text-on-surface-variant">Required</label><input checked type="checkbox" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"/></div></div>
              <div class="flex items-center justify-between p-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-bold text-xs">AM</div><span class="text-sm font-medium">Andreas Müller</span></div><div class="flex items-center gap-2"><label class="text-xs text-on-surface-variant">Required</label><input type="checkbox" class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"/></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="bg-white p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] h-fit space-y-8">
          <h4 class="font-headline text-lg font-bold text-on-surface">Logic Constraints</h4>
          <div class="space-y-6">
            <div class="flex items-start gap-3"><div class="pt-1"><input type="checkbox" class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"/></div><div><label class="text-sm font-bold block">Approvers Sequence</label><p class="text-xs text-on-surface-variant mt-1 leading-relaxed">Approvals must be granted in the order defined above. If unchecked, any approver can sign off simultaneously.</p></div></div>
            <div class="space-y-3 pt-4 border-t border-outline-variant/10"><label class="text-sm font-bold block">Minimum Approval percentage</label><div class="relative flex items-center"><input type="number" value="100" class="w-full bg-surface-container-low border-0 ring-1 ring-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm font-semibold"/><span class="absolute right-4 text-on-surface-variant font-bold">%</span></div><p class="text-[10px] text-on-surface-variant italic leading-normal">* Threshold of selected approvers required to finalize the expense. 100% means all 'Required' users must approve.</p></div>
          </div>
          <button class="w-full py-4 bg-primary text-white font-headline font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-on-primary-fixed-variant transition-all mt-4">Save Rule Configuration</button>
        </div>
        <div class="bg-primary-fixed/30 p-6 rounded-xl border border-primary-fixed/50">
          <div class="flex gap-3"><span class="material-symbols-outlined text-primary">info</span><div class="space-y-1"><h5 class="text-sm font-bold text-on-primary-fixed-variant">Administrative Note</h5><p class="text-xs text-on-primary-fixed-variant leading-relaxed opacity-80">These rules apply globally to all miscellaneous categories. For department-specific rules, please use the Advanced Logic tab.</p></div></div>
        </div>
      </div>
    </section>
  </main>`;
}

(function(){
  const _nav = window.navigate;
  window.navigate = function(page) {
    _nav(page);
    if (page === 'settings') renderSettings();
  };
})();
