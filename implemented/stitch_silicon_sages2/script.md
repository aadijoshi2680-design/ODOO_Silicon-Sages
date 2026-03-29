# 🎬 ExpensePro — 5-Minute Demo Script
## Team Silicon Sages | Odoo Hackathon

**Team Members:** Richa · Anika · Aaditya · Krish  
**Project:** ExpensePro — Enterprise Expense & Reimbursement Management System  
**Duration:** 5 Minutes

---

## 🎯 Roles Assignment

| Member    | Demo Role          | Speaks About                                                            |
|-----------|--------------------|-------------------------------------------------------------------------|
| **Richa** | Presenter 1 — Intro & Admin | Project intro, problem statement, tech stack, Admin panel demo          |
| **Anika** | Presenter 2 — Employee Flow | Employee wallet, OCR scanning, expense submission                       |
| **Aaditya** | Presenter 3 — Manager & Approval Engine | Manager approval workflow, multi-level chain, conditional auto-approval |
| **Krish** | Presenter 4 — Executive Dashboard & Architecture | Executive analytics dashboard, tech architecture, future scope & close  |

---

## 🕐 Minute-by-Minute Breakdown

---

### ⏱️ MINUTE 1: Introduction & Problem Statement (0:00 — 1:00)
**🎤 Speaker: Richa**

> **Richa:**
> "Hi everyone! We are **Team Silicon Sages** — I'm Richa, and with me are Anika, Aaditya, and Krish."
>
> "We've built **ExpensePro** — a **full-stack enterprise expense and reimbursement management system** that solves a pain point every company faces: *how do employees submit expenses, how do managers approve them, and how does the finance team track it all?*"
>
> "Most companies either use spreadsheets — which are error-prone and slow — or expensive enterprise tools that lack flexibility."
>
> "Our solution, ExpensePro, provides:"
> - ✅ **Role-based access** — Admin, Manager, Employee, and C-suite (CFO, CEO, COO, Director)
> - ✅ **AI-powered receipt scanning** using Google Gemini Vision API
> - ✅ **Live multi-currency conversion** with 30+ currencies
> - ✅ **Multi-step sequential approval pipelines** with conditional auto-approval rules
> - ✅ **Full-stack architecture** — Node.js/Express backend, PostgreSQL database, and a modern SPA frontend
>
> "Let me now walk you through the **Admin experience** to show how a company gets set up."

**🖥️ SCREEN ACTION:** Show the **Auth / Registration page** (split-screen — Company Registration on left, Login on right).

> **Richa (while demoing):**
> "The admin first registers their company — selecting the company name, headquarters country, and this **locks their base currency** for all conversions. For our demo, we've set up a company with INR as the base currency."

**🖥️ SCREEN ACTION:** Navigate to the **User Management** page (Settings).

> "Once logged in, the admin lands on the **User Management** panel. Here, I can:"
> - **Create employees and managers** — assign their name, email, role, department, and reporting manager
> - **Assign departments** — with the ability to create new ones on the fly
> - **Toggle 'Is Manager Approver'** — so the reporting manager automatically becomes the first approver
> - **Send credentials via email** — the system integrates Gmail SMTP to email login details  
> - **Edit roles inline** — I can promote an employee to manager or C-suite right from the team directory
> - **Delete users** from the active directory
>
> "The team directory shows all members at a glance with their role badges, department, reporting chain, and approver status."

---

### ⏱️ MINUTE 2: Approval Workflow Configuration (1:00 — 2:00)
**🎤 Speaker: Richa (continues)**

> **Richa:**
> "Now, here's where it gets powerful — the **Approval Workflow Rules** section, also on the admin panel."

**🖥️ SCREEN ACTION:** Scroll down to the **Approval Workflow Rules** section on the Settings page.

> "The admin can configure two things:"
>
> **1. Approval Sequence**
> "I can build a **multi-step sequential approval pipeline**. Step 1 is always the employee's direct manager (if Manager Approver is toggled on). After that, I can add additional approvers — say the CFO, then the CEO — in any order. The steps are reorderable with move up/down, and I can remove anyone."
>
> **2. Conditional Approval Rules**
> "This is the standout feature. I can enable two types of auto-approval rules:"
> - 🔵 **Percentage Rule** — *'If 60% of the approval chain approves, auto-approve and skip the rest.'*
> - 🔵 **Specific Approver Rule** — *'If the CFO approves, auto-approve immediately regardless of remaining steps.'*
>
> "And these work in **Hybrid Mode** — if either condition is met, the expense is auto-approved and all remaining steps are skipped."
>
> "This means a 5-step approval chain can resolve in 2 steps if the right person approves. Over to Anika for the employee experience!"

---

### ⏱️ MINUTE 3: Employee Wallet, OCR & Submission (2:00 — 3:30)
**🎤 Speaker: Anika**

> **Anika:**
> "Thanks Richa! Now let me show you how an **employee** interacts with ExpensePro. When I log in as an employee, I see my **Financial Overview** dashboard."

