# Design System Strategy: Corporate Expense Management

## 1. Overview & Creative North Star

### Creative North Star: "The Financial Architect"
In a landscape of cluttered corporate dashboards, this design system operates as "The Financial Architect." It is built on the philosophy of **Subtle Precision**. Rather than relying on heavy borders and loud alerts, it uses architectural layering, intentional white space, and an editorial typographic hierarchy to guide the user through complex data.

The system breaks the "template" look through **Tonal Modernism**. We move away from the rigid 1px grid of traditional SaaS and instead use background shifts and glass-like elevations to define space. This creates an environment that feels expensive, calm, and authoritative—essential qualities for managing significant corporate capital.

---

## 2. Colors

The palette is anchored in high-end neutrals (creams and greys) punctuated by a sophisticated slate blue (`primary: #376479`).

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. To separate a sidebar from a main content area, or a header from a list, use background shifts. 
*   **Example:** Place a `surface-container-low` list section directly on a `surface` background. The change in hex value is the boundary.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the tiers to communicate "closeness" to the user:
*   **Base Layer:** `surface` (#fff9ee)
*   **Sectional Layer:** `surface-container-low` (#f9f3e8) 
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) to make them "pop" against the cream base.

### The "Glass & Gradient" Rule
For floating elements like modals, navigation drawers, or "New Expense" buttons, apply **Glassmorphism**:
*   **Background:** `surface` at 80% opacity.
*   **Blur:** `backdrop-filter: blur(12px)`.
*   **Signature Texture:** Primary CTAs should utilize a subtle linear gradient from `primary` (#376479) to `primary-container` (#729eb5) at a 135-degree angle to add depth and "soul" to the action.

---

## 3. Typography

The typography strategy uses a dual-font approach to balance editorial elegance with data-heavy utility.

*   **Display & Headlines (Manrope):** A modern geometric sans-serif used for large numbers and section headers. Its wide apertures ensure that even at `display-lg` (3.5rem), it feels airy and premium.
*   **Body & Labels (Inter):** The workhorse for expense tables and input fields. Inter’s high x-height provides maximum legibility for small-scale data (e.g., `label-sm` at 0.6875rem).

**Editorial Hierarchy:** Use `headline-md` for page titles and immediately drop to `body-md` for descriptions. The high contrast in scale between "Big Data" (Manrope) and "Instructional Text" (Inter) creates a signature, high-end look.

---

## 4. Elevation & Depth

We eschew traditional shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-highest` element inside a `surface-container-low` area to indicate a "pressed" or "nested" information module.
*   **Ambient Shadows:** For floating modals, use a custom shadow: `box-shadow: 0 12px 32px -4px rgba(29, 28, 21, 0.06)`. Note the use of `on-surface` (#1d1c15) as the shadow tint rather than pure black.
*   **The "Ghost Border" Fallback:** If a border is required for high-density data tables, use `outline-variant` (#c1c7cc) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary-container`), white text, `md` (0.375rem) corner radius.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. `on-primary-fixed-variant` text with no background until hover.

### Cards & Lists
*   **Rules:** Forbid divider lines. Use `spacing-8` (1.75rem) or `spacing-10` (2.25rem) to separate list items.
*   **Expense Rows:** Use a subtle hover state with `surface-dim` (#dfd9cf) to indicate interactivity without adding visual weight.

### Input Fields
*   **Style:** `surface-container-lowest` background with a `Ghost Border` (15% `outline-variant`). 
*   **Focus State:** Border transitions to 100% `primary` opacity with a 2px width.

### Data Chips (New)
*   **Status Chips:** Use `secondary-container` for "Draft," `primary-fixed` for "Processing," and `error-container` for "Rejected."
*   **Shape:** `full` (9999px) roundedness to contrast against the `md` roundedness of cards.

### The "Receipt Glass" (New Component)
A side-panel for receipt viewing that uses 90% opacity `surface-container-highest` with a backdrop blur of 20px, allowing the expense list to peek through behind the document.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `spacing-16` (3.5rem) for outer page margins to create an "Editorial" feel.
*   **Do** use `primary-fixed` (#c0e8ff) for subtle highlights in tables; it provides a professional "ink" feel against the cream background.
*   **Do** align all numerical data to the right to ensure decimal points line up for quick scanning.

### Don't
*   **Don't** use 100% black (#000000). Always use `on-surface` (#1d1c15) for text to maintain the sophisticated tonal palette.
*   **Don't** use `DEFAULT` (0.25rem) rounding for everything. Use `lg` (0.5rem) for main containers and `md` (0.375rem) for inner elements to create "nested rounding" harmony.
*   **Don't** use standard "Drop Shadows." If an element doesn't have a background shift, it should be flat.