// ============================================================
// Admin Panel — Full user management, approval chain config,
// conditional rules, IS_MANAGER_APPROVER toggle
// ============================================================

function renderAdmin() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company || user.role !== 'admin') {
    document.getElementById('page-admin').innerHTML = `
    <div class="p-12 text-center">
      <span class="material-symbols-outlined text-6xl text-error/30 mb-4">lock</span>
      <h3 class="font-headline font-bold text-xl text-on-surface-variant">Access Denied</h3>
      <p class="text-sm text-outline mt-2">Admin privileges required.</p>
    </div>`;
    return;
  }

  const users = DataStore.getCompanyUsers(company.id);
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const employees = users.filter(u => u.role === 'employee');
  const rules = DataStore.getApprovalRules(company.id);
  const sym = CurrencyService.getCurrencySymbol(company.currency);

  document.getElementById('page-admin').innerHTML = `
  <div class="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Admin Panel</h2>
        <p class="text-outline mt-1 font-medium">${company.name} — ${company.currency} • ${users.length} active users</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-surface-container-low rounded-xl p-1" id="admin-tabs">
      <button onclick="showAdminTab('users')" class="admin-tab active flex-1 py-3 rounded-lg text-sm font-bold transition-all" data-tab="users">
        <span class="material-symbols-outlined text-sm align-middle mr-1">group</span> Users
      </button>
      <button onclick="showAdminTab('rules')" class="admin-tab flex-1 py-3 rounded-lg text-sm font-bold transition-all" data-tab="rules">
        <span class="material-symbols-outlined text-sm align-middle mr-1">rule</span> Approval Rules
      </button>
      <button onclick="showAdminTab('company')" class="admin-tab flex-1 py-3 rounded-lg text-sm font-bold transition-all" data-tab="company">
        <span class="material-symbols-outlined text-sm align-middle mr-1">domain</span> Company
      </button>
    </div>

    <!-- Tab Content -->
    <div id="admin-tab-users" class="admin-tab-content">
      <!-- Create User Form -->
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] border border-outline-variant/5 mb-8">
        <h3 class="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">person_add</span> Create New User
        </h3>
        <form onsubmit="event.preventDefault();createUserFromAdmin();" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Full Name *</label>
            <input id="admin-user-name" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm" type="text" placeholder="Jane Smith" required/>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email *</label>
            <input id="admin-user-email" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm" type="email" placeholder="jane@company.com" required/>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role *</label>
            <select id="admin-user-role" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm appearance-none">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Manager</label>
            <select id="admin-user-manager" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm appearance-none">
              <option value="">None</option>
              ${managers.map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('')}
            </select>
          </div>
          <div class="lg:col-span-4 flex justify-end">
            <button type="submit" class="px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">person_add</span> Create User
            </button>
          </div>
        </form>
      </div>

      <!-- User Table -->
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)]">
        <div class="px-8 py-6 flex items-center justify-between bg-surface-container-low/50">
          <h3 class="font-headline font-bold text-xl text-on-surface">Team Directory</h3>
          <span class="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-full">${users.length} users</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th class="px-8 py-4">User</th>
                <th class="px-4 py-4">Email</th>
                <th class="px-4 py-4">Role</th>
                <th class="px-4 py-4">Manager</th>
                <th class="px-4 py-4 text-center">Mgr Approver</th>
                <th class="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              ${users.map((u, i) => {
                const mgr = u.managerId ? DataStore.getUser(u.managerId) : null;
                const roleBadge = u.role === 'admin' ? 'bg-primary text-white' : u.role === 'manager' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant';
                const isCurrentUser = u.id === user.id;
                return `
                <tr class="hover:bg-surface-dim/30 transition-colors row-enter" style="animation-delay:${0.05 + i * 0.04}s">
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full ${getAvatarColor(u.name)} flex items-center justify-center text-xs font-bold">${getInitials(u.name)}</div>
                      <div>
                        <span class="font-semibold text-sm">${u.name}</span>
                        ${isCurrentUser ? '<span class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2 font-bold">YOU</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-outline">${u.email}</td>
                  <td class="px-4 py-4">
                    ${isCurrentUser ? `<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge}">${u.role}</span>` : `
                    <select onchange="changeUserRole(${u.id}, this.value)" class="bg-transparent text-sm font-bold appearance-none cursor-pointer hover:text-primary transition-colors ${u.role === 'admin' ? 'text-primary' : u.role === 'manager' ? 'text-primary' : 'text-on-surface-variant'}">
                      <option value="employee" ${u.role === 'employee' ? 'selected' : ''}>Employee</option>
                      <option value="manager" ${u.role === 'manager' ? 'selected' : ''}>Manager</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>`}
                  </td>
                  <td class="px-4 py-4">
                    <select onchange="changeUserManager(${u.id}, this.value)" class="bg-transparent text-sm appearance-none cursor-pointer hover:text-primary transition-colors text-on-surface-variant">
                      <option value="">None</option>
                      ${managers.filter(m => m.id !== u.id).map(m => `<option value="${m.id}" ${u.managerId === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" ${u.isManagerApprover ? 'checked' : ''} onchange="toggleManagerApprover(${u.id}, this.checked)" class="sr-only peer">
                      <div class="w-9 h-5 bg-outline-variant/30 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                  <td class="px-8 py-4 text-right">
                    ${!isCurrentUser ? `
                    <button onclick="deleteUserFromAdmin(${u.id})" class="p-1.5 hover:bg-error/10 rounded-md transition-colors tooltip-hover" data-tooltip="Remove">
                      <span class="material-symbols-outlined text-sm text-error">person_remove</span>
                    </button>` : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Approval Rules Tab -->
    <div id="admin-tab-rules" class="admin-tab-content hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 space-y-6">
          <!-- Current Rules -->
          <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)]">
            <h3 class="font-headline text-xl font-bold text-on-surface mb-6">Active Conditional Rules</h3>
            ${rules.length === 0 ? `
            <div class="text-center py-8">
              <span class="material-symbols-outlined text-4xl text-outline/20 mb-2">rule</span>
              <p class="text-sm text-outline">No conditional rules configured. All approval steps are required.</p>
            </div>` : `
            <div class="space-y-4">
              ${rules.map(rule => `
              <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg ${rule.type === 'percentage' ? 'bg-[#FEF3C7] text-[#92400E]' : rule.type === 'specific-approver' ? 'bg-primary-fixed text-primary' : 'bg-[#E0E7FF] text-[#3730A3]'}">
                    <span class="material-symbols-outlined text-sm">${rule.type === 'percentage' ? 'percent' : rule.type === 'specific-approver' ? 'person' : 'merge_type'}</span>
                  </div>
                  <div>
                    <p class="font-bold text-sm capitalize">${rule.type.replace('-', ' ')} Rule</p>
                    <p class="text-xs text-outline">
                      ${rule.type === 'percentage' ? `Auto-approve when ${rule.percentageThreshold}% of approvers approve` :
                        rule.type === 'specific-approver' ? `Auto-approve when specific approver (#${rule.specificApproverId}) approves` :
                        `${rule.percentageThreshold}% threshold OR specific approver #${rule.specificApproverId}`}
                    </p>
                  </div>
                </div>
                <button onclick="deleteRule(${rule.id})" class="p-2 hover:bg-error/10 rounded-lg transition-colors">
                  <span class="material-symbols-outlined text-sm text-error">delete</span>
                </button>
              </div>`).join('')}
            </div>`}
          </div>
        </div>

        <div class="lg:col-span-5">
          <!-- Add New Rule -->
          <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] sticky top-20">
            <h3 class="font-headline text-xl font-bold text-on-surface mb-6">Add Conditional Rule</h3>
            <form onsubmit="event.preventDefault();createRule();" class="space-y-5">
              <div class="space-y-2">
                <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Rule Type</label>
                <select id="rule-type" onchange="updateRuleForm()" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm appearance-none">
                  <option value="percentage">Percentage Rule</option>
                  <option value="specific-approver">Specific Approver Rule</option>
                  <option value="hybrid">Hybrid Rule</option>
                </select>
              </div>
              <div id="rule-percentage-field" class="space-y-2">
                <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Approval Threshold (%)</label>
                <div class="relative">
                  <input id="rule-percentage" type="number" min="1" max="100" value="60" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm"/>
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-outline font-bold">%</span>
                </div>
                <p class="text-[10px] text-outline">Auto-approve when this % of approvers have approved.</p>
              </div>
              <div id="rule-approver-field" class="space-y-2 hidden">
                <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Specific Approver</label>
                <select id="rule-approver" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all px-4 py-3 text-on-surface form-field text-sm appearance-none">
                  ${managers.map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('')}
                </select>
                <p class="text-[10px] text-outline">When this person approves, skip all remaining steps.</p>
              </div>
              <button type="submit" class="w-full py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press">
                Add Rule
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Tab -->
    <div id="admin-tab-company" class="admin-tab-content hidden">
      <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(29,28,21,0.06)] max-w-2xl">
        <h3 class="font-headline text-xl font-bold text-on-surface mb-6">Company Settings</h3>
        <div class="space-y-6">
          <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
            <div>
              <p class="font-bold text-sm">Company Name</p>
              <p class="text-xs text-outline">Legal entity name</p>
            </div>
            <span class="font-headline font-bold text-primary">${company.name}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
            <div>
              <p class="font-bold text-sm">Base Currency</p>
              <p class="text-xs text-outline">All reports and approver views use this currency</p>
            </div>
            <span class="font-headline font-bold text-primary">${company.currency} ${sym}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
            <div>
              <p class="font-bold text-sm">Headquarters</p>
              <p class="text-xs text-outline">Country of registration</p>
            </div>
            <span class="font-headline font-bold text-on-surface">${company.country}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
            <div>
              <p class="font-bold text-sm">Created</p>
              <p class="text-xs text-outline">Registration date</p>
            </div>
            <span class="text-sm text-on-surface">${fmtDate(company.createdAt)}</span>
          </div>
          <div class="p-4 bg-[#FEF3C7] rounded-xl border border-[#F59E0B]/20">
            <div class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[#92400E] text-sm mt-0.5">info</span>
              <p class="text-xs text-[#92400E]">Base currency cannot be changed after company creation to preserve audit integrity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  
  const content = document.getElementById(`admin-tab-${tab}`);
  const btn = document.querySelector(`.admin-tab[data-tab="${tab}"]`);
  if (content) content.classList.remove('hidden');
  if (btn) btn.classList.add('active');
}

function updateRuleForm() {
  const type = document.getElementById('rule-type').value;
  const percentField = document.getElementById('rule-percentage-field');
  const approverField = document.getElementById('rule-approver-field');
  
  if (type === 'percentage') {
    percentField.classList.remove('hidden');
    approverField.classList.add('hidden');
  } else if (type === 'specific-approver') {
    percentField.classList.add('hidden');
    approverField.classList.remove('hidden');
  } else {
    percentField.classList.remove('hidden');
    approverField.classList.remove('hidden');
  }
}

function createUserFromAdmin() {
  const name = document.getElementById('admin-user-name').value;
  const email = document.getElementById('admin-user-email').value;
  const role = document.getElementById('admin-user-role').value;
  const managerId = document.getElementById('admin-user-manager').value;

  if (!name || !email) {
    showToast('Name and email are required', 'warning');
    return;
  }

  if (DataStore.getUserByEmail(email)) {
    showToast('Email already exists', 'error');
    return;
  }

  const company = AuthState.getCurrentCompany();
  DataStore.createUser({
    name, email,
    password: 'welcome123',
    role,
    companyId: company.id,
    managerId: managerId ? parseInt(managerId) : null,
  });

  showToast(`User ${name} created with role ${role}. Default password: welcome123`, 'success', 5000);
  renderAdmin();
}

function changeUserRole(userId, newRole) {
  DataStore.updateUser(userId, { role: newRole });
  showToast('Role updated', 'success');
  renderAdmin();
}

function changeUserManager(userId, managerId) {
  DataStore.updateUser(userId, { managerId: managerId ? parseInt(managerId) : null });
  showToast('Manager assignment updated', 'success');
}

function toggleManagerApprover(userId, checked) {
  DataStore.updateUser(userId, { isManagerApprover: checked });
  showToast(`IS MANAGER APPROVER ${checked ? 'enabled' : 'disabled'}`, 'info');
}

function deleteUserFromAdmin(userId) {
  if (confirm('Remove this user? Their data will be preserved but they won\'t be able to log in.')) {
    DataStore.deleteUser(userId);
    showToast('User removed', 'info');
    renderAdmin();
  }
}

function createRule() {
  const type = document.getElementById('rule-type').value;
  const percentage = parseInt(document.getElementById('rule-percentage').value) || null;
  const approverId = parseInt(document.getElementById('rule-approver')?.value) || null;

  const company = AuthState.getCurrentCompany();
  DataStore.setApprovalRule(company.id, {
    type,
    percentageThreshold: type !== 'specific-approver' ? percentage : null,
    specificApproverId: type !== 'percentage' ? approverId : null,
  });

  showToast('Approval rule created ✓', 'success');
  renderAdmin();
}

function deleteRule(ruleId) {
  DataStore.deleteApprovalRule(ruleId);
  showToast('Rule removed', 'info');
  renderAdmin();
}

// Register page
registerPage('admin', renderAdmin);
