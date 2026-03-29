# Reimbursement Management System — Features Implementation

> **Legend:**
> - 📋 Core Feature — from original requirements
> - ✨ Extra Feature — built beyond requirements
> - 🔗 Integration — external API or service
> - ⚠️ Business Rule — critical logic, do not miss

---

## 1. Authentication & User Management 📋

### 1.1 First Signup Behaviour
When a brand-new user registers, the system does all of the following automatically in a single transaction:

| Feature | Description |
|---|---|
| **Company auto-created** | A new Company entity is created and linked to the user's account. No separate company setup step needed. |
| **Default currency** | The company's base currency is set automatically from the country selected during signup, using the country → currency API. |
| **Admin user created** | The registering user is given the Admin role automatically with full permissions. |

### 1.2 Admin Capabilities

| Capability | Description |
|---|---|
| **Create employees** | Admin fills a form with name, email, role. An account is created and credentials are sent to the new user. |
| **Create managers** | Same flow as employees but the Manager role is assigned, unlocking the approval queue in their account. |
| **Change roles** | Admin can upgrade an Employee to Manager or downgrade a Manager to Employee at any time. |
| **Manager–employee link** | Admin can assign which Manager is responsible for each Employee. This drives the IS MANAGER APPROVER rule. |
| **IS MANAGER APPROVER flag** | A toggle on each employee record. If ON, that employee's manager is inserted as the first approver in every approval chain for that employee's expenses. |

---

## 2. Expense Submission — Employee Role 📋

### 2.1 Submit an Expense Claim

| Field | Description |
|---|---|
| **Amount** | Entered in any currency — not limited to the company's base currency. The system stores both the original and the converted amount. |
| **Currency** | Dropdown populated from the countries API. Defaults to company currency but can be changed freely. |
| **Category** | Predefined list: Travel, Food, Accommodation, Office Supplies, Entertainment, Other. |
| **Description** | Free-text field. Employee describes what the expense was for. |
| **Date** | Date picker. Defaults to today. Cannot be a future date. |
| **Receipt upload** | Employee can attach an image or PDF of the receipt. Triggers OCR auto-fill (see Section 8). |

### 2.2 Expense History

| Status Badge | What It Means |
|---|---|
| **Pending** | Submitted but no approver has acted yet. |
| **In Review** | At least one approver in the chain has approved but the chain is not complete. |
| **Approved** | All required approvers (or a conditional rule) have approved. Reimbursement is due. |
| **Rejected** | Rejected at any stage. The employee can see who rejected it and the comment left. |

> The employee can also tap any expense to see a full approval timeline — which step it is at, who is the current approver, and all past approver comments.

---

## 3. Employee Wallet ✨ Extra Feature

> **Why We Added This:** Employees accumulate many small expenses throughout a week. Submitting each one individually creates approval queue spam. The Wallet is a personal ledger inside the employee account where they log expenses on the go and decide later which ones to officially submit for reimbursement.

### 3.1 What the Wallet Is

The Wallet is a private holding area that belongs to the employee only. Nothing in the wallet is visible to managers or admins until the employee explicitly submits it.

### 3.2 Adding an Entry to the Wallet

| Field | Description |
|---|---|
| **Amount + Currency** | Any currency. Stored as-is in original currency. |
| **Category** | Same category list as the main expense form. |
| **Date** | Date of the expense. |
| **Description** | Optional note about what the expense was. |
| **Receipt / Photo** | Optional upload. OCR auto-fills all fields if a receipt is attached. |
| **Tags** | Optional free-text tags (e.g. 'client dinner', 'Project X') for personal organisation. |

### 3.3 Wallet Dashboard

| Column | Description |
|---|---|
| **Date** | When the expense occurred. |
| **Category** | What type of expense it is. |
| **Description** | Short description of the expense. |
| **Amount** | Original amount in original currency. |
| **Converted** | Equivalent in the company's default currency (auto-calculated live). |
| **Status** | In Wallet / In Bundle / Submitted. |
| **Actions** | Edit or Delete (only available while status is 'In Wallet'). |

> A running total row at the bottom shows the sum of all **In Wallet** entries converted to the company's base currency.

### 3.4 Wallet Entry Statuses

| Status | Meaning |
|---|---|
| **In Wallet** | Saved locally. Not yet added to any bundle. Fully editable and deletable. |
| **In Bundle** | Added to a draft bundle. Cannot be added to another bundle simultaneously. |
| **Submitted** | Part of a bundle that has been sent for approval. Read-only. Greyed out in the wallet. |

---

## 4. Expense Bundle — Select & Send ✨ Extra Feature

