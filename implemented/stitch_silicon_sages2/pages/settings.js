// ============================================================
// User Management Page (was Settings) — Admin only
// Create users with departments, extended roles, send email
// ============================================================

const ALL_ROLES = ['employee', 'manager', 'cfo', 'ceo', 'coo', 'director'];

async function renderSettings() {
  const user = AuthState.getCurrentUser();
  const company = AuthState.getCurrentCompany();
  if (!user || !company || user.role !== 'admin') return;
  const container = document.getElementById('page-settings');

  container.innerHTML = `<div class="p-8 lg:p-12"><div class="text-center py-12"><div class="dot-pulse mx-auto"><span></span><span></span><span></span></div><p class="text-sm text-outline mt-4">Loading team data...</p></div></div>`;

  // Fetch users and departments
  const users = await AuthState.getUsers();
  const departments = await AuthState.getDepartments();
  AuthState.cachedUsers = users;

  const managers = users.filter(u => ['manager','admin','cfo','ceo','coo','director'].includes(u.role));

  container.innerHTML = `
  <div class="p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full stagger-in">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface">User Management</h2>
        <p class="text-outline mt-1 font-medium">Create team members, assign roles and departments.</p>
      </div>
    </div>

    <!-- Create User Form -->
    <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5">
      <h3 class="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">person_add</span> Create Employee / Manager
      </h3>
      <form id="create-user-form" onsubmit="event.preventDefault();handleCreateUser();" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Name -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
            <input id="new-user-name" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" placeholder="Jane Smith" required/>
          </div>
          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
            <input id="new-user-email" type="email" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" placeholder="jane@company.com" required/>
          </div>
          <!-- Role -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</label>
            <div class="relative">
              <select id="new-user-role" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface text-sm appearance-none form-field">
                ${ALL_ROLES.map(r => `<option value="${r}">${r.toUpperCase()}</option>`).join('')}
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
          </div>
          <!-- Department -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Department</label>
            <div class="relative">
              <select id="new-user-dept" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface text-sm appearance-none form-field" onchange="handleDeptChange(this)">
                <option value="">— Select Department —</option>
                ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                <option value="__other__">✏️ Other (Create New)</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
            <div id="custom-dept-wrap" class="hidden mt-2">
              <input id="custom-dept-name" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-2.5 text-on-surface text-sm form-field" placeholder="Enter new department name"/>
            </div>
          </div>
          <!-- Manager -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Manager</label>
            <div class="relative">
              <select id="new-user-manager" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface text-sm appearance-none form-field">
                <option value="">None</option>
                ${managers.map(m => `<option value="${m.id}">${m.name} (${m.role.toUpperCase()})</option>`).join('')}
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
          </div>
          <!-- Password -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
            <input id="new-user-pass" type="password" class="w-full bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-4 py-3 text-on-surface form-field" value="welcome123" required/>
          </div>
        </div>

        <div class="flex items-center gap-6 pt-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input id="new-user-approver" type="checkbox" class="rounded text-primary focus:ring-primary"/>
            <span class="text-sm font-semibold text-on-surface">IS MANAGER APPROVER</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input id="new-user-send-email" type="checkbox" checked class="rounded text-primary focus:ring-primary"/>
            <span class="text-sm font-semibold text-on-surface flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-primary">mail</span>
              Send credentials via Email
            </span>
          </label>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">group_add</span> Create User
          </button>
        </div>
      </form>
    </div>

    <!-- Team Directory -->
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
      <div class="px-8 py-5 flex items-center justify-between bg-surface-container-low/50">
        <h3 class="font-headline font-bold text-lg text-on-surface">Active Team Directory</h3>
        <span class="text-xs font-bold text-outline">${users.length} members • ${company.name}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low/30 text-outline text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th class="px-8 py-3">User</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Department</th>
              <th class="px-4 py-3">Manager</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3 text-center">Is Manager Approver</th>
              <th class="px-8 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10" id="team-tbody">
            ${users.map((u, i) => teamRow(u, i, managers, departments)).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Approval Rules Configuration -->
    <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5">
      <h3 class="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">rule</span> Approval Workflow Rules
      </h3>
      <p class="text-sm text-outline mb-6">Configure the multi-step approval pipeline and conditional auto-approval rules.</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- LEFT: Approval Sequence -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Approval Sequence</h4>
            <span class="text-[10px] text-outline">Expenses flow through each step in order</span>
          </div>
          <p class="text-xs text-outline">Step 1 is "IS MANAGER APPROVER" (auto-added via employee's manager).<br/>Add additional approvers below. The sequence defines the order.</p>

          <div id="approval-seq-list" class="space-y-2 min-h-[48px]"></div>

          <div class="flex gap-2">
            <select id="seq-add-user" class="flex-1 bg-surface-container-low border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white px-3 py-2.5 text-sm appearance-none form-field">
              <option value="">— Select Approver —</option>
              ${managers.filter(m => m.role !== 'employee').map(m => `<option value="${m.id}">${m.name} (${m.role.toUpperCase()})</option>`).join('')}
            </select>
            <button onclick="addToSequence()" class="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:opacity-90 transition-all btn-press flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">add</span> Add Step
            </button>
          </div>
        </div>

        <!-- RIGHT: Conditional Rules -->
        <div class="space-y-5">
          <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Conditional Approval Rules</h4>
          <p class="text-xs text-outline">If <strong>any</strong> condition below is met, the expense is auto-approved and remaining steps are skipped.</p>

          <!-- Percentage Threshold -->
          <div class="bg-surface-container-low p-5 rounded-xl space-y-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="rule-pct-enabled" class="rounded text-primary focus:ring-primary" onchange="togglePctRule()"/>
              <span class="text-sm font-bold text-on-surface">Percentage Rule</span>
              <span class="text-[10px] text-outline italic ml-auto">e.g., "If 60% of approvers approve"</span>
            </label>
            <div id="rule-pct-wrap" class="hidden flex items-center gap-3">
              <input type="range" id="rule-pct-value" min="10" max="100" step="10" value="60" oninput="document.getElementById('rule-pct-display').textContent=this.value+'%'" class="flex-1 accent-primary"/>
              <span id="rule-pct-display" class="text-lg font-headline font-extrabold text-primary w-14 text-right">60%</span>
            </div>
          </div>

          <!-- Specific Approver -->
          <div class="bg-surface-container-low p-5 rounded-xl space-y-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="rule-specific-enabled" class="rounded text-primary focus:ring-primary" onchange="toggleSpecificRule()"/>
              <span class="text-sm font-bold text-on-surface">Specific Approver Rule</span>
              <span class="text-[10px] text-outline italic ml-auto">e.g., "If CFO approves"</span>
            </label>
            <div id="rule-specific-wrap" class="hidden">
              <select id="rule-specific-user" class="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary px-3 py-2.5 text-sm appearance-none">
                <option value="">— Select Approver —</option>
                ${managers.filter(m => m.role !== 'employee').map(m => `<option value="${m.id}">${m.name} (${m.role.toUpperCase()})</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Hybrid note -->
          <div class="bg-primary-fixed/20 p-4 rounded-lg flex items-start gap-3">
            <span class="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
            <div>
              <p class="text-xs font-bold text-on-surface mb-1">Hybrid Mode</p>
              <p class="text-[11px] text-on-surface-variant">Enable both rules for a hybrid flow: expense is auto-approved if <strong>either</strong> condition is met (e.g., 60% approval OR CFO approves).</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-8 pt-6 border-t border-outline-variant/10">
        <button onclick="saveApprovalRules()" class="px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all btn-press flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">save</span> Save Approval Rules
        </button>
      </div>
    </div>
  </div>`;

  // Load existing approval rules
  loadApprovalRules(company.id, managers);
}

// ============================================================
// Approval Rule Helpers
// ============================================================

// In-memory sequence state
let _approvalSequence = [];

async function loadApprovalRules(companyId, managers) {
  const rule = await DataStore.getApprovalRule(companyId);
  if (!rule) {
    renderSequenceList([]);
    return;
  }

  // Load sequence
  const seq = (typeof rule.sequence === 'string' ? JSON.parse(rule.sequence) : rule.sequence) || [];
  _approvalSequence = seq.map(s => {
    const mgr = managers.find(m => m.id === s.approverId);
    return { approverId: s.approverId, approverName: mgr ? mgr.name : s.approverName || 'Unknown', role: s.role || (mgr ? mgr.role : 'unknown') };
  });
  renderSequenceList(_approvalSequence);

  // Load percentage rule
  if (rule.percentage_threshold && rule.percentage_threshold < 100) {
    document.getElementById('rule-pct-enabled').checked = true;
    document.getElementById('rule-pct-wrap').classList.remove('hidden');
    document.getElementById('rule-pct-value').value = rule.percentage_threshold;
    document.getElementById('rule-pct-display').textContent = rule.percentage_threshold + '%';
  }

  // Load specific approver rule
  if (rule.specific_approver_id) {
    document.getElementById('rule-specific-enabled').checked = true;
    document.getElementById('rule-specific-wrap').classList.remove('hidden');
    document.getElementById('rule-specific-user').value = rule.specific_approver_id;
  }
}

function renderSequenceList(seq) {
  const container = document.getElementById('approval-seq-list');
  if (!container) return;
  if (seq.length === 0) {
    container.innerHTML = `<div class="py-4 text-center text-sm text-outline italic">No additional approvers defined. Only the employee's manager (if IS MANAGER APPROVER is checked) will be in the chain.</div>`;
    return;
  }

  container.innerHTML = seq.map((s, i) => `
    <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg group">
      <span class="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">${i + 1}</span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-on-surface">${s.approverName}</p>
        <p class="text-[10px] text-outline uppercase">${s.role}</p>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        ${i > 0 ? `<button onclick="moveSequenceStep(${i}, -1)" class="p-1 hover:bg-surface-dim rounded" title="Move up"><span class="material-symbols-outlined text-sm">arrow_upward</span></button>` : ''}
        ${i < seq.length - 1 ? `<button onclick="moveSequenceStep(${i}, 1)" class="p-1 hover:bg-surface-dim rounded" title="Move down"><span class="material-symbols-outlined text-sm">arrow_downward</span></button>` : ''}
        <button onclick="removeFromSequence(${i})" class="p-1 hover:bg-error/10 rounded" title="Remove"><span class="material-symbols-outlined text-sm text-error">close</span></button>
      </div>
    </div>
  `).join('');
}