**🖥️ SCREEN ACTION:** Show the **Employee Dashboard**.

> "The dashboard shows three key stats — my **Pending Wallet** balance, **Pending Approval** amount, and **Completed** approvals for the last 30 days. Plus quick action cards to jump to Wallet, Bundles, Receipt Scanner, or My Expenses."

**🖥️ SCREEN ACTION:** Navigate to **My Wallet**.

> "The **Wallet** is the employee's expense journal. I can **manually add entries** — specifying amount, currency, category (Travel, Food, Accommodation, Office Supplies, Entertainment), expense date, description, and optional tags."
>
> "But the killer feature is the **AI Receipt Scanner**."

**🖥️ SCREEN ACTION:** Click **Scan Receipt** → Upload a receipt image.

> "I upload a photo of a receipt — it can be a restaurant bill, cab receipt, or hotel invoice. The system sends it to the **Google Gemini Vision API**, which extracts:"
> - 💰 Amount (the final payable total)
> - 💱 Currency (detected from ₹, $, €, £ symbols)
> - 📅 Date
> - 🏪 Vendor name
> - 📂 Category (auto-classified as Food, Travel, etc.)
>
> "It even shows the **AI's reasoning** — like *'Restaurant receipt with Indian cuisine items.'* All fields are editable before saving. One click → **Save to Wallet**."

**🖥️ SCREEN ACTION:** Show the **wallet table** with entries.

> "Now, the **live currency conversion** — if I add an expense in USD, it's automatically converted to the company's base currency (INR) using real-time exchange rates from the ExchangeRate API. The converted amount updates live as I type."
>
> "From the wallet, I can **submit entries directly for approval** — either individually or by selecting multiple entries. I can also group them into **Bundles** on the Bundles page."

**🖥️ SCREEN ACTION:** Click **Send to Approval** on a wallet entry → Confetti animation plays.

> "The submission builds the approval chain based on the admin's configured pipeline and sends it through. The entry status changes from 'In Wallet' to 'Submitted' and gets locked."

---

### ⏱️ MINUTE 4: Manager Approval & Multi-Step Pipeline (3:30 — 4:15)
**🎤 Speaker: Aaditya**

> **Aaditya:**
> "Thanks Anika! Now I'll show the **Manager and Approver experience**. When I log in as a manager, I only see **Team Approvals** — that's my sole responsibility."

**🖥️ SCREEN ACTION:** Show the **Approvals** page logged in as a manager.

> "The approvals page shows:"
> - **Pending Count** and **Pending Total** — so I know the volume at a glance
> - **Previously Actioned** count — for my audit trail
>
> "Each pending expense shows the **employee name, description, category, amount in base currency**, and most importantly — the **Approval Progress Bar**."
>
> "The progress bar shows *'Step 1 of 3 — Your Turn'* or *'Waiting: Step 2 (CFO)'*. This is a **strictly sequential pipeline** — only the current step's approver can act."
>
> "I can **Approve** with an optional comment, or **Reject** with a mandatory reason. If I reject, all remaining steps are auto-skipped."

**🖥️ SCREEN ACTION:** Click **Approve** on an expense → Show the confetti + success toast.

> "Here's where the **conditional rules** kick in. Watch — I just approved as Step 1, and the system detected that the admin had configured a **Specific Approver Rule** for my role. The expense is **auto-approved instantly** — remaining Steps 2 and 3 are marked as 'Skipped' with the reason *'Auto-approved: Specific approver approved'*."
>
> "In the **Previously Actioned** section, I can click **Details** to see the full expense breakdown — employee, department, amount with original currency conversion, description, date, status, and the **complete approval chain** showing each step's status, approver, and comments."

---

### ⏱️ MINUTE 5: Executive Dashboard, Architecture & Close (4:15 — 5:00)
**🎤 Speaker: Krish**

> **Krish:**
> "Finally, let me show you what the **Admin and C-suite** see after all these expenses flow through."

**🖥️ SCREEN ACTION:** Login as Admin → Show the **Executive Dashboard**.

> "The Executive Dashboard gives a company-wide view:"
> - 📊 **Total Expenditure** — sum of all approved expenses
> - ⏳ **Pending Approvals** count
> - 💰 **All-Time Total** — every submitted expense
> - 📈 **Monthly Expenditure Chart** — a Chart.js bar chart showing the last 12 months of spending trends
> - 🏢 **Department-wise Breakdown** — filterable, showing each department's total spend and percentage contribution
> - 📋 **Recent Expenditures Table** — employee, department, description, category, amount, status, and date
>
> "All numbers animate on load with count-up effects, and the entire UI is built with a custom Material Design 3 color system."