> **Why We Added This:** Instead of raising 10 separate approval requests for 10 small expenses, the employee selects the relevant wallet entries, groups them into one Bundle, and sends the whole bundle through the approval chain in a single request. Approvers review one clean summary table instead of ten separate tickets.

### 4.1 Bundle Creation — Step by Step

| # | Actor | What Happens |
|---|---|---|
| 1 | Employee | Opens 'My Wallet' and sees all In Wallet entries as a list with checkboxes. |
| 2 | Employee | Ticks the checkboxes next to the entries they want to group together. |
| 3 | Employee | Clicks 'Create Bundle'. A modal opens asking for a Bundle Name (required) and a Bundle Note (optional). |
| 4 | System | Auto-generates the Bundle Summary Table and displays it for employee review. |
| 5 | Employee | Reviews the table. Can uncheck any entry to remove it. Sees the grand total in company currency. |
| 6 | Employee | Clicks 'Submit for Approval'. The bundle enters the approval chain immediately. |
| 7 | System | Wallet entries in the bundle are locked — their status changes to 'Submitted'. |

### 4.2 Bundle Summary Table

| # | Date | Category | Description | Amount | Currency | Converted |
|---|---|---|---|---|---|---|
| 1 | 12 Oct | Travel | Flight to Delhi | 4,500 | INR | ₹ 4,500 |
| 2 | 12 Oct | Food | Airport lunch | 850 | INR | ₹ 850 |
| 3 | 13 Oct | Stay | Hotel – 1 night | 120 | USD | ₹ 10,020 |
| 4 | 14 Oct | Travel | Return cab | 650 | INR | ₹ 650 |
| **Grand Total** | | | | | | **₹ 16,020** |

### 4.3 Bundle States

| State | What It Means |
|---|---|
| **Draft** | Created but not yet submitted. Entries are locked In Bundle but bundle can be edited. |
| **Submitted** | Sent into the approval chain. Entries fully locked. |
| **Under Review** | At least one approver has acted; chain not yet complete. |
| **Approved** | All approvers (or a conditional rule) have approved. |
| **Rejected** | Rejected at any step. Entries return to In Wallet status — can be re-bundled. |

### 4.4 Bundle Rules — Business Logic ⚠️

> - An expense entry can only belong to **ONE bundle** at a time.
> - Once a bundle is **Submitted**, every entry inside it is fully locked — no edits or deletes.
> - If a bundle is **Rejected**, ALL entries inside it return to **In Wallet** status and can be re-bundled.
> - An employee can have **multiple Draft bundles** at the same time.
> - A bundle follows the **same approval chain** as an individual expense (IS MANAGER APPROVER applies).

---

## 5. Approval Workflow — Manager & Admin Role 📋

> ⚠️ **Critical Business Rule:** If the IS MANAGER APPROVER flag is checked on an employee's record, that employee's assigned manager is **ALWAYS** inserted as Step 1 in the approval chain — before any other configured approver.

### 5.1 Sequential Multi-Level Approval

| Feature | Description |
|---|---|
| **Example chain** | Step 1 → Manager (if IS MANAGER APPROVER = ON) \| Step 2 → Finance \| Step 3 → Director |
| **Sequential enforcement** | Expense moves to the next approver ONLY after the current approver has approved or rejected. |
| **Auto-routing** | When approver N approves, an approval request is auto-generated in approver N+1's queue — no manual handoff needed. |
| **Comment required** | Both Approve and Reject actions require a mandatory comment from the approver. |
| **Currency display** | All amounts shown to approvers are in the company's default currency, auto-converted from whatever currency the employee submitted in. |

### 5.2 What a Manager Sees

- A queue of all expenses and bundles pending their approval.
- Each item shows: Employee name, submission date, category, total amount in company currency, and a link to the full Bundle Summary Table (for bundles).
- Approve or Reject buttons — both require a comment before confirming.
- After acting, the item disappears from their queue and auto-routes to the next step.

---

## 6. Conditional Approval Flow 📋

Admin can attach conditional rules that can auto-approve an expense at any point in the chain when a condition is met.

| Rule Type | How It Works | Example |
|---|---|---|
| **Percentage Rule** | Auto-approves when X% of the configured approvers have approved — regardless of who they are. | *60% of approvers approve → expense is auto-approved* |
| **Specific Approver** | Auto-approves the moment a named person approves — skipping all remaining steps. | *CFO approves → expense instantly auto-approved* |
| **Hybrid Rule** | Fires on whichever condition is satisfied first — percentage threshold OR specific approver. | *60% approved OR CFO approves → auto-approved* |

> ⚠️ Multi-level sequential approval AND conditional rules can both be active on the same expense/bundle at the same time. The conditional rule is checked after **EVERY** approver action.

---

## 7. Roles & Permissions 📋

