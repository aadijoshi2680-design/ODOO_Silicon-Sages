# 🎬 Animation Deep-Dive Guide
## Reimbursement Management System

> Every animation explained — what it is, how it works, full code

---

## 📋 What's Inside This Guide

| # | Animation | Effort | Used When |
|---|-----------|--------|-----------|
| 1 | Expense Submit → Send Animation | ⭐ Easy | Employee clicks Submit |
| 2 | 60% Approval Burst + Confetti | ⭐ Easy | Threshold crossed, auto-approve fires |
| 3 | OCR Scan Line + Typewriter Fill | ⭐⭐ Medium | Receipt image uploaded |
| 4 | Approval Pipeline Step Flow | ⭐⭐ Medium | Expense enters multi-step approval |
| 5 | Currency Conversion Counter | ⭐ Easy | Employee types foreign currency amount |
| 6 | Approve Checkmark Draw | ⭐ Easy | Manager clicks Approve |
| 7 | Reject Cross Slash | ⭐ Easy | Manager clicks Reject |
| 8 | Notification Bell Ring | ⭐ Easy | New approval request received |
| 9 | Skeleton Shimmer Loader | ⭐ Easy | Data is being fetched |
| 10 | Role Badge Flip | ⭐ Easy | Admin changes a user's role |
| 11 | Stats Counter Roll-up | ⭐ Easy | Dashboard loads |
| 12 | CFO Override Gold Star Burst | ⭐⭐⭐ Hard | Specific approver triggers auto-approve |
| 13 | Manager Link Draw | ⭐⭐ Medium | Manager assigned to employee |
| 14 | Percentage Fill Bar | ⭐⭐ Medium | Each approver votes |
| 15 | Form Field Validation Shake | ⭐ Easy | Invalid field on submit |

---

## Animation 1 — Expense Submit → Send ✉️

### 🎯 What this communicates

When the employee clicks Submit, the expense should visually travel to the manager.
This removes uncertainty — instead of just a toast 'Submitted!', the user sees WHERE their expense went.

### How it looks — Frame by Frame

| # | Frame | Description |
|---|-------|-------------|
| 1 | Frame 0 (start) | Full expense form is visible on screen. Submit button is green. |
| 2 | 0–200ms (shrink) | The form card shrinks down to ~10% of its size using CSS `scale()`. It morphs into a small envelope icon at the center of the card. |
| 3 | 200–700ms (fly) | The miniature envelope slides diagonally up-right across the screen toward a manager avatar in the top-right corner. A short motion trail fades behind it. |
| 4 | 700–900ms (land) | The envelope arrives at the manager avatar. The avatar 'catches' it with a brief scale bounce (1 → 1.2 → 1). |
| 5 | 900ms+ (confirm) | Avatar returns to normal size. Toast appears: 'Sent to Manager: John Doe ✓'. Form resets or navigates away. |

### Full Code — React + Framer Motion

```jsx
// ExpenseForm.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ExpenseForm({ managerAvatarRef }) {
  const [phase, setPhase] = useState('idle');
  // phase: 'idle' | 'shrinking' | 'flying' | 'done'

  const handleSubmit = async () => {
    setPhase('shrinking');
    await sleep(300);
    setPhase('flying');
    await sleep(700);
    setPhase('done');
    // call your API here
    await submitExpenseAPI(formData);
  };

  const managerPos = managerAvatarRef.current?.getBoundingClientRect();

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className='expense-card'
          animate={
            phase === 'shrinking'
              ? { scale: 0.15, opacity: 0.8, borderRadius: 40 }
              : phase === 'flying'
              ? {
                  scale: 0.1,
                  x: managerPos?.left - window.innerWidth / 2,
                  y: -(window.innerHeight / 2 - managerPos?.top),
                  opacity: 0,
                }
              : { scale: 1, x: 0, y: 0, opacity: 1 }
          }
          transition={
            phase === 'flying'
              ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
              : { duration: 0.3, ease: 'easeIn' }
          }
        >
          {/* form fields */}
          <button onClick={handleSubmit}>Submit Expense</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
```

