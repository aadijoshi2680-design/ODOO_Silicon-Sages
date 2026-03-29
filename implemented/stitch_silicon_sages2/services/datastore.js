// ============================================================
// DataStore — API-backed CRUD for wallet, expenses, bundles, rules
// All data in PostgreSQL via Express API
// ============================================================

const DataStore = (() => {
  // ============================================================
  // WALLET ENTRIES
  // ============================================================
  async function getWalletEntries(userId) {
    try {
      const res = await fetch(`/api/wallet?user_id=${userId}`);
      return await res.json();
    } catch { return []; }
  }

  async function addWalletEntry(userId, entry) {
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: entry.amount,
          currency: entry.currency,
          converted_amount: entry.convertedAmount,
          exchange_rate: entry.exchangeRate,
          category: entry.category,
          description: entry.description,
          date: entry.date,
          tags: entry.tags || [],
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Add wallet entry error:', err);
      return null;
    }
  }

  async function deleteWalletEntry(entryId) {
    try {
      const res = await fetch(`/api/wallet/${entryId}`, { method: 'DELETE' });
      return res.ok;
    } catch { return false; }
  }

  async function markWalletEntriesAsSubmitted(ids) {
    try {
      await fetch('/api/wallet/submit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: 'submitted' }),
      });
    } catch (err) {
      console.error('Mark submitted error:', err);
    }
  }

  async function markWalletEntriesAsBundled(ids, bundleId) {
    try {
      await fetch('/api/wallet/submit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: 'bundle', bundle_id: bundleId }),
      });
    } catch (err) {
      console.error('Mark bundled error:', err);
    }
  }

  // ============================================================
  // EXPENSES
  // ============================================================
  async function getExpensesByUser(userId) {
    try {
      const res = await fetch(`/api/expenses?user_id=${userId}`);
      return await res.json();
    } catch { return []; }
  }

  async function getExpensesByCompany(companyId) {
    try {
      const res = await fetch(`/api/expenses?company_id=${companyId}`);
      return await res.json();
    } catch { return []; }
  }

  async function getExpensesPendingApproval(approverId) {
    // Get all pending company expenses and filter by chain
    // Show all expenses where this user is an approver (sequential awareness handled in UI)
    const company = AuthState.getCurrentCompany();
    if (!company) return [];
    try {
      const res = await fetch(`/api/expenses?company_id=${company.id}&status=pending`);
      const expenses = await res.json();
      return expenses.filter(e => {
        const chain = e.approval_chain || [];
        return chain.some(s => s.approverId === approverId && s.status === 'pending');
      });
    } catch { return []; }
  }

  async function getExpensesForManager(managerId) {
    const company = AuthState.getCurrentCompany();
    if (!company) return [];
    try {
      const res = await fetch(`/api/expenses?company_id=${company.id}`);
      const expenses = await res.json();
      return expenses.filter(e => {
        const chain = e.approval_chain || [];
        return chain.some(s => s.approverId === managerId);
      });
    } catch { return []; }
  }

  async function submitExpense(userId, companyId, expData) {
    try {
      const res = await fetch('/api/expenses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          company_id: companyId,
          amount: expData.amount,
          currency: expData.currency,
          converted_amount: expData.convertedAmount,
          exchange_rate: expData.exchangeRate,
          category: expData.category,
          description: expData.description,
          date: expData.date,
          approval_chain: expData.approvalChain || [],
          wallet_entry_ids: expData.walletEntryIds || [],
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Submit expense error:', err);
      return null;
    }
  }

  async function approveExpenseStep(expenseId, approverId, comment) {
    try {
      const res = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver_id: approverId, comment }),
      });
      return await res.json();
    } catch (err) {
      console.error('Approve error:', err);
      return null;
    }
  }

  async function rejectExpenseStep(expenseId, approverId, comment) {
    try {
      const res = await fetch(`/api/expenses/${expenseId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver_id: approverId, comment }),
      });
      return await res.json();
    } catch (err) {
      console.error('Reject error:', err);
      return null;
    }
  }

  async function getExpenseStats(companyId) {
    try {
      const res = await fetch(`/api/expenses/stats?company_id=${companyId}`);
      return await res.json();
    } catch { return { totalExpenditure: 0, pendingCount: 0, departmentWise: [], monthWise: [], recentExpenses: [] }; }
  }

  // ============================================================
  // APPROVAL CHAIN BUILDER (API)
  // ============================================================
  async function buildApprovalChain(companyId, userId) {
    try {
      const res = await fetch(`/api/approval-chain?company_id=${companyId}&user_id=${userId}`);
      return await res.json();
    } catch { return []; }
  }

  // ============================================================
  // APPROVAL RULES
  // ============================================================
  async function getApprovalRule(companyId) {
    try {
      const res = await fetch(`/api/approval-rules?company_id=${companyId}`);
      const data = await res.json();
      return data;
    } catch { return null; }
  }

  async function saveApprovalRule(companyId, rule) {
    try {
      const res = await fetch('/api/approval-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          sequence: rule.sequence || [],
          percentage_threshold: rule.percentageThreshold || 100,
          specific_approver_id: rule.specificApproverId || null,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Save rule error:', err);
      return null;
    }
  }

  return {
    // Wallet
    getWalletEntries, addWalletEntry, deleteWalletEntry,
    markWalletEntriesAsSubmitted, markWalletEntriesAsBundled,
    // Expenses
    getExpensesByUser, getExpensesByCompany, getExpensesPendingApproval, getExpensesForManager,
    submitExpense, approveExpenseStep, rejectExpenseStep, getExpenseStats,
    // Approval
    buildApprovalChain, getApprovalRule, saveApprovalRule,
  };
})();
