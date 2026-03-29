// ============================================================
// AuthState — API-backed Authentication & User Management
// Session stored in sessionStorage; all data in PostgreSQL
// ============================================================

const AuthState = (() => {
  const SESSION_KEY = 'expensepro_session';

  // ---- Session (only this stays in browser) ----
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || { userId: null, companyId: null }; }
    catch { return { userId: null, companyId: null }; }
  }
  function setSession(userId, companyId, user, company) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, companyId, user, company }));
  }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  function getCurrentUser() { return getSession().user || null; }
  function getCurrentCompany() { return getSession().company || null; }
  function isLoggedIn() { const s = getSession(); return !!(s.userId && s.companyId); }

  function hasRole(role) {
    const user = getCurrentUser();
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'executive') return ['admin','cfo','ceo','coo','director'].includes(user.role);
    if (role === 'manager') return ['manager','admin','cfo','ceo','coo','director'].includes(user.role);
    return true;
  }

  function canManageUsers() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  }

  // ---- API Calls ----
  async function signup({ name, email, password, country, currency, companyName }) {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, country, currency, companyName }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed' };
      setSession(data.user.id, data.company.id, data.user, data.company);
      return data;
    } catch (err) {
      return { error: err.message };
    }
  }

  async function login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed' };
      setSession(data.user.id, data.company.id, data.user, data.company);
      return data;
    } catch (err) {
      return { error: err.message };
    }
  }

  function logout() { clearSession(); }

  // ---- User Management (API) ----
  async function getUsers() {
    const company = getCurrentCompany();
    if (!company) return [];
    try {
      const res = await fetch(`/api/users?company_id=${company.id}`);
      return await res.json();
    } catch { return []; }
  }

  async function getUsersByCompany(companyId) {
    try {
      const res = await fetch(`/api/users?company_id=${companyId}`);
      return await res.json();
    } catch { return []; }
  }

  async function createUser({ name, email, password, role, companyId, managerId, departmentId, isManagerApprover, sendEmail }) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, password,
          role: role || 'employee',
          company_id: companyId,
          manager_id: managerId || null,
          department_id: departmentId || null,
          is_manager_approver: isManagerApprover || false,
          send_email: sendEmail || false,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error };
      return data;
    } catch (err) {
      return { error: err.message };
    }
  }

  async function updateUser(userId, updates) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error };
      return data;
    } catch (err) {
      return { error: err.message };
    }
  }

  async function deleteUser(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      return res.ok;
    } catch { return false; }
  }

  function getUserById(id) {
    // Sync lookup from cached users (set from pages that list users)
    return AuthState._cachedUsers?.find(u => u.id === id) || null;
  }

  async function getManagers(companyId) {
    const users = await getUsersByCompany(companyId);
    return users.filter(u => ['manager','admin','cfo','ceo','coo','director'].includes(u.role));
  }

  // ---- Departments ----
  async function getDepartments() {
    const company = getCurrentCompany();
    if (!company) return [];
    try {
      const res = await fetch(`/api/departments?company_id=${company.id}`);
      return await res.json();
    } catch { return []; }
  }

  async function createDepartment(name) {
    const company = getCurrentCompany();
    if (!company) return null;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company_id: company.id }),
      });
      return await res.json();
    } catch { return null; }
  }

  // Cache for sync lookups
  let _cachedUsers = [];

  return {
    getSession, setSession, clearSession,
    getCurrentUser, getCurrentCompany, isLoggedIn, hasRole, canManageUsers,
    signup, login, logout,
    getUsers, getUsersByCompany, createUser, updateUser, deleteUser, getUserById, getManagers,
    getDepartments, createDepartment,
    _cachedUsers,
    set cachedUsers(v) { _cachedUsers = v; AuthState._cachedUsers = v; },
  };
})();
