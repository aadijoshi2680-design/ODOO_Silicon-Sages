// ============================================================
// Express API Server — ExpensePro Backend
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDatabase, seedDepartments } = require('./db');
const { sendCredentialsEmail } = require('./email');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..')));

// Valid roles
const VALID_ROLES = ['admin', 'manager', 'employee', 'cfo', 'ceo', 'coo', 'director'];
const EXECUTIVE_ROLES = ['admin', 'cfo', 'ceo', 'coo', 'director'];
const CAN_MANAGE_USERS = ['admin']; // Only admin can add/remove users

// ============================================================
// AUTH
// ============================================================

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, country, currency, companyName } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check duplicate email
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

    // Create company
    const compRes = await client.query(
      'INSERT INTO companies (name, country, currency) VALUES ($1, $2, $3) RETURNING *',
      [companyName || `${name}'s Company`, country || 'United States', currency || 'USD']
    );
    const company = compRes.rows[0];

    // Seed departments
    await seedDepartments(company.id, client);

    // Create admin user
    const userRes = await client.query(
      'INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, 'admin', company.id]
    );
    const user = userRes.rows[0];
    delete user.password;

    await client.query('COMMIT');
    res.json({ user, company });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

    const compRes = await pool.query('SELECT * FROM companies WHERE id = $1', [user.company_id]);
    const company = compRes.rows[0] || null;

    // Get department name
    if (user.department_id) {
      const deptRes = await pool.query('SELECT name FROM departments WHERE id = $1', [user.department_id]);
      user.departmentName = deptRes.rows[0]?.name || null;
    }

    delete user.password;
    res.json({ user, company });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// USERS
// ============================================================