| Role | What They Can Do |
|---|---|
| **Admin** | Auto-creates company on signup · Manage all users and roles · Define manager–employee relationships · Configure approval chains · View ALL expenses and bundles company-wide · Override any approval at any stage |
| **Manager** | Review and approve/reject expenses & bundles assigned to them · See the full Bundle Summary Table · View all expenses submitted by their direct reports · Amounts always shown in company default currency |
| **Employee** | Submit individual expense claims · Use the Wallet to log expenses before submitting · Create bundles from wallet entries · Submit bundles for approval · Track approval status of every claim and bundle · View full approval timeline and comments |

---

## 8. OCR Receipt Scanning 📋

### 8.1 Fields Auto-Filled by OCR

| Field | What Is Extracted |
|---|---|
| **Amount** | Extracted from the total or grand total line on the receipt. |
| **Date** | Extracted from the date printed on the receipt. |
| **Vendor / Restaurant name** | The merchant name at the top of the receipt. |
| **Category** | Inferred from the merchant type (e.g. restaurant → Food, airline → Travel). |
| **Description / Line items** | A summary of the items listed on the receipt. |

### 8.2 How It Works (User Flow)

1. Employee taps 'Upload Receipt' or the camera icon on mobile.
2. Image or PDF is uploaded.
3. A scan-line animation sweeps down the receipt image to signal OCR is running.
4. Fields fill in one by one with a typewriter animation as OCR results come in.
5. Employee reviews all fields. Any field can be edited freely.
6. Employee saves/submits — OCR data and any manual edits are stored together.

> ⚠️ OCR is a **helper — not a gatekeeper**. All auto-filled fields are editable. The employee is always responsible for confirming the values before submission.

---

## 9. Currency Conversion 📋 🔗

**APIs Used:**
- Real-time rates: `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`
- Country → currency lookup: `https://restcountries.com/v3.1/all?fields=name,currencies`

### 9.1 How Currency Works Across the System

| Context | Behaviour |
|---|---|
| **Expense form** | Employee types any amount in any currency. Converted equivalent shown live below the field as they type (animated counter). |
| **Stored data** | Both the original amount + currency AND the converted amount are stored permanently on the record for audit purposes. |
| **Wallet total** | Running total at the bottom of the wallet converts all entries to company currency in real time. |
| **Bundle table** | Each row shows original currency + converted amount. Grand total is always in company currency. |
| **Approver view** | Managers and all approvers ONLY see amounts in the company's default currency. They never see foreign currency amounts. |
| **Rate snapshot** | The exchange rate at the time of submission is stored with the record. Historical records always show the rate that was used. |

---

## 10. Full End-to-End Lifecycle 📋

| # | Actor | What Happens |
|---|---|---|
| 1 | Employee | Logs expenses in the Wallet using the form or by scanning a receipt with OCR. |
| 2 | Employee | Selects wallet entries using checkboxes → clicks 'Create Bundle' → fills Bundle Name. |
| 3 | Employee | Reviews the auto-generated Bundle Summary Table with all amounts and the grand total in company currency. |
| 4 | Employee | Clicks 'Submit for Approval'. Bundle enters the approval chain. Wallet entries lock to 'Submitted'. |
| 5 | System | Checks IS MANAGER APPROVER flag on the employee record. If ON → routes to Manager first. |
| 6 | Manager | Sees the bundle in their approval queue. Reviews the Bundle Summary Table. Approves or Rejects with a mandatory comment. |
| 7 | System | On approval, checks if any conditional rule has been triggered (percentage or specific approver). If triggered → auto-approves and notifies employee. |
| 8 | System | If no conditional rule triggered → routes to next approver in the configured sequential chain. |
| 9 | Approver N | Reviews and acts. System checks conditional rules again after each action. |
| 10 | System | Once all steps complete (or a conditional rule fires) → bundle is marked Approved or Rejected. |
| 11 | Admin | Can override at any step — force-approving or force-rejecting regardless of chain position. |
| 12 | Employee | Receives final status notification with all approver comments visible in the approval timeline. |

---

## 11. External APIs 🔗

| API | URL | Usage |
|---|---|---|
| **Countries & Currencies** | `https://restcountries.com/v3.1/all?fields=name,currencies` | Used on signup to set company currency and in the expense form currency dropdown. |
| **Exchange Rates** | `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}` | Used to convert all expense amounts to company currency in real time and at submission. |

---

## 12. UI Mockup Reference 🔗

**Excalidraw Mockup:** https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA

Refer to this for: screen layouts, navigation flows, wallet UI, bundle creation modal, approval queue view, and admin panel design.

---

*Reimbursement Management System · Agent Implementation Briefing · Odoo Hackathon Track*