function addToSequence() {
  const select = document.getElementById('seq-add-user');
  const userId = parseInt(select.value);
  if (!userId) { showToast('Select an approver', 'warning'); return; }

  if (_approvalSequence.find(s => s.approverId === userId)) {
    showToast('This approver is already in the sequence', 'warning');
    return;
  }

  const option = select.options[select.selectedIndex];
  const name = option.textContent.split(' (')[0];
  const role = option.textContent.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || 'approver';

  _approvalSequence.push({ approverId: userId, approverName: name, role });
  renderSequenceList(_approvalSequence);
  select.value = '';
  showToast(`${name} added as Step ${_approvalSequence.length}`, 'success');
}

function removeFromSequence(index) {
  const removed = _approvalSequence.splice(index, 1);
  renderSequenceList(_approvalSequence);
  showToast(`${removed[0]?.approverName || 'Approver'} removed`, 'info');
}

function moveSequenceStep(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= _approvalSequence.length) return;
  const temp = _approvalSequence[index];
  _approvalSequence[index] = _approvalSequence[newIndex];
  _approvalSequence[newIndex] = temp;
  renderSequenceList(_approvalSequence);
}

function togglePctRule() {
  const wrap = document.getElementById('rule-pct-wrap');
  wrap.classList.toggle('hidden', !document.getElementById('rule-pct-enabled').checked);
}