> **Krish (Architecture Overview):**
> "A quick look at our **tech stack**:"
> - **Frontend:** Single Page Application (SPA) with vanilla JS, Tailwind CSS, Material Symbols, Chart.js, and canvas-confetti
> - **Backend:** Node.js with Express.js — RESTful API with full CRUD operations
> - **Database:** PostgreSQL with tables for companies, users, departments, wallet entries, expenses, and approval rules
> - **AI Integration:** Google Gemini Vision API for OCR-based receipt scanning with structured JSON extraction
> - **Currency Service:** Live exchange rates from ExchangeRate API with session caching and offline fallbacks
> - **Email Service:** Gmail SMTP integration for sending user credentials on account creation
>
> "Key architectural highlights:"
> - 🔐 **Role-based access control** — 7 distinct roles with page-level and feature-level restrictions
> - 🔄 **Sequential approval engine** — multi-step chains with conditional auto-approval (percentage + specific approver, hybrid mode)
> - 🌍 **30+ currency support** — live conversion with animated counters
> - 🧠 **AI OCR** — Gemini extracts amount, currency, date, vendor, and category with confidence reasoning
>
> "To summarize — ExpensePro is a complete, production-ready expense management system that handles the entire lifecycle: from receipt scanning and expense logging, through multi-level approval pipelines with smart conditional rules, to executive analytics and reporting."
>
> "Thank you! We're **Team Silicon Sages** — and this is **ExpensePro**."

---

## 📋 Feature Summary Cheat Sheet

### Core Features
| Feature | Description |
|---------|-------------|
| **Company Registration** | Admin onboards company, locks base currency |
| **Role-Based Access Control** | 7 roles: Admin, Manager, Employee, CFO, CEO, COO, Director |
| **User Management** | Admin creates users, assigns roles/departments/managers, sends email credentials |
| **Department Management** | Create and assign departments, create new ones on the fly |
| **Digital Wallet** | Employees log expenses with amount, currency, category, date, description, tags |
| **AI Receipt Scanner (OCR)** | Google Gemini Vision API extracts amount, currency, date, vendor, category from receipt photos |
| **Live Currency Conversion** | 30+ currencies with real-time ExchangeRate API, animated conversion counters |
| **Direct Expense Submission** | Submit single expenses or wallet entries directly for approval |
| **Expense Bundles** | Group multiple wallet entries into a bundle for batch submission |
| **Multi-Step Approval Pipeline** | Sequential approval chain (Manager → CFO → CEO), configurable order |
| **Conditional Auto-Approval** | Percentage rule (60% threshold) + Specific Approver rule, hybrid mode |
| **Approval Progress Tracking** | Visual progress bar, step-by-step chain visibility |
| **Expense Detail Modal** | Full audit trail: employee, department, amount, category, approval chain with comments |
| **Executive Dashboard** | Total expenditure, pending count, monthly chart, department breakdown, recent expenses |
| **Employee Dashboard** | Wallet balance, pending amounts, approved totals, quick action cards |
| **Export Reports** | Export functionality for approval records |
| **Email Credentials** | Gmail SMTP sends login details to newly created users |
| **Animated UI** | Count-up animations, confetti effects, typewriter OCR fill, skeleton loaders, toast notifications |

### Technical Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 SPA, Vanilla JS, Tailwind CSS, Chart.js, Material Symbols, canvas-confetti |
| Backend | Node.js, Express.js, RESTful API |
| Database | PostgreSQL (companies, users, departments, wallet_entries, expenses, approval_rules) |
| AI/ML | Google Gemini 2.0 Flash Vision API (OCR) |
| Currency | ExchangeRate API (live), RestCountries API, session caching |
| Email | Nodemailer + Gmail SMTP |
| Design | Material Design 3 color tokens, Manrope + Inter typography |

---

## 🎬 Demo Flow Cheat Sheet (Quick Reference)

```
RICHA (1:00)
├── Intro → Team name + Problem statement
├── Auth Page → Company registration (currency lock)
├── User Management → Create employee, assign role/dept/manager
│   ├── Email credentials toggle
│   └── Team directory (inline role editing, delete)
└── Approval Rules → Multi-step sequence + conditional rules

ANIKA (1:30)
├── Employee Dashboard → Stats + Quick actions
├── Wallet → Manual entry (amount, currency, category)
├── OCR Scanner → Upload receipt → Gemini extracts data
│   ├── AI fills: Amount, Currency, Date, Vendor, Category
│   └── Reasoning shown + editable fields
├── Currency Conversion → Live animated INR conversion
└── Submit to Approval → Direct submit / bundle

AADITYA (0:45)
├── Manager Login → Team Approvals only
├── Pending Table → Progress bar + "Your Turn" indicator
├── Approve/Reject → Sequential flow enforced
├── Conditional Auto-Approval → Demo the skip
└── Detail Modal → Full audit chain with comments

KRISH (0:45)
├── Executive Dashboard → Stats, chart, dept breakdown
├── Tech Architecture → Stack overview
├── Key Highlights → RBAC, approval engine, OCR, currency
└── Closing → Thank you
```

---

> **Total Time: ~5 minutes**  
> **Tip:** Keep transitions snappy. Each person should be ready to take over immediately. Have all four browser tabs pre-logged-in with the right roles (Admin, Employee, Manager, Admin/C-suite).