app.get('/api/users', async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: 'company_id required' });
  try {
    const result = await pool.query(`
      SELECT u.*, d.name as department_name
      FROM users u LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.company_id = $1 ORDER BY u.created_at
    `, [company_id]);
    const users = result.rows.map(u => { delete u.password; return u; });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, role, company_id, manager_id, department_id, is_manager_approver, send_email } = req.body;
  if (!name || !email || !password || !company_id) return res.status(400).json({ error: 'Missing required fields' });
  if (role && !VALID_ROLES.includes(role)) return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, company_id, manager_id, department_id, is_manager_approver)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, password, role || 'employee', company_id, manager_id || null, department_id || null, is_manager_approver || false]
    );
    const user = result.rows[0];

    // Send email if requested
    let emailResult = null;
    if (send_email) {
      const compRes = await pool.query('SELECT name FROM companies WHERE id = $1', [company_id]);
      emailResult = await sendCredentialsEmail({
        to: email, name, email, password,
        role: role || 'employee',
        companyName: compRes.rows[0]?.name || 'ExpensePro',
      });
    }

    delete user.password;
    res.json({ user, emailResult });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const allowed = ['name', 'role', 'manager_id', 'department_id', 'is_manager_approver'];
  const sets = []; const vals = [];
  let idx = 1;

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = $${idx}`);
      vals.push(updates[key]);
      idx++;
    }
  }
  if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  vals.push(id);
  try {
    const result = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    delete result.rows[0].password;
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DEPARTMENTS
// ============================================================

app.get('/api/departments', async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: 'company_id required' });
  try {
    const result = await pool.query('SELECT * FROM departments WHERE company_id = $1 ORDER BY name', [company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', async (req, res) => {
  const { name, company_id } = req.body;
  if (!name || !company_id) return res.status(400).json({ error: 'name and company_id required' });
  try {
    const result = await pool.query(
      'INSERT INTO departments (name, company_id) VALUES ($1, $2) ON CONFLICT (name, company_id) DO UPDATE SET name=$1 RETURNING *',
      [name, company_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// WALLET ENTRIES
// ============================================================

app.get('/api/wallet', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    const result = await pool.query('SELECT * FROM wallet_entries WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    const entries = result.rows.map(e => ({ ...e, tags: typeof e.tags === 'string' ? JSON.parse(e.tags) : (e.tags || []) }));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wallet', async (req, res) => {
  const { user_id, amount, currency, converted_amount, exchange_rate, category, description, date, tags } = req.body;
  if (!user_id || !amount) return res.status(400).json({ error: 'user_id and amount required' });
  try {
    const result = await pool.query(
      `INSERT INTO wallet_entries (user_id, amount, currency, converted_amount, exchange_rate, category, description, date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, amount, currency || 'INR', converted_amount, exchange_rate, category || 'Other', description || '', date || new Date().toISOString().split('T')[0], JSON.stringify(tags || [])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wallet/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM wallet_entries WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark wallet entries as submitted (direct or bundle)
app.put('/api/wallet/submit', async (req, res) => {
  const { ids, status, bundle_id } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: 'ids required' });
  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const setBundleClause = bundle_id ? `, bundle_id = $${ids.length + 2}` : '';
    const vals = [...ids, status || 'submitted'];
    if (bundle_id) vals.push(bundle_id);
    await pool.query(`UPDATE wallet_entries SET status = $${ids.length + 1}${setBundleClause} WHERE id IN (${placeholders})`, vals);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// EXPENSES
// ============================================================

app.get('/api/expenses', async (req, res) => {
  const { user_id, company_id, status } = req.query;
  let query = 'SELECT e.*, u.name as submitter_name, u.department_id, d.name as department_name FROM expenses e LEFT JOIN users u ON e.user_id = u.id LEFT JOIN departments d ON u.department_id = d.id WHERE 1=1';
  const vals = [];
  let idx = 1;

  if (user_id) { query += ` AND e.user_id = $${idx}`; vals.push(user_id); idx++; }
  if (company_id) { query += ` AND e.company_id = $${idx}`; vals.push(company_id); idx++; }
  if (status) { query += ` AND e.status = $${idx}`; vals.push(status); idx++; }
  query += ' ORDER BY e.submitted_at DESC';

  try {
    const result = await pool.query(query, vals);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin dashboard stats
app.get('/api/expenses/stats', async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: 'company_id required' });
  try {
    // Total expenditure (approved)
    const totalRes = await pool.query(
      'SELECT COALESCE(SUM(converted_amount), 0) as total FROM expenses WHERE company_id = $1 AND status = $2',
      [company_id, 'approved']
    );

    // Pending approvals count
    const pendingRes = await pool.query(
      'SELECT COUNT(*) as count FROM expenses WHERE company_id = $1 AND status = $2',
      [company_id, 'pending']
    );

    // Department-wise expenditure
    const deptRes = await pool.query(`
      SELECT d.name as department, COALESCE(SUM(e.converted_amount), 0) as total, COUNT(e.id) as count
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE e.company_id = $1 AND e.status = 'approved'
      GROUP BY d.name ORDER BY total DESC
    `, [company_id]);

    // Month-wise expenditure (last 12 months)
    const monthRes = await pool.query(`
      SELECT TO_CHAR(date_trunc('month', e.submitted_at), 'YYYY-MM') as month,
             TO_CHAR(date_trunc('month', e.submitted_at), 'Mon YYYY') as label,
             COALESCE(SUM(e.converted_amount), 0) as total
      FROM expenses e
      WHERE e.company_id = $1 AND e.status = 'approved'
        AND e.submitted_at >= NOW() - INTERVAL '12 months'
      GROUP BY month, label ORDER BY month
    `, [company_id]);

    // Recent expenditures (last 10)
    const recentRes = await pool.query(`
      SELECT e.*, u.name as submitter_name, d.name as department_name
      FROM expenses e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE e.company_id = $1
      ORDER BY e.submitted_at DESC LIMIT 10
    `, [company_id]);

    // Total all-time (all statuses)
    const allTotalRes = await pool.query(
      'SELECT COALESCE(SUM(converted_amount), 0) as total FROM expenses WHERE company_id = $1',
      [company_id]
    );

    res.json({
      totalExpenditure: parseFloat(totalRes.rows[0].total),
      allTimeTotal: parseFloat(allTotalRes.rows[0].total),
      pendingCount: parseInt(pendingRes.rows[0].count),
      departmentWise: deptRes.rows.map(r => ({ department: r.department || 'Unassigned', total: parseFloat(r.total), count: parseInt(r.count) })),
      monthWise: monthRes.rows.map(r => ({ month: r.month, label: r.label, total: parseFloat(r.total) })),
      recentExpenses: recentRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses/submit', async (req, res) => {
  const { user_id, company_id, amount, currency, converted_amount, exchange_rate, category, description, date, approval_chain, wallet_entry_ids } = req.body;
  if (!user_id || !company_id || !amount) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, company_id, amount, currency, converted_amount, exchange_rate, category, description, date, approval_chain)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [user_id, company_id, amount, currency, converted_amount, exchange_rate, category, description, date, JSON.stringify(approval_chain || [])]
    );

    // Mark wallet entries if provided
    if (wallet_entry_ids && wallet_entry_ids.length > 0) {
      const placeholders = wallet_entry_ids.map((_, i) => `$${i + 1}`).join(',');
      await pool.query(`UPDATE wallet_entries SET status = 'submitted' WHERE id IN (${placeholders})`, wallet_entry_ids);
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { approver_id, comment } = req.body;
  if (!approver_id) return res.status(400).json({ error: 'approver_id required' });

  try {
    const expRes = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expRes.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    const expense = expRes.rows[0];
    if (expense.status !== 'pending') return res.status(400).json({ error: 'Expense is not pending' });
    const chain = expense.approval_chain || [];

    // SEQUENTIAL FLOW: Only the current step (lowest pending step) can approve
    const pendingSteps = chain.filter(s => s.status === 'pending').sort((a, b) => a.step - b.step);
    if (pendingSteps.length === 0) return res.status(400).json({ error: 'No pending steps remaining' });

    const currentStep = pendingSteps[0];
    if (currentStep.approverId !== approver_id) {
      return res.status(403).json({
        error: `Not your turn. Waiting for Step ${currentStep.step}: ${currentStep.approverName} (${currentStep.role})`
      });
    }

    // Mark this step as approved
    currentStep.status = 'approved';
    currentStep.comment = comment || '';
    currentStep.decidedAt = new Date().toISOString();

    // --- CONDITIONAL APPROVAL RULES ---
    const ruleRes = await pool.query('SELECT * FROM approval_rules WHERE company_id = $1', [expense.company_id]);
    const rule = ruleRes.rows[0] || null;

    const approvedCount = chain.filter(s => s.status === 'approved').length;
    const totalSteps = chain.length;
    const pct = totalSteps > 0 ? Math.round((approvedCount / totalSteps) * 100) : 0;

    let autoApproved = false;
    let autoReason = '';

    if (rule) {
      // Rule 1: Specific approver (e.g., "If CFO approves → auto-approve")
      if (rule.specific_approver_id && rule.specific_approver_id === approver_id) {
        autoApproved = true;
        autoReason = `Auto-approved: Specific approver (${currentStep.approverName}) approved`;
      }

      // Rule 2: Percentage threshold (e.g., "If 60% approve → auto-approve")
      if (rule.percentage_threshold && rule.percentage_threshold < 100 && pct >= rule.percentage_threshold) {
        autoApproved = true;
        autoReason = autoReason
          ? `${autoReason} + Percentage threshold met (${pct}% ≥ ${rule.percentage_threshold}%)`
          : `Auto-approved: ${pct}% of approvers approved (threshold: ${rule.percentage_threshold}%)`;
      }
    }

    const allApproved = chain.every(s => s.status === 'approved');

    let finalStatus = 'pending';
    let finalProgress = pct;

    if (autoApproved || allApproved) {
      finalStatus = 'approved';
      finalProgress = 100;

      // Skip remaining pending steps if auto-approved early
      if (!allApproved) {
        chain.forEach(s => {
          if (s.status === 'pending') {
            s.status = 'skipped';
            s.decidedAt = new Date().toISOString();
            s.comment = autoReason || 'Auto-skipped due to conditional approval';
          }
        });
      }
    }

    await pool.query(
      'UPDATE expenses SET approval_chain = $1, approval_progress = $2, status = $3 WHERE id = $4',
      [JSON.stringify(chain), finalProgress, finalStatus, id]
    );

    res.json({
      ...expense,
      approval_chain: chain,
      approval_progress: finalProgress,
      status: finalStatus,
      auto_approved: autoApproved,
      auto_reason: autoReason || null,
    });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { approver_id, comment } = req.body;
  if (!approver_id) return res.status(400).json({ error: 'approver_id required' });

  try {
    const expRes = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expRes.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    const expense = expRes.rows[0];
    if (expense.status !== 'pending') return res.status(400).json({ error: 'Expense is not pending' });
    const chain = expense.approval_chain || [];

    // SEQUENTIAL FLOW: Only the current step can reject
    const pendingSteps = chain.filter(s => s.status === 'pending').sort((a, b) => a.step - b.step);
    if (pendingSteps.length === 0) return res.status(400).json({ error: 'No pending steps remaining' });

    const currentStep = pendingSteps[0];
    if (currentStep.approverId !== approver_id) {
      return res.status(403).json({
        error: `Not your turn. Waiting for Step ${currentStep.step}: ${currentStep.approverName} (${currentStep.role})`
      });
    }

    // Mark this step as rejected
    currentStep.status = 'rejected';
    currentStep.comment = comment || '';
    currentStep.decidedAt = new Date().toISOString();

    // Skip all remaining pending steps
    chain.forEach(s => {
      if (s.status === 'pending') {
        s.status = 'skipped';
        s.decidedAt = new Date().toISOString();
        s.comment = `Skipped: Rejected at Step ${currentStep.step} by ${currentStep.approverName}`;
      }
    });

    const approvedCount = chain.filter(s => s.status === 'approved').length;
    const pct = chain.length > 0 ? Math.round((approvedCount / chain.length) * 100) : 0;

    await pool.query(
      'UPDATE expenses SET approval_chain = $1, approval_progress = $2, status = $3 WHERE id = $4',
      [JSON.stringify(chain), pct, 'rejected', id]
    );

    res.json({ ...expense, approval_chain: chain, approval_progress: pct, status: 'rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// APPROVAL RULES
// ============================================================

app.get('/api/approval-rules', async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: 'company_id required' });
  try {
    const result = await pool.query('SELECT * FROM approval_rules WHERE company_id = $1', [company_id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/approval-rules', async (req, res) => {
  const { company_id, sequence, percentage_threshold, specific_approver_id } = req.body;
  if (!company_id) return res.status(400).json({ error: 'company_id required' });
  try {
    const result = await pool.query(`
      INSERT INTO approval_rules (company_id, sequence, percentage_threshold, specific_approver_id, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (company_id) DO UPDATE SET
        sequence = $2, percentage_threshold = $3, specific_approver_id = $4, updated_at = NOW()
      RETURNING *
    `, [company_id, JSON.stringify(sequence || []), percentage_threshold || 100, specific_approver_id || null]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// APPROVAL CHAIN BUILDER (utility endpoint)
// ============================================================

app.get('/api/approval-chain', async (req, res) => {
  const { user_id, company_id } = req.query;
  if (!user_id || !company_id) return res.status(400).json({ error: 'user_id and company_id required' });
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];
    const chain = [];

    // Step 1: Direct manager if IS_MANAGER_APPROVER
    if (user.manager_id && user.is_manager_approver) {
      const mgrRes = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [user.manager_id]);
      if (mgrRes.rows.length > 0) {
        const mgr = mgrRes.rows[0];
        chain.push({ approverId: mgr.id, approverName: mgr.name, role: mgr.role, status: 'pending', step: chain.length + 1 });
      }
    }

    // Step 2: Approval rule sequence
    const ruleRes = await pool.query('SELECT * FROM approval_rules WHERE company_id = $1', [company_id]);
    if (ruleRes.rows.length > 0) {
      const seq = ruleRes.rows[0].sequence || [];
      for (const s of seq) {
        if (!chain.find(c => c.approverId === s.approverId)) {
          const apRes = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [s.approverId]);
          if (apRes.rows.length > 0) {
            const ap = apRes.rows[0];
            chain.push({ approverId: ap.id, approverName: ap.name, role: s.role || ap.role, status: 'pending', step: chain.length + 1 });
          }
        }
      }
    }

    // Fallback: all managers/admins
    if (chain.length === 0) {
      const mgrsRes = await pool.query(
        "SELECT id, name, role FROM users WHERE company_id = $1 AND role IN ('admin','manager','cfo','ceo','coo','director') AND id != $2",
        [company_id, user_id]
      );
      for (const m of mgrsRes.rows) {
        chain.push({ approverId: m.id, approverName: m.name, role: m.role, status: 'pending', step: chain.length + 1 });
      }
    }

    res.json(chain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START
// ============================================================

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏛  ExpensePro API running at http://localhost:${PORT}`);
    console.log(`   Frontend served at http://localhost:${PORT}`);
    console.log(`   PostgreSQL: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'expensepro'}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err.message);
  console.error('\n⚠️  Make sure PostgreSQL is running and the database exists.');
  console.error('   Run: createdb expensepro\n');
  process.exit(1);
});