### CSS-only alternative (no library needed)

```css
/* styles.css */
@keyframes sendToManager {
  0%   { transform: scale(1) translate(0, 0) rotate(0deg); opacity: 1; }
  30%  { transform: scale(0.3) translate(0, 0) rotate(-5deg); opacity: 0.9; }
  100% { transform: scale(0.05) translate(280px, -200px) rotate(15deg); opacity: 0; }
}

.expense-card.sending {
  animation: sendToManager 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes managerReceive {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.25); box-shadow: 0 0 20px #6D28D9; }
  100% { transform: scale(1); }
}
.manager-avatar.receiving {
  animation: managerReceive 0.4s ease-out;
}
```

### Animation Properties

| Property | Value | Reason |
|----------|-------|--------|
| duration | 0.9s | Fast enough to feel instant, visible enough to understand |
| easing | `cubic-bezier(0.4,0,0.2,1)` | Material Design 'standard' easing — natural acceleration |
| scale end | 0.05 | Tiny so it looks like it truly 'arrived' at the small avatar |
| rotate | -5 → 15deg | Slight tilt makes it feel physical, like a paper sliding |

> 💡 If the manager avatar is not visible on screen (e.g., on mobile), animate toward the top-right corner of the viewport instead and add 'Sent to John Doe ✓' toast.

---

## Animation 2 — 60% Approval Burst + Confetti 🎉

### 🎯 What this communicates

When a conditional approval rule fires (e.g., 60% of approvers have approved), the system auto-approves. This is invisible logic — the animation makes it visible and celebratory.
Without this, the user just sees 'Status: Approved' with no drama. With it, they see the threshold being crossed in real time.

### How it looks — Frame by Frame

| # | Frame | Description |
|---|-------|-------------|
| 1 | Each vote comes in | SVG ring progress increases. Ring color shifts: yellow (0–40%) → orange (40–59%) → green (60%+). Percentage label counts up in the center. |
| 2 | Ring hits 60% | Ring completes its arc (dash-offset = 0). Ring pulses once (scale 1 → 1.08 → 1). |
| 3 | Burst (0–200ms) | Confetti particles explode outward from the ring center. 80–120 pieces, 6 colours, spread 360 degrees. |
| 4 | Status flip (200ms) | The expense status badge flips on its Y axis (rotateY 0 → 90° → 0°). Text changes mid-flip from 'Pending' to 'Approved'. |
| 5 | Card glow (500ms) | Card border flashes purple → green. Background transitions from white → `#F0FDF4` (light green) over 400ms. |
| 6 | Toast (600ms) | Toast slides in: 'Auto-approved — 60% threshold reached ✓'. |

### SVG Progress Ring — Full Code

```jsx
// ApprovalProgressRing.jsx
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';  // npm i canvas-confetti

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;  // ≈ 339.3

function getColor(pct) {
  if (pct < 40) return '#F59E0B';  // yellow
  if (pct < 60) return '#F97316';  // orange
  return '#10B981';                // green
}

export default function ApprovalProgressRing({ approvedCount, totalCount, threshold = 60 }) {
  const pct = Math.round((approvedCount / totalCount) * 100);
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const color = getColor(pct);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (pct >= threshold && !burst) {
      setBurst(true);
      fireConfetti();
    }
  }, [pct]);

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width='120' height='120' viewBox='0 0 120 120'>
        {/* background track */}
        <circle cx='60' cy='60' r={RADIUS} fill='none'
          stroke='#E5E7EB' strokeWidth='10' />
        {/* progress arc */}
        <circle cx='60' cy='60' r={RADIUS} fill='none'
          stroke={color} strokeWidth='10'
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap='round'
          transform='rotate(-90 60 60)'
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
        {/* percentage label */}
        <text x='60' y='65' textAnchor='middle'
          fontSize='20' fontWeight='bold' fill={color}>{pct}%</text>
      </svg>
    </div>
  );
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#6D28D9','#10B981','#F59E0B','#EF4444','#3B82F6','#EC4899'],
    ticks: 200,
  });
}
```