function toggleSpecificRule() {
  const wrap = document.getElementById('rule-specific-wrap');
  wrap.classList.toggle('hidden', !document.getElementById('rule-specific-enabled').checked);
}

async function saveApprovalRules() {
  const company = AuthState.getCurrentCompany();
  if (!company) return;

  const pctEnabled = document.getElementById('rule-pct-enabled').checked;
  const pctValue = pctEnabled ? parseInt(document.getElementById('rule-pct-value').value) : 100;

  const specificEnabled = document.getElementById('rule-specific-enabled').checked;
  const specificId = specificEnabled ? parseInt(document.getElementById('rule-specific-user').value) || null : null;

  if (specificEnabled && !specificId) {
    showToast('Select a specific approver for the auto-approve rule', 'warning');
    return;
  }

  const result = await DataStore.saveApprovalRule(company.id, {
    sequence: _approvalSequence,
    percentageThreshold: pctValue,
    specificApproverId: specificId,
  });

  if (result) {
    showToast('Approval rules saved ✓', 'success');
    fireConfetti({ count: 25, spread: 40 });
  } else {
    showToast('Failed to save rules', 'error');
  }
}

function teamRow(u, i, managers, departments) {
  const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isAdmin = u.role === 'admin';
  const roleBadgeColors = {
    admin: 'bg-primary text-white',
    manager: 'bg-[#FEF3C7] text-[#92400E]',
    employee: 'bg-surface-container-high text-on-surface-variant',
    cfo: 'bg-[#E0E7FF] text-[#3730A3]', ceo: 'bg-[#E0E7FF] text-[#3730A3]',
    coo: 'bg-[#E0E7FF] text-[#3730A3]', director: 'bg-[#FCE7F3] text-[#9D174D]',
  };
  const rc = roleBadgeColors[u.role] || roleBadgeColors.employee;

  return `
    <tr class="hover:bg-surface-dim/30 transition-colors row-enter" style="animation-delay:${i*0.04}s">
      <td class="px-8 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary text-[11px] font-bold border border-primary-fixed">${initials}</div>
          <span class="text-sm font-medium text-on-surface">${u.name}</span>
        </div>
      </td>
      <td class="px-4 py-4">
        ${isAdmin ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${rc}">${u.role}</span>` :
          `<select onchange="handleRoleChange(${u.id}, this.value)" class="text-[11px] font-bold uppercase bg-transparent border border-outline-variant/20 rounded-lg px-2 py-1 appearance-none cursor-pointer ${rc}">
            ${ALL_ROLES.map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r.toUpperCase()}</option>`).join('')}
          </select>`
        }
      </td>
      <td class="px-4 py-4">
        <select onchange="handleDeptAssign(${u.id}, this.value)" class="text-xs bg-transparent border border-outline-variant/20 rounded-lg px-2 py-1.5 appearance-none cursor-pointer text-on-surface">
          <option value="">Unassigned</option>
          ${departments.map(d => `<option value="${d.id}" ${u.department_id == d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
        </select>
      </td>
      <td class="px-4 py-4">
        ${isAdmin ? '<span class="text-xs text-outline italic">—</span>' :
          `<select onchange="handleManagerChange(${u.id}, this.value)" class="text-xs bg-transparent border border-outline-variant/20 rounded-lg px-2 py-1.5 appearance-none cursor-pointer text-on-surface">
            <option value="">None</option>
            ${managers.filter(m => m.id !== u.id).map(m => `<option value="${m.id}" ${u.manager_id == m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>`
        }
      </td>
      <td class="px-4 py-4 text-sm text-on-surface-variant">${u.email}</td>
      <td class="px-4 py-4 text-center">
        ${isAdmin ? '<span class="text-xs text-outline">—</span>' :
          `<label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" ${u.is_manager_approver ? 'checked' : ''} onchange="handleApproverToggle(${u.id}, this.checked)" class="sr-only peer"/>
            <div class="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>`
        }
      </td>
      <td class="px-8 py-4 text-right">
        ${isAdmin ? '<span class="text-[10px] text-outline italic">Primary Admin</span>' :
          `<button onclick="handleDeleteUser(${u.id}, '${u.name.replace(/'/g, "\\'")}')" class="p-1.5 hover:bg-error/10 rounded-md transition-colors" title="Delete user">
            <span class="material-symbols-outlined text-sm text-error">delete</span>
          </button>`
        }
      </td>
    </tr>`;
}

function handleDeptChange(select) {
  const wrap = document.getElementById('custom-dept-wrap');
  if (select.value === '__other__') {
    wrap.classList.remove('hidden');
    document.getElementById('custom-dept-name').focus();
  } else {
    wrap.classList.add('hidden');
  }
}

async function handleCreateUser() {
  const name = document.getElementById('new-user-name').value.trim();
  const email = document.getElementById('new-user-email').value.trim();
  const role = document.getElementById('new-user-role').value;
  const pass = document.getElementById('new-user-pass').value;
  const managerId = document.getElementById('new-user-manager').value;
  const isApprover = document.getElementById('new-user-approver').checked;
  const sendEmail = document.getElementById('new-user-send-email').checked;

  let deptId = document.getElementById('new-user-dept').value;
  if (deptId === '__other__') {
    const deptName = document.getElementById('custom-dept-name').value.trim();
    if (!deptName) { showToast('Please enter a department name', 'error'); return; }
    const newDept = await AuthState.createDepartment(deptName);
    if (newDept) deptId = newDept.id;
    else { showToast('Failed to create department', 'error'); return; }
  }

  if (!name) { shakeField(document.getElementById('new-user-name')); return; }
  if (!email) { shakeField(document.getElementById('new-user-email')); return; }

  const company = AuthState.getCurrentCompany();
  const result = await AuthState.createUser({
    name, email, password: pass, role,
    companyId: company.id,
    managerId: managerId ? parseInt(managerId) : null,
    departmentId: deptId ? parseInt(deptId) : null,
    isManagerApprover: isApprover,
    sendEmail,
  });

  if (result.error) {
    showToast(result.error, 'error');
    return;
  }

  const emailMsg = result.emailResult?.simulated
    ? ` (Email simulated — configure GMAIL_USER env vars for real email)`
    : result.emailResult?.messageId
    ? ` — Credentials emailed to ${email}`
    : '';

  showToast(`${name} created as ${role.toUpperCase()}${emailMsg}`, 'success', 5000);
  fireConfetti({ count: 30, spread: 50 });

  // Reset form
  document.getElementById('create-user-form').reset();
  document.getElementById('custom-dept-wrap').classList.add('hidden');

  renderSettings();
}

async function handleRoleChange(userId, newRole) {
  await AuthState.updateUser(userId, { role: newRole });
  showToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
  renderSettings();
}

async function handleDeptAssign(userId, deptId) {
  await AuthState.updateUser(userId, { department_id: deptId ? parseInt(deptId) : null });
  showToast('Department updated', 'success');
}

async function handleManagerChange(userId, managerId) {
  await AuthState.updateUser(userId, { manager_id: managerId ? parseInt(managerId) : null });
  showToast('Manager updated', 'success');
}

async function handleApproverToggle(userId, checked) {
  await AuthState.updateUser(userId, { is_manager_approver: checked });
  showToast(checked ? 'Manager approver enabled' : 'Manager approver disabled', 'info');
}

async function handleDeleteUser(userId, name) {
  if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;
  const success = await AuthState.deleteUser(userId);
  if (success) {
    showToast(`${name} removed`, 'warning');
    renderSettings();
  } else {
    showToast('Failed to delete user', 'error');
  }
}

registerPage('settings', renderSettings);
