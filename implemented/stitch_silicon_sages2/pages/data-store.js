// ============================================================
// Financial Architect — Central Data Store & Services
// In-memory data with localStorage persistence
// Includes: Auth, Users, Expenses, Wallets, Bundles, Approvals,
//           Currency Service, OCR Service, Approval Engine
// ============================================================

const DB_KEY = 'financial_architect_db';

// ============================================================
// DEFAULT SEED DATA
// ============================================================
function createDefaultDB() {
  return {
    companies: {},
    users: {},
    walletEntries: {},
    bundles: {},
    approvalChains: {},
    approvalRules: {},
    exchangeRateCache: { rates: {}, baseCurrency: 'USD', lastFetched: 0 },
    notifications: {},
    nextId: 1000,
  };
}

// ============================================================
// DATA STORE SINGLETON
// ============================================================
const DataStore = {
  _db: null,

  init() {
    try {
      const saved = localStorage.getItem(DB_KEY);
      if (saved) {
        this._db = JSON.parse(saved);
      } else {
        this._db = createDefaultDB();
        this._seedDemoData();
        this._save();
      }
    } catch (e) {
      console.warn('DataStore init error, resetting:', e);
      this._db = createDefaultDB();
      this._seedDemoData();
      this._save();
    }
  },

  _save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this._db));
    } catch (e) {
      console.warn('DataStore save error:', e);
    }
  },

  _nextId() {
    return ++this._db.nextId;
  },

  reset() {
    this._db = createDefaultDB();
    this._seedDemoData();
    this._save();
  },

  // ============================================================
  // COMPANY MANAGEMENT
  // ============================================================
  createCompany(name, country, currency) {
    const id = this._nextId();
    this._db.companies[id] = {
      id, name, country, currency,
      createdAt: new Date().toISOString(),
      isManagerApproverGlobal: true,
    };
    this._save();
    return this._db.companies[id];
  },

  getCompany(id) {
    return this._db.companies[id] || null;
  },

  getCompanyByUser(userId) {
    const user = this.getUser(userId);
    return user ? this.getCompany(user.companyId) : null;
  },

  updateCompany(id, updates) {
    if (this._db.companies[id]) {
      Object.assign(this._db.companies[id], updates);
      this._save();
    }
    return this._db.companies[id];
  },

  // ============================================================
  // USER MANAGEMENT
  // ============================================================
  createUser({ name, email, password, role, companyId, managerId = null }) {
    const id = this._nextId();
    this._db.users[id] = {
      id, name, email, password, role,
      companyId, managerId,
      isManagerApprover: true,
      avatar: null,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this._save();
    return this._db.users[id];
  },

  getUser(id) {
    return this._db.users[id] || null;
  },

  getUserByEmail(email) {
    return Object.values(this._db.users).find(u => u.email === email) || null;
  },

  getCompanyUsers(companyId) {
    return Object.values(this._db.users).filter(u => u.companyId === companyId && u.active);
  },

  getCompanyManagers(companyId) {
    return this.getCompanyUsers(companyId).filter(u => u.role === 'manager' || u.role === 'admin');
  },

  getCompanyEmployees(companyId) {
    return this.getCompanyUsers(companyId).filter(u => u.role === 'employee');
  },

  getDirectReports(managerId) {
    return Object.values(this._db.users).filter(u => u.managerId === managerId && u.active);
  },

  updateUser(id, updates) {
    if (this._db.users[id]) {
      Object.assign(this._db.users[id], updates);
      this._save();
    }
    return this._db.users[id];
  },

  deleteUser(id) {
    if (this._db.users[id]) {
      this._db.users[id].active = false;
      this._save();
    }
  },

  // ============================================================
  // WALLET ENTRIES
  // ============================================================
  addWalletEntry(userId, entry) {
    const id = this._nextId();
    const user = this.getUser(userId);
    const company = user ? this.getCompany(user.companyId) : null;
    this._db.walletEntries[id] = {
      id, userId,
      ...entry,
      convertedAmount: entry.convertedAmount || entry.amount,
      companyCurrency: company ? company.currency : 'USD',
      exchangeRate: entry.exchangeRate || 1,
      status: 'wallet', // wallet | bundle | submitted
      createdAt: new Date().toISOString(),
    };
    this._save();
    return this._db.walletEntries[id];
  },

  getWalletEntries(userId) {
    return Object.values(this._db.walletEntries)
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getWalletEntry(id) {
    return this._db.walletEntries[id] || null;
  },

  updateWalletEntry(id, updates) {
    if (this._db.walletEntries[id]) {
      Object.assign(this._db.walletEntries[id], updates);
      this._save();
    }
    return this._db.walletEntries[id];
  },

  deleteWalletEntry(id) {
    if (this._db.walletEntries[id] && this._db.walletEntries[id].status === 'wallet') {
      delete this._db.walletEntries[id];
      this._save();
      return true;
    }
    return false;
  },

  // ============================================================
  // BUNDLES
  // ============================================================
  createBundle(userId, { name, note, entryIds }) {
    const id = this._nextId();
    const user = this.getUser(userId);
    const company = user ? this.getCompany(user.companyId) : null;

    // Lock wallet entries
    entryIds.forEach(eid => {
      if (this._db.walletEntries[eid]) {
        this._db.walletEntries[eid].status = 'bundle';
        this._db.walletEntries[eid].bundleId = id;
      }
    });

    const entries = entryIds.map(eid => this._db.walletEntries[eid]).filter(Boolean);
    const grandTotal = entries.reduce((sum, e) => sum + (e.convertedAmount || 0), 0);

    this._db.bundles[id] = {
      id, userId, name, note,
      companyId: user ? user.companyId : null,
      companyCurrency: company ? company.currency : 'USD',
      entryIds,
      grandTotal,
      status: 'draft', // draft | submitted | under-review | approved | rejected
      approvalChainId: null,
      createdAt: new Date().toISOString(),
      submittedAt: null,
    };
    this._save();
    return this._db.bundles[id];
  },

  submitBundle(bundleId) {
    const bundle = this._db.bundles[bundleId];
    if (!bundle) return null;

    bundle.status = 'submitted';
    bundle.submittedAt = new Date().toISOString();

    // Lock entries to submitted
    bundle.entryIds.forEach(eid => {
      if (this._db.walletEntries[eid]) {
        this._db.walletEntries[eid].status = 'submitted';
      }
    });

    // Build approval chain
    const chainId = this._buildApprovalChain(bundle);
    bundle.approvalChainId = chainId;

    this._save();
    return bundle;
  },

  getBundle(id) {
    return this._db.bundles[id] || null;
  },

  getUserBundles(userId) {
    return Object.values(this._db.bundles)
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getCompanyBundles(companyId) {
    return Object.values(this._db.bundles)
      .filter(b => b.companyId === companyId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  rejectBundle(bundleId) {
    const bundle = this._db.bundles[bundleId];
    if (!bundle) return;
    bundle.status = 'rejected';
    // Return entries to wallet
    bundle.entryIds.forEach(eid => {
      if (this._db.walletEntries[eid]) {
        this._db.walletEntries[eid].status = 'wallet';
        delete this._db.walletEntries[eid].bundleId;
      }
    });
    this._save();
  },

  // ============================================================
  // APPROVAL CHAIN ENGINE
  // ============================================================
  _buildApprovalChain(bundle) {
    const user = this.getUser(bundle.userId);
    if (!user) return null;

    const company = this.getCompany(user.companyId);
    const chainId = this._nextId();
    const steps = [];

    // Step 1: Insert manager if IS_MANAGER_APPROVER is on
    if (user.isManagerApprover && user.managerId) {
      const manager = this.getUser(user.managerId);
      if (manager) {
        steps.push({
          stepNumber: steps.length + 1,
          approverId: manager.id,
          approverName: manager.name,
          approverRole: manager.role === 'admin' ? 'Admin' : 'Manager',
          status: 'pending', // pending | approved | rejected | skipped
          comment: '',
          actedAt: null,
        });
      }
    }

    // Step 2+: Add configured approval chain steps
    const configuredChain = this._getApprovalChainConfig(user.companyId);
    configuredChain.forEach(approver => {
      // Don't duplicate manager
      if (!steps.find(s => s.approverId === approver.id)) {
        steps.push({
          stepNumber: steps.length + 1,
          approverId: approver.id,
          approverName: approver.name,
          approverRole: approver.role === 'admin' ? 'Admin' : approver.role === 'manager' ? 'Finance' : 'Approver',
          status: 'pending',
          comment: '',
          actedAt: null,
        });
      }
    });

    // Ensure at least one approver (fallback to any admin)
    if (steps.length === 0) {
      const admins = this.getCompanyUsers(user.companyId).filter(u => u.role === 'admin');
      if (admins.length > 0) {
        steps.push({
          stepNumber: 1,
          approverId: admins[0].id,
          approverName: admins[0].name,
          approverRole: 'Admin',
          status: 'pending',
          comment: '',
          actedAt: null,
        });
      }
    }

    this._db.approvalChains[chainId] = {
      id: chainId,
      bundleId: bundle.id,
      companyId: user.companyId,
      requesterId: user.id,
      steps,
      currentStep: 1,
      status: 'active', // active | approved | rejected
      createdAt: new Date().toISOString(),
    };
    this._save();
    return chainId;
  },

  _getApprovalChainConfig(companyId) {
    // Get configured approvers for a company (admin-defined chain)
    const configuredApprovers = Object.values(this._db.users)
      .filter(u => u.companyId === companyId && u.active && (u.role === 'admin' || u.role === 'manager'))
      .sort((a, b) => {
        const roleOrder = { manager: 1, admin: 2 };
        return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
      });
    return configuredApprovers;
  },

  getApprovalChain(chainId) {
    return this._db.approvalChains[chainId] || null;
  },

  getApproverQueue(approverId) {
    return Object.values(this._db.approvalChains)
      .filter(chain => {
        if (chain.status !== 'active') return false;
        const currentStepData = chain.steps.find(s => s.stepNumber === chain.currentStep);
        return currentStepData && currentStepData.approverId === approverId && currentStepData.status === 'pending';
      })
      .map(chain => {
        const bundle = this.getBundle(chain.bundleId);
        return { chain, bundle };
      })
      .filter(item => item.bundle);
  },

  getAllPendingForUser(userId) {
    // Get all chains where this user is an approver at any point
    return Object.values(this._db.approvalChains)
      .filter(chain => chain.steps.some(s => s.approverId === userId))
      .map(chain => {
        const bundle = this.getBundle(chain.bundleId);
        return { chain, bundle };
      })
      .filter(item => item.bundle);
  },

  approveStep(chainId, approverId, comment) {
    const chain = this._db.approvalChains[chainId];
    if (!chain) return { success: false, error: 'Chain not found' };

    const step = chain.steps.find(s => s.approverId === approverId && s.status === 'pending');
    if (!step) return { success: false, error: 'No pending step for this approver' };

    step.status = 'approved';
    step.comment = comment;
    step.actedAt = new Date().toISOString();

    // Check conditional auto-approval rules
    const autoApproved = this._checkConditionalRules(chain);
    if (autoApproved) {
      chain.status = 'approved';
      const bundle = this._db.bundles[chain.bundleId];
      if (bundle) bundle.status = 'approved';
      // Skip remaining steps
      chain.steps.forEach(s => {
        if (s.status === 'pending') s.status = 'skipped';
      });
      this._addNotification(chain.requesterId, 'approved', `Your bundle has been auto-approved!`, chain.bundleId);
    } else {
      // Move to next step
      const nextStep = chain.steps.find(s => s.status === 'pending');
      if (nextStep) {
        chain.currentStep = nextStep.stepNumber;
        const bundle = this._db.bundles[chain.bundleId];
        if (bundle) bundle.status = 'under-review';
        this._addNotification(nextStep.approverId, 'info', `New approval request pending your review`, chain.bundleId);
      } else {
        // All steps approved
        chain.status = 'approved';
        const bundle = this._db.bundles[chain.bundleId];
        if (bundle) bundle.status = 'approved';
        this._addNotification(chain.requesterId, 'approved', `Your bundle has been fully approved!`, chain.bundleId);
      }
    }

    this._save();
    return { success: true, autoApproved, chain };
  },

  rejectStep(chainId, approverId, comment) {
    const chain = this._db.approvalChains[chainId];
    if (!chain) return { success: false, error: 'Chain not found' };

    const step = chain.steps.find(s => s.approverId === approverId && s.status === 'pending');
    if (!step) return { success: false, error: 'No pending step for this approver' };

    step.status = 'rejected';
    step.comment = comment;
    step.actedAt = new Date().toISOString();

    chain.status = 'rejected';
    this.rejectBundle(chain.bundleId);

    this._addNotification(chain.requesterId, 'rejected', `Your bundle was rejected by ${step.approverName}`, chain.bundleId);

    this._save();
    return { success: true, chain };
  },

  adminOverride(chainId, adminId, action, comment) {
    const chain = this._db.approvalChains[chainId];
    if (!chain) return { success: false, error: 'Chain not found' };

    const admin = this.getUser(adminId);
    if (!admin || admin.role !== 'admin') return { success: false, error: 'Unauthorized' };

    // Add override step
    chain.steps.push({
      stepNumber: chain.steps.length + 1,
      approverId: adminId,
      approverName: admin.name,
      approverRole: 'Admin Override',
      status: action,
      comment: `[ADMIN OVERRIDE] ${comment}`,
      actedAt: new Date().toISOString(),
    });

    if (action === 'approved') {
      chain.status = 'approved';
      chain.steps.forEach(s => {
        if (s.status === 'pending') s.status = 'skipped';
      });
      const bundle = this._db.bundles[chain.bundleId];
      if (bundle) bundle.status = 'approved';
      this._addNotification(chain.requesterId, 'approved', `Admin has force-approved your bundle`, chain.bundleId);
    } else {
      chain.status = 'rejected';
      this.rejectBundle(chain.bundleId);
      this._addNotification(chain.requesterId, 'rejected', `Admin has force-rejected your bundle`, chain.bundleId);
    }

    this._save();
    return { success: true, chain };
  },

  // ============================================================
  // CONDITIONAL AUTO-APPROVAL RULES
  // ============================================================
  setApprovalRule(companyId, rule) {
    const id = rule.id || this._nextId();
    this._db.approvalRules[id] = {
      id, companyId,
      type: rule.type, // 'percentage' | 'specific-approver' | 'hybrid'
      percentageThreshold: rule.percentageThreshold || null,
      specificApproverId: rule.specificApproverId || null,
      active: true,
      createdAt: new Date().toISOString(),
    };
    this._save();
    return this._db.approvalRules[id];
  },

  getApprovalRules(companyId) {
    return Object.values(this._db.approvalRules)
      .filter(r => r.companyId === companyId && r.active);
  },

  deleteApprovalRule(ruleId) {
    if (this._db.approvalRules[ruleId]) {
      this._db.approvalRules[ruleId].active = false;
      this._save();
    }
  },

  _checkConditionalRules(chain) {
    const rules = this.getApprovalRules(chain.companyId);
    if (rules.length === 0) return false;

    const totalSteps = chain.steps.length;
    const approvedSteps = chain.steps.filter(s => s.status === 'approved').length;
    const approvedPercentage = totalSteps > 0 ? (approvedSteps / totalSteps) * 100 : 0;
    const lastApprover = chain.steps.find(s => s.status === 'approved' && s.actedAt);

    for (const rule of rules) {
      switch (rule.type) {
        case 'percentage':
          if (approvedPercentage >= rule.percentageThreshold) return true;
          break;
        case 'specific-approver':
          if (lastApprover && lastApprover.approverId === rule.specificApproverId) return true;
          break;
        case 'hybrid':
          if (approvedPercentage >= (rule.percentageThreshold || 100)) return true;
          if (lastApprover && lastApprover.approverId === rule.specificApproverId) return true;
          break;
      }
    }
    return false;
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  _addNotification(userId, type, message, bundleId = null) {
    const id = this._nextId();
    if (!this._db.notifications[userId]) this._db.notifications[userId] = [];
    this._db.notifications[userId].unshift({
      id, type, message, bundleId,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this._save();
  },

  getNotifications(userId) {
    return this._db.notifications[userId] || [];
  },

  getUnreadCount(userId) {
    return (this._db.notifications[userId] || []).filter(n => !n.read).length;
  },

  markNotificationsRead(userId) {
    if (this._db.notifications[userId]) {
      this._db.notifications[userId].forEach(n => n.read = true);
      this._save();
    }
  },

  // ============================================================
  // STATISTICS
  // ============================================================
  getUserStats(userId) {
    const entries = this.getWalletEntries(userId);
    const bundles = this.getUserBundles(userId);
    const walletTotal = entries.filter(e => e.status === 'wallet').reduce((s, e) => s + (e.convertedAmount || 0), 0);
    const pendingTotal = bundles.filter(b => ['submitted', 'under-review'].includes(b.status)).reduce((s, b) => s + b.grandTotal, 0);
    const approvedTotal = bundles.filter(b => b.status === 'approved').reduce((s, b) => s + b.grandTotal, 0);
    return { walletTotal, pendingTotal, approvedTotal, walletCount: entries.filter(e => e.status === 'wallet').length, bundleCount: bundles.length };
  },

  getCompanyStats(companyId) {
    const allBundles = this.getCompanyBundles(companyId);
    const totalSubmitted = allBundles.filter(b => b.status !== 'draft').length;
    const totalPending = allBundles.filter(b => ['submitted', 'under-review'].includes(b.status)).length;
    const totalApproved = allBundles.filter(b => b.status === 'approved').length;
    const totalRejected = allBundles.filter(b => b.status === 'rejected').length;
    const totalValue = allBundles.reduce((s, b) => s + b.grandTotal, 0);
    const pendingValue = allBundles.filter(b => ['submitted', 'under-review'].includes(b.status)).reduce((s, b) => s + b.grandTotal, 0);
    return { totalSubmitted, totalPending, totalApproved, totalRejected, totalValue, pendingValue };
  },

  // ============================================================
  // SEED DEMO DATA
  // ============================================================
  _seedDemoData() {
    // Create demo company
    const company = this.createCompany('TechCorp International', 'India', 'INR');

    // Create admin
    const admin = this.createUser({
      name: 'Rajesh Kumar',
      email: 'admin@techcorp.com',
      password: 'admin123',
      role: 'admin',
      companyId: company.id,
    });

    // Create manager
    const manager = this.createUser({
      name: 'John Doe',
      email: 'john@techcorp.com',
      password: 'manager123',
      role: 'manager',
      companyId: company.id,
      managerId: admin.id,
    });

    // Create finance manager
    const finance = this.createUser({
      name: 'Sarah Jenkins',
      email: 'sarah@techcorp.com',
      password: 'finance123',
      role: 'manager',
      companyId: company.id,
      managerId: admin.id,
    });

    // Create employees
    const emp1 = this.createUser({
      name: 'Alex Chen',
      email: 'alex@techcorp.com',
      password: 'emp123',
      role: 'employee',
      companyId: company.id,
      managerId: manager.id,
    });

    const emp2 = this.createUser({
      name: 'Priya Sharma',
      email: 'priya@techcorp.com',
      password: 'emp123',
      role: 'employee',
      companyId: company.id,
      managerId: manager.id,
    });

    // Seed wallet entries for emp1
    const walletData = [
      { date: '2025-10-12', category: 'Travel', description: 'Flight to Delhi - Project Summit', amount: 4500, currency: 'INR', convertedAmount: 4500, exchangeRate: 1, tags: ['client', 'Project X'] },
      { date: '2025-10-12', category: 'Food', description: 'Airport lunch & coffee', amount: 850, currency: 'INR', convertedAmount: 850, exchangeRate: 1, tags: ['travel'] },
      { date: '2025-10-13', category: 'Accommodation', description: 'Hotel – 1 night business stay', amount: 120, currency: 'USD', convertedAmount: 9974, exchangeRate: 83.12, tags: ['client', 'Project X'] },
      { date: '2025-10-14', category: 'Travel', description: 'Return cab from airport', amount: 650, currency: 'INR', convertedAmount: 650, exchangeRate: 1, tags: [] },
      { date: '2025-10-10', category: 'Entertainment', description: 'Client dinner - celebratory', amount: 3200, currency: 'INR', convertedAmount: 3200, exchangeRate: 1, tags: ['client'] },
      { date: '2025-10-08', category: 'Office Supplies', description: 'Printer cartridges x2', amount: 45, currency: 'USD', convertedAmount: 3740, exchangeRate: 83.12, tags: ['office'] },
    ];

    const entryIds = [];
    walletData.forEach(entry => {
      const e = this.addWalletEntry(emp1.id, entry);
      entryIds.push(e.id);
    });

    // Create a submitted bundle with approval chain
    const bundle = this.createBundle(emp1.id, {
      name: 'Delhi Trip Oct 2025',
      note: 'Project X client visit expenses',
      entryIds: entryIds.slice(0, 4),
    });
    this.submitBundle(bundle.id);

    // Simulate first approver approved
    const chain = this.getApprovalChain(bundle.approvalChainId);
    if (chain && chain.steps.length > 0) {
      this.approveStep(chain.id, chain.steps[0].approverId, 'Verified - project travel budget covers this.');
      if (chain.steps.length > 1 && chain.steps[1]) {
        this.approveStep(chain.id, chain.steps[1].approverId, 'Amounts match receipts. Approved.');
      }
    }

    // Seed wallet entries for emp2
    const emp2Wallet = [
      { date: '2025-10-20', category: 'Travel', description: 'Uber to client office', amount: 450, currency: 'INR', convertedAmount: 450, exchangeRate: 1, tags: ['client'] },
      { date: '2025-10-21', category: 'Food', description: 'Team lunch', amount: 2800, currency: 'INR', convertedAmount: 2800, exchangeRate: 1, tags: ['team'] },
    ];
    emp2Wallet.forEach(entry => this.addWalletEntry(emp2.id, entry));

    // Set up a default approval rule
    this.setApprovalRule(company.id, {
      type: 'percentage',
      percentageThreshold: 60,
    });
  },
};

// ============================================================
// CURRENCY SERVICE — Live exchange rates
// ============================================================
const CurrencyService = {
  _cache: { rates: {}, base: 'USD', timestamp: 0 },
  _fallbackRates: {
    USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.12, SGD: 1.34,
    JPY: 149.50, AUD: 1.53, CAD: 1.36, CHF: 0.88, CNY: 7.24,
    KRW: 1320, BRL: 4.97, ZAR: 18.2, MXN: 17.1, SEK: 10.5,
    NOK: 10.4, DKK: 6.87, NZD: 1.63, THB: 35.1, AED: 3.67,
    SAR: 3.75, MYR: 4.7, PHP: 56.1, IDR: 15400, PKR: 280,
  },
  _countryMap: null,

  async fetchRates(baseCurrency = 'USD') {
    const now = Date.now();
    // Cache for 1 hour
    if (this._cache.base === baseCurrency && (now - this._cache.timestamp) < 3600000 && Object.keys(this._cache.rates).length > 0) {
      return this._cache.rates;
    }

    try {
      const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (resp.ok) {
        const data = await resp.json();
        this._cache = { rates: data.rates, base: baseCurrency, timestamp: now };
        return data.rates;
      }
    } catch (e) {
      console.warn('Currency API fallback:', e);
    }

    // Fallback: convert from USD base
    if (baseCurrency !== 'USD') {
      const baseRate = this._fallbackRates[baseCurrency] || 1;
      const converted = {};
      for (const [k, v] of Object.entries(this._fallbackRates)) {
        converted[k] = v / baseRate;
      }
      this._cache = { rates: converted, base: baseCurrency, timestamp: now };
      return converted;
    }
    return this._fallbackRates;
  },

  async convert(amount, fromCurrency, toCurrency) {
    const rates = await this.fetchRates(fromCurrency);
    const rate = rates[toCurrency] || 1;
    return { convertedAmount: amount * rate, rate };
  },

  convertSync(amount, fromCurrency, toCurrency) {
    // Synchronous using cached/fallback rates
    let rate = 1;
    if (fromCurrency === toCurrency) return { convertedAmount: amount, rate: 1 };
    
    if (this._cache.base === fromCurrency && this._cache.rates[toCurrency]) {
      rate = this._cache.rates[toCurrency];
    } else {
      // Use fallback
      const fromRate = this._fallbackRates[fromCurrency] || 1;
      const toRate = this._fallbackRates[toCurrency] || 1;
      rate = toRate / fromRate;
    }
    return { convertedAmount: amount * rate, rate };
  },

  async fetchCountryCurrencies() {
    if (this._countryMap) return this._countryMap;

    try {
      const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      if (resp.ok) {
        const data = await resp.json();
        this._countryMap = data.map(country => {
          const currencies = country.currencies ? Object.entries(country.currencies) : [];
          return {
            name: country.name?.common || 'Unknown',
            currencyCode: currencies.length > 0 ? currencies[0][0] : null,
            currencyName: currencies.length > 0 ? currencies[0][1]?.name : null,
            currencySymbol: currencies.length > 0 ? currencies[0][1]?.symbol : null,
          };
        }).filter(c => c.currencyCode).sort((a, b) => a.name.localeCompare(b.name));
        return this._countryMap;
      }
    } catch (e) {
      console.warn('Country API fallback:', e);
    }

    // Fallback
    this._countryMap = [
      { name: 'India', currencyCode: 'INR', currencyName: 'Indian Rupee', currencySymbol: '₹' },
      { name: 'United States', currencyCode: 'USD', currencyName: 'US Dollar', currencySymbol: '$' },
      { name: 'United Kingdom', currencyCode: 'GBP', currencyName: 'Pound Sterling', currencySymbol: '£' },
      { name: 'European Union', currencyCode: 'EUR', currencyName: 'Euro', currencySymbol: '€' },
      { name: 'Japan', currencyCode: 'JPY', currencyName: 'Japanese Yen', currencySymbol: '¥' },
      { name: 'Singapore', currencyCode: 'SGD', currencyName: 'Singapore Dollar', currencySymbol: 'S$' },
      { name: 'Australia', currencyCode: 'AUD', currencyName: 'Australian Dollar', currencySymbol: 'A$' },
      { name: 'Canada', currencyCode: 'CAD', currencyName: 'Canadian Dollar', currencySymbol: 'C$' },
    ];
    return this._countryMap;
  },

  getCurrencySymbol(code) {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', SGD: 'S$', AUD: 'A$', CAD: 'C$', CHF: 'CHF', CNY: '¥' };
    return symbols[code] || code;
  },

  getAvailableCurrencies() {
    return Object.keys(this._fallbackRates);
  },
};

// ============================================================
// OCR SERVICE — Google Gemini Vision API
// ============================================================
const OCRService = {
  GEMINI_API_KEY: 'AIzaSyBWFCeaQ0T612muVhTbfl68ORj8NkcCw1A',

  async scanReceipt(imageBase64) {
    const prompt = `Act as an expert Financial Data Extraction AI. 
Analyze the attached receipt image and follow these strict instructions:

1. OCR EXTRACTION: 
   - Extract the Merchant/Store Name.
   - Extract the Total Amount as a numeric value (remove currency symbols).
   - Extract the Transaction Date in YYYY-MM-DD format.

2. DEPARTMENTAL ROUTING (CRITICAL):
   - Analyze the line items or merchant type.
   - Assign this receipt to exactly one of these Department IDs based on the context:
     [1: IT/Tech, 2: Marketing/Sales, 3: HR/Admin, 4: Operations/Travel].
   - If the receipt contains electronics, software, or cables, use ID 1.
   - If the receipt is for ads, events, or client dinners, use ID 2.
   - If the receipt is for office supplies or recruitment, use ID 3.

3. CONFIDENCE & REASONING:
   - Provide a 1-sentence explanation of why you chose that department.

OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not include markdown formatting or backticks.
{
  "merchant": "string",
  "total": number,
  "date": "string",
  "target_dept_id": number,
  "reasoning": "string",
  "currency": "string"
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // Map department ID to category
        const deptToCategory = { 1: 'Office Supplies', 2: 'Entertainment', 3: 'Office Supplies', 4: 'Travel' };
        result.category = deptToCategory[result.target_dept_id] || 'Other';
        
        return { success: true, data: result };
      }

      return { success: false, error: 'Could not parse OCR response' };
    } catch (e) {
      console.error('OCR Error:', e);
      return { success: false, error: e.message };
    }
  },

  // Mock OCR for when image is not a real receipt
  mockScan() {
    const mockResults = [
      { merchant: 'Blue Ginger Restaurant', total: 2450, date: '2025-10-15', target_dept_id: 2, reasoning: 'Restaurant receipt indicates a client/team dining expense', currency: 'INR', category: 'Food' },
      { merchant: 'Amazon Web Services', total: 840.50, date: '2025-10-24', target_dept_id: 1, reasoning: 'Cloud infrastructure and technology service', currency: 'USD', category: 'Office Supplies' },
      { merchant: 'IndiGo Airlines', total: 4500, date: '2025-10-12', target_dept_id: 4, reasoning: 'Airline tickets indicate travel expense', currency: 'INR', category: 'Travel' },
    ];
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }
};

// ============================================================
// AUTH STATE — Current session
// ============================================================
const AuthState = {
  currentUserId: null,
  currentCompanyId: null,
  
  login(userId) {
    const user = DataStore.getUser(userId);
    if (!user) return false;
    this.currentUserId = userId;
    this.currentCompanyId = user.companyId;
    sessionStorage.setItem('auth_user_id', userId);
    return true;
  },

  loginByEmail(email, password) {
    const user = DataStore.getUserByEmail(email);
    if (!user || user.password !== password) return false;
    return this.login(user.id);
  },

  logout() {
    this.currentUserId = null;
    this.currentCompanyId = null;
    sessionStorage.removeItem('auth_user_id');
  },

  restore() {
    const savedId = sessionStorage.getItem('auth_user_id');
    if (savedId) {
      const id = parseInt(savedId);
      const user = DataStore.getUser(id);
      if (user) {
        this.currentUserId = id;
        this.currentCompanyId = user.companyId;
        return true;
      }
    }
    return false;
  },

  getCurrentUser() {
    return this.currentUserId ? DataStore.getUser(this.currentUserId) : null;
  },

  getCurrentCompany() {
    return this.currentCompanyId ? DataStore.getCompany(this.currentCompanyId) : null;
  },

  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  isAdmin() { return this.getRole() === 'admin'; },
  isManager() { return this.getRole() === 'manager' || this.getRole() === 'admin'; },
  isEmployee() { return this.getRole() === 'employee'; },

  register({ name, email, password, country, currencyCode, companyName }) {
    // Check if email exists
    if (DataStore.getUserByEmail(email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create company
    const company = DataStore.createCompany(
      companyName || `${name}'s Company`,
      country,
      currencyCode
    );

    // Create admin user
    const user = DataStore.createUser({
      name, email, password,
      role: 'admin',
      companyId: company.id,
    });

    // Set up default approval rule
    DataStore.setApprovalRule(company.id, {
      type: 'percentage',
      percentageThreshold: 100,
    });

    this.login(user.id);
    return { success: true, user, company };
  },
};

// Initialize on load
DataStore.init();