### Status Badge Flip

```css
/* badge-flip.css */
.badge {
  transition: transform 0.4s ease, background-color 0.4s ease;
  transform-style: preserve-3d;
}

/* Trigger this class when approved */
.badge.flipping {
  animation: badgeFlip 0.5s ease forwards;
}

@keyframes badgeFlip {
  0%   { transform: rotateY(0deg); background: #FEF3C7; color: #92400E; }
  49%  { transform: rotateY(90deg); }
  50%  { content: 'Approved'; background: #D1FAE5; color: #065F46; }
  100% { transform: rotateY(0deg); background: #D1FAE5; color: #065F46; }
}
```

> 💡 `canvas-confetti` is only 3KB. The ring uses pure SVG — zero extra dependencies needed.

---

## Animation 3 — OCR Scan Line + Typewriter Fill 📸

### 🎯 What this communicates

When an employee uploads a receipt image, OCR reads it. The scan animation makes the AI 'reading' feel tangible instead of just a spinner. Watching fields fill themselves builds trust in the auto-extracted data.

### How it looks — Frame by Frame

| # | Frame | Description |
|---|-------|-------------|
| 1 | Upload complete | Receipt image appears on the left side of the form. A thin green horizontal line appears at the very top of the image. |
| 2 | Scan (0–1200ms) | The green line sweeps from top to bottom of the image at constant speed. A faint green glow follows the line. Image has a subtle overlay darkening to suggest 'scanning'. |
| 3 | Line exits (1200ms) | Line reaches the bottom and disappears. Image brightens back to normal. |
| 4 | Field fill (1200ms–2s) | Each form field fills character by character (typewriter effect) in sequence: Amount → Date → Category → Description. Cursor blinks in each field as it types. |
| 5 | Done (2s+) | All fields populated. A green 'OCR Complete' badge fades in. User can edit any field if needed. |

### Full Code

```jsx
// OcrReceiptUpload.jsx
import { useState, useRef } from 'react';

export default function OcrReceiptUpload({ onExtracted }) {
  const [scanning, setScanning] = useState(false);
  const [scanY, setScanY] = useState(0);
  const [fields, setFields] = useState({ amount:'', date:'', category:'', description:'' });

  const handleUpload = async (file) => {
    setScanning(true);
    setScanY(0);

    // Animate the scan line 0 → 100% over 1200ms
    let start = null;
    const DURATION = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / DURATION * 100, 100);
      setScanY(pct);
      if (pct < 100) requestAnimationFrame(animate);
      else afterScan(file);
    };
    requestAnimationFrame(animate);
  };

  const afterScan = async (file) => {
    setScanning(false);
    const data = await callOcrApi(file);   // your OCR endpoint
    // Typewriter fill each field one by one
    await typewriterFill('amount',    data.amount);
    await typewriterFill('date',      data.date);
    await typewriterFill('category',  data.category);
    await typewriterFill('description', data.description);
    onExtracted(data);
  };

  const typewriterFill = (field, value) => new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      setFields(prev => ({ ...prev, [field]: value.slice(0, i + 1) }));
      i++;
      if (i >= value.length) { clearInterval(interval); resolve(); }
    }, 35);  // 35ms per character = natural typing speed
  });

  return (
    <div style={{ position:'relative', display:'inline-block' }}>
      <img src={previewUrl} alt='Receipt' style={{ width:300 }} />
      {scanning && (
        <div style={{
          position:'absolute', left:0, top:`${scanY}%`,
          width:'100%', height:3,
          background:'#10B981',
          boxShadow:'0 0 12px #10B981',
          transition:'top 0.016s linear',
        }} />
      )}
    </div>
  );
}
```

> 💡 Set typewriter speed to **35ms/character** for natural feel. Too fast (<20ms) looks fake; too slow (>80ms) is annoying.

> ⚠️ Ensure OCR is called **AFTER** scan animation starts, not before. Users should see the 'scanning' before results appear, even if OCR returns instantly.

---

## Animation 4 — Approval Pipeline Step Flow ➡️

