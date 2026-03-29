// ============================================================
// Database — PostgreSQL connection + schema + seed
// ============================================================

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Krish@140618',
  database: process.env.DB_NAME || 'expensepro',
});

// ---- Schema ----
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) DEFAULT 'United States',
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, company_id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        is_manager_approver BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallet_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        converted_amount DECIMAL(15,2),
        exchange_rate DECIMAL(15,6),
        category VARCHAR(100),
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'wallet',
        tags TEXT DEFAULT '[]',
        bundle_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        converted_amount DECIMAL(15,2),
        exchange_rate DECIMAL(15,6),
        category VARCHAR(100),
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'pending',
        approval_chain JSONB DEFAULT '[]',
        approval_progress INTEGER DEFAULT 0,
        bundle_id INTEGER,
        submitted_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bundles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255),
        note TEXT,
        entry_ids JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'draft',
        approval_chain JSONB DEFAULT '[]',
        approval_progress INTEGER DEFAULT 0,
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS approval_rules (
        id SERIAL PRIMARY KEY,
        company_id INTEGER UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
        sequence JSONB DEFAULT '[]',
        percentage_threshold INTEGER DEFAULT 100,
        specific_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✓ Database tables ready');
  } finally {
    client.release();
  }
}

// ---- Seed default departments for a company ----
async function seedDepartments(companyId, client) {
  const db = client || pool; // Use transaction client if provided
  const defaults = ['Engineering', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'Sales', 'Legal', 'Design'];
  for (const name of defaults) {
    await db.query(
      'INSERT INTO departments (name, company_id) VALUES ($1, $2) ON CONFLICT (name, company_id) DO NOTHING',
      [name, companyId]
    );
  }
}

module.exports = { pool, initDatabase, seedDepartments };