### 🎯 What this communicates

Multi-step approvals (Manager → Finance → Director) are confusing without a visual. The pipeline animation shows exactly where the expense is in the chain, who's next, and how far along it is.

### How it looks — Frame by Frame

| # | Frame | Description |
|---|-------|-------------|
| 1 | Expense submitted | A horizontal stepper appears with 3 nodes: Manager (active, glowing purple) → Finance (grey) → Director (grey). Connecting lines are grey. |
| 2 | Manager approves | Manager node turns green with a checkmark. The connecting line between Manager and Finance animates: a purple line draws itself left-to-right in 400ms. Finance node lights up purple (active). |
| 3 | Finance approves | Same as above — Finance goes green, line draws to Director, Director activates. |
| 4 | Final approval | Director approves. All nodes are green. A celebratory pulse ripples across all nodes simultaneously. Status: 'Fully Approved'. |

### Full Code

```jsx
// ApprovalPipeline.jsx
// Steps: array of { label, status } where status = 'pending'|'active'|'approved'|'rejected'

const statusStyles = {
  pending:  { bg: '#E5E7EB', text: '#6B7280', border: '#D1D5DB' },
  active:   { bg: '#EDE9FE', text: '#6D28D9', border: '#7C3AED' },
  approved: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
};

export default function ApprovalPipeline({ steps }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center' }}>

          {/* Node circle */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: statusStyles[step.status].bg,
            border: `3px solid ${statusStyles[step.status].border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            // Pulse animation for 'active' node
            animation: step.status === 'active' ? 'pulse 1.5s infinite' : 'none',
            transition: 'all 0.4s ease',
          }}>
            {step.status === 'approved' ? '✓' : step.label[0]}
          </div>

          {/* Connecting line (not after last node) */}
          {i < steps.length - 1 && (
            <div style={{ position:'relative', width:80, height:4, background:'#E5E7EB' }}>
              <div style={{
                position:'absolute', top:0, left:0, height:'100%',
                background:'#7C3AED',
                // Width goes from 0% to 100% when PREVIOUS step is approved
                width: steps[i].status === 'approved' ? '100%' : '0%',
                transition: 'width 0.5s ease-in-out',
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

```css
/* Add to CSS */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(109, 40, 217, 0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(109, 40, 217, 0); }
}
```

---

## Animation 5 — Currency Conversion Counter 💱

### 🎯 What this communicates

Employees submit expenses in any currency. When they type an amount, the equivalent in the company's default currency should update in real time — and animate like an odometer so the user actually notices the change.

### Full Code

```jsx
// CurrencyCounter.jsx
import { useEffect, useState, useRef } from 'react';

function useAnimatedNumber(target, duration = 500) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = display;
    startTimeRef.current = null;
    cancelAnimationFrame(rafRef.current);

    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startRef.current + (target - startRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
}

export default function CurrencyInput({ baseCurrency, companyCurrency, rate }) {
  const [amount, setAmount] = useState('');
  const converted = parseFloat(amount || 0) * rate;
  const animatedConverted = useAnimatedNumber(converted);

  return (
    <div>
      <input value={amount} onChange={e => setAmount(e.target.value)}
        placeholder={`Amount in ${baseCurrency}`} type='number' />
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
        ≈ {companyCurrency} {animatedConverted.toFixed(2)}
      </div>
    </div>
  );
}
```

---

## Animations 6 & 7 — Approve Checkmark Draw & Reject Slash ✅❌

### 🎯 What this communicates

Every approve/reject action should feel deliberate and satisfying — not just a button click. The SVG path animation makes it feel like the manager is physically signing or crossing out the expense.

### Approve — SVG Checkmark Draw

```html
<!-- ApproveIcon.svg animation -->
<svg viewBox='0 0 52 52' width='52' height='52'>
  <circle cx='26' cy='26' r='25' fill='#D1FAE5' stroke='#10B981' strokeWidth='2'/>
  <path d='M14 27 L22 35 L38 17'
    fill='none' stroke='#10B981' strokeWidth='3'
    strokeLinecap='round' strokeLinejoin='round'
    stroke-dasharray='40'
    stroke-dashoffset='40'
    style='animation: drawCheck 0.5s ease forwards 0.1s'>
  </path>
</svg>
```

```css
@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}
```

### Reject — Cross Slash + Card Grey-out

```css
@keyframes drawX1 {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0;  }
}
@keyframes drawX2 {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0;  }
}

/* React component: on reject, add class 'rejected' to the expense card */
.expense-card.rejected {
  transition: background-color 0.4s ease, filter 0.4s ease;
  background-color: #FEF2F2;
  filter: grayscale(60%);
  border-color: #EF4444;
}

/* Card also tilts slightly then straightens */
@keyframes rejectTilt {
  0%   { transform: rotate(0deg);   }
  30%  { transform: rotate(-2.5deg);  }
  60%  { transform: rotate(1deg);   }
  100% { transform: rotate(0deg);   }
}
.expense-card.rejected { animation: rejectTilt 0.4s ease; }
```

---

## Animation 8 — Notification Bell Ring 🔔

```css
@keyframes bellRing {
  0%,100% { transform: rotate(0deg);       }
  10%     { transform: rotate(14deg);      }
  30%     { transform: rotate(-12deg);     }
  50%     { transform: rotate(10deg);      }
  70%     { transform: rotate(-8deg);      }
  90%     { transform: rotate(5deg);       }
}
.bell-icon.ringing {
  animation: bellRing 0.7s ease;
  transform-origin: top center;
}
```

```javascript
/* Trigger 'ringing' class whenever a new approval request arrives */
/* Remove class after animation ends so it can ring again */
bell.addEventListener('animationend', () => bell.classList.remove('ringing'));
```

---

## Animation 9 — Skeleton Shimmer Loader ⏳

```css
/* Skeleton shimmer — pure CSS, no JS needed */
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
```

```html
<!-- Usage: replace real content with skeleton divs while loading -->
<div class='skeleton' style='height:20px; width:60%; margin-bottom:8px'></div>
<div class='skeleton' style='height:20px; width:40%;'></div>
```

---

## Animation 10 — Role Badge Flip 👤

```css
/* When admin changes role, badge flips and shows new role */
.role-badge {
  display: inline-block;
  perspective: 600px;
}

@keyframes badgeFlip {
  0%  { transform: rotateY(0deg); }
  49% { transform: rotateY(90deg); }
  /* JS changes the text + colour at 50% */
  50% { transform: rotateY(90deg); }
  100%{ transform: rotateY(0deg); }
}
.role-badge.flipping { animation: badgeFlip 0.5s ease; }
```

```javascript
// JS: change label at the midpoint
badge.classList.add('flipping');
setTimeout(() => {
  badge.textContent = newRole;
  badge.className = `role-badge role-${newRole.toLowerCase()}`;
}, 250);  // halfway through 500ms
badge.addEventListener('animationend', () => badge.classList.remove('flipping'));
```

---

## Animation 11 — Dashboard Stats Counter Roll-up 📈

```jsx
// CountUp.jsx — reusable animated number counter
import { useEffect, useState } from 'react';

export function CountUp({ end, duration = 1200, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      const eased = progress * (2 - progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Usage on Dashboard
<CountUp end={247} prefix='₹' suffix=' total claims' />
<CountUp end={89}  suffix='% approval rate' />
<CountUp end={12}  suffix=' pending' />
```

---

## Animation 12 — CFO Override Gold Star Burst ⭐

### 🎯 What this communicates

When the specific approver rule fires (e.g., CFO approves → auto-approved), it is a powerful and special event. A gold star burst from the CFO's avatar makes this feel like a VIP override.

### How it looks

| # | Frame | Description |
|---|-------|-------------|
| 1 | CFO approves | CFO avatar glows gold. 12 gold star particles burst radially outward from the avatar, traveling 100px in 0.6s before fading. |
| 2 | Chain reaction | All other pending approver nodes simultaneously grey out with a 'skipped' strikethrough label. |
| 3 | Status change | Expense status jumps directly to 'Approved' with a scale bounce (0.8 → 1.1 → 1.0). |

### Full Code

```jsx
// GoldStarBurst.jsx — Canvas particle burst
function fireGoldBurst(originElement) {
  const rect = originElement.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 16 }, (_, i) => ({
    angle: (i / 16) * Math.PI * 2,
    distance: 0,
    size: Math.random() * 8 + 6,
    opacity: 1,
  }));

  let start = null;
  const animate = (ts) => {
    if (!start) start = ts;
    const t = (ts - start) / 600;  // 0 to 1 over 600ms
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      const d = t * 100;  // travel 100px
      const x = cx + Math.cos(p.angle) * d;
      const y = cy + Math.sin(p.angle) * d;
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.fillStyle = '#F59E0B';
      ctx.font = `${p.size}px serif`;
      ctx.fillText('★', x, y);
    });

    if (t < 1) requestAnimationFrame(animate);
    else canvas.remove();
  };
  requestAnimationFrame(animate);
}
```

---

## Animation 13 — Manager Link Draw in Org Chart 🔗

```html
<!-- Pure CSS SVG line draw — connects employee to manager -->
<svg>
  <line x1='50' y1='50' x2='200' y2='150'
    stroke='#7C3AED' stroke-width='2' stroke-dasharray='200'
    stroke-dashoffset='200'
    style='animation: drawLine 0.6s ease forwards'>
  </line>
</svg>
```

```css
@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

/* After line draws, both avatars pulse once */
@keyframes avatarPulse {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.15); box-shadow: 0 0 12px #7C3AED; }
}
.avatar.just-linked { animation: avatarPulse 0.4s ease 0.6s; }
```

---

## Animation 14 — Percentage Fill Bar 📊

```css
/* Animated fill bar that changes colour at threshold */
.approval-bar-track {
  width: 100%; height: 12px;
  background: #E5E7EB; border-radius: 999px; overflow: hidden;
}
.approval-bar-fill {
  height: 100%; border-radius: 999px;
  transition: width 0.5s ease, background-color 0.4s ease;
}
```

```javascript
/* JS: update width and colour based on percentage */
function updateBar(pct) {
  fill.style.width = pct + '%';
  if (pct < 40)      fill.style.background = '#F59E0B'; // yellow
  else if (pct < 60) fill.style.background = '#F97316'; // orange
  else               fill.style.background = '#10B981'; // green
  label.textContent = pct + '%';
}
```

---

## Animation 15 — Form Field Validation Shake ⚠️

```css
/* Classic 'wrong password' shake for invalid fields */
@keyframes shake {
  0%, 100% { transform: translateX(0);    }
  15%      { transform: translateX(-8px);  }
  30%      { transform: translateX(8px);   }
  45%      { transform: translateX(-6px);  }
  60%      { transform: translateX(6px);   }
  75%      { transform: translateX(-4px);  }
  90%      { transform: translateX(4px);   }
}

.form-field.invalid {
  animation: shake 0.5s ease;
  border-color: #EF4444 !important;
  background-color: #FEF2F2;
}
```

```javascript
// JS: apply then remove so it can shake again on resubmit
field.classList.add('invalid');
field.addEventListener('animationend', () => {
  field.classList.remove('invalid');  // re-enable future shakes
}, { once: true });
```

---

## Accessibility — Always Add This ♿

### Why this matters

Some users have vestibular disorders where motion causes nausea, dizziness, or headaches. The `prefers-reduced-motion` media query lets them disable animations via OS settings. Adding this is a 5-minute task that protects all users.

```css
/* Add this ONCE at the top of your global CSS */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
}
```

```jsx
/* For Framer Motion: use the useReducedMotion hook */
import { useReducedMotion } from 'framer-motion';

function MyComponent() {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      animate={{ x: shouldReduce ? 0 : 100 }}
    />
  );
}
```

---

*Reimbursement Management System · Animation Deep-Dive Guide · v2.0 · All animations include copy-paste ready code*
