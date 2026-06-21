# Design System — Leksikon.ai

**Version**: 1.0  
**Date**: 2026-04-24  
**Status**: Complete  
**Owner**: Engineer  

---

## Purpose

This document establishes the visual foundation for Leksikon.ai — color palette, typography, spacing scale, component patterns, and brand guidelines. The design system ensures consistency across all user-facing surfaces and serves as the reference for implementation.

---

## Brand Identity

### Positioning

Leksikon.ai is a trusted AI partner for Danish SMEs. The visual language must convey:

- **Professionalism**: Danish business standards, reliable, competent
- **Approachability**: Not cold enterprise — warm and accessible
- **Intelligence**: Modern AI-powered tool without being futuristic/sterile
- **Local trust**: Explicitly Danish identity (language, cultural awareness)

### Brand Personality

| Trait | Expression |
|-------|-----------|
| Trustworthy | Consistent, reliable, GDPR-conscious |
| Modern | Clean interfaces, current design trends |
| Accessible | Simple language, clear CTAs, no jargon |
| Danish | Local feel without being cliché |

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Deep Navy** | `#1a365d` | 26,54,93 | Primary brand color, headers, important text |
| **Clean White** | `#ffffff` | 255,255,255 | Backgrounds, cards, primary text on dark |
| **Sky Blue** | `#3b82f6` | 59,130,246 | Primary actions, links, interactive elements |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Success Green** | `#10b981` | 16,185,105 | Positive states, approvals, success messages |
| **Warning Amber** | `#f59e0b` | 245,158,11 | Warnings, pending states, attention needed |
| **Error Red** | `#ef4444` | 239,68,68 | Errors, destructive actions, validation failures |
| **Info Blue** | `#0ea5e9` | 14,165,233 | Informational messages, tips, neutral highlights |

### Neutral Scale

| Name | Hex | Usage |
|------|-----|-------|
| **Gray 50** | `#f9fafb` | Page background, subtle fills |
| **Gray 100** | `#f3f4f6` | Card backgrounds, hover states |
| **Gray 200** | `#e5e7eb` | Borders, dividers |
| **Gray 300** | `#d1d5db` | Disabled states, placeholder text |
| **Gray 400** | `#9ca3af` | Secondary text, icons |
| **Gray 500** | `#6b7280` | Body text, descriptions |
| **Gray 600** | `#4b5563` | Subheadings |
| **Gray 700** | `#374151` | Primary text (on light backgrounds) |
| **Gray 800** | `#1f2937` | Headers on light backgrounds |
| **Gray 900** | `#111827` | High contrast text, emphasis |

### Semantic Mapping

```css
/* Actions */
--color-primary: #3b82f6;      /* Sky Blue - primary CTAs */
--color-primary-hover: #2563eb; /* Darker blue on hover */
--color-primary-active: #1d4ed8;/* Active/pressed state */

/* Feedback */
--color-success: #10b981;       /* Green - approvals */
--color-warning: #f59e0b;       /* Amber - pending */
--color-error: #ef4444;          /* Red - errors */
--color-info: #0ea5e9;          /* Blue - informational */

/* Surfaces */
--color-surface: #ffffff;       /* White cards/backgrounds */
--color-surface-elevated: #f9fafb; /* Elevated surfaces */
--color-border: #e5e7eb;        /* Default borders */
--color-border-strong: #d1d5db;  /* Emphasized borders */

/* Text */
--color-text-primary: #1f2937;  /* Main content */
--color-text-secondary: #6b7280;/* Descriptions */
--color-text-tertiary: #9ca3af; /* Hints, timestamps */
--color-text-inverse: #ffffff;  /* Text on dark backgrounds */
```

---

## Typography

### Font Stack

```css
/* Primary: Inter - clean, professional, excellent readability */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Fallback chain: */
Inter → -apple-system → BlinkMacSystemFont → 'Segoe UI' → Roboto → 'Helvetica Neue' → Arial → sans-serif
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| **text-xs** | 12px | 16px (1.33) | 400 | Captions, timestamps, badges |
| **text-sm** | 14px | 20px (1.43) | 400 | Secondary text, descriptions |
| **text-base** | 16px | 24px (1.5) | 400 | Body text, default |
| **text-lg** | 18px | 28px (1.56) | 500 | Subheadings, emphasized body |
| **text-xl** | 20px | 28px (1.4) | 600 | Section headings |
| **text-2xl** | 24px | 32px (1.33) | 600 | Page titles |
| **text-3xl** | 30px | 36px (1.2) | 700 | Hero headlines |
| **text-4xl** | 36px | 40px (1.11) | 700 | Marketing headlines |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Subheadings, emphasized content |
| Semibold | 600 | Section headings, labels |
| Bold | 700 | Page titles, hero text |

### Usage Guidelines

- **Headers**: Use `font-semibold` (600) or `font-bold` (700), Deep Navy (#1a365d)
- **Body text**: Use `font-normal` (400), Gray 700 (#374151)
- **Buttons**: Use `font-medium` (500), ALL CAPS for primary actions
- **Links**: Use `text-primary` color, underline on hover
- **Danish characters**: Inter supports æ, ø, å correctly

---

## Spacing Scale

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| **space-0** | 0px | Reset spacing |
| **space-1** | 4px | Tight gaps, icon margins |
| **space-2** | 8px | Related elements |
| **space-3** | 12px | Internal component padding |
| **space-4** | 16px | Standard padding, gaps |
| **space-5** | 20px | Card padding |
| **space-6** | 24px | Section gaps |
| **space-8** | 32px | Major section separation |
| **space-10** | 40px | Page section margins |
| **space-12** | 48px | Large section breaks |
| **space-16** | 64px | Page margins (desktop) |

### Common Patterns

```css
/* Compact */
p-2 gap-2 /* Related elements */

/* Standard */
p-4 gap-4 /* Default card spacing */

/* Comfortable */
p-6 gap-6 /* Cards with more content */

/* Spacious */
p-8 gap-8 /* Section separation */
```

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
// Usage: Main actions (Approve, Send, Generate)
background: #3b82f6 (primary)
color: white
padding: 12px 24px (p-3 px-6)
border-radius: 8px (rounded-lg)
font-weight: 500
hover: #2563eb
active: #1d4ed8
disabled: opacity-50, cursor-not-allowed
```

#### Secondary Button
```tsx
// Usage: Secondary actions (Cancel, Edit Draft, Back)
background: white
color: #374151
border: 1px solid #e5e7eb
padding: 12px 24px
border-radius: 8px
hover: bg-gray-50
```

#### Ghost Button
```tsx
// Usage: Tertiary actions (View Details, Learn More)
background: transparent
color: #3b82f6
padding: 8px 16px
hover: text-decoration underline
```

#### Destructive Button
```tsx
// Usage: Irreversible actions (Delete, Remove)
background: #ef4444
color: white
padding: 12px 24px
border-radius: 8px
hover: bg-red-600
```

### Input Fields

#### Text Input
```tsx
// Standard text input
height: 40px (h-10)
padding: 0 12px (px-3)
border: 1px solid #e5e7eb
border-radius: 8px
font-size: 16px (prevents iOS zoom)
focus: ring-2 ring-primary/20, border-primary
error: border-error, ring-error/20
disabled: bg-gray-100, cursor-not-allowed
```

#### Textarea
```tsx
// Multi-line input
min-height: 120px
padding: 12px
border: 1px solid #e5e7eb
border-radius: 8px
focus: same as text input
resize: vertical
```

#### Select
```tsx
// Dropdown select
appearance: none
background: white url(chevron-down) no-repeat right-12
padding-right: 40px
 Same border/focus treatment as text input
```

### Cards

```tsx
// Standard card container
background: white
border: 1px solid #e5e7eb
border-radius: 12px (rounded-xl)
padding: space-5 (20px)
shadow: 0 1px 3px rgba(0,0,0,0.1) (shadow-sm)

// Elevated card
shadow: 0 4px 6px rgba(0,0,0,0.1) (shadow-md)

// Interactive card (clickable)
hover: shadow-md, border-primary/30
transition: all 0.2s ease
```

### Status Badges

| Status | Style |
|--------|-------|
| **Pending** | bg-amber-100 text-amber-800 |
| **Approved/Sent** | bg-emerald-100 text-emerald-800 |
| **Draft** | bg-gray-100 text-gray-700 |
| **Archived** | bg-gray-200 text-gray-500 |
| **Error** | bg-red-100 text-red-800 |

```tsx
// Badge component
padding: 4px 8px (py-1 px-2)
border-radius: 9999px (rounded-full)
font-size: 12px (text-xs)
font-weight: 500
```

### Navigation

#### Sidebar (Dashboard)
```tsx
width: 256px (w-64)
background: white
border-right: 1px solid #e5e7eb
padding: space-4
```

#### Top Bar
```tsx
height: 64px (h-16)
background: white
border-bottom: 1px solid #e5e7eb
padding: 0 space-6
```

### Empty States

```tsx
// Centered illustration + text + CTA
padding: space-12
text-align: center

// Elements
- Icon/illustration: 64px, gray-300
- Heading: text-xl font-semibold
- Description: text-sm text-secondary, max-w-sm mx-auto
- CTA button: primary style
```

---

## Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| **shadow-sm** | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation, inputs |
| **shadow-md** | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| **shadow-lg** | `0 10px 15px rgba(0,0,0,0.1)` | Modals, elevated cards |
| **shadow-xl** | `0 20px 25px rgba(0,0,0,0.1)` | Dialogs, popovers |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **rounded-sm** | 4px | Badges, small elements |
| **rounded** | 8px | Buttons, inputs, cards |
| **rounded-lg** | 12px | Larger cards, modals |
| **rounded-xl** | 16px | Featured cards, containers |
| **rounded-full** | 9999px | Pills, avatars, badges |

---

## Animation & Motion

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| **duration-fast** | 150ms | Hover states, small transitions |
| **duration-normal** | 200ms | Standard transitions |
| **duration-slow** | 300ms | Page transitions, modals |

### Easing

```css
ease-out: cubic-bezier(0, 0, 0.2, 1)     /* Decelerate */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* Standard */
ease-in: cubic-bezier(0.4, 0, 1, 1)       /* Accelerate */
```

### Usage Guidelines

- **Hover effects**: 150ms ease-out
- **Page transitions**: 200ms ease-in-out
- **Modals/dialogs**: 300ms ease-out
- **Loading states**: Pulse animation, 2s infinite
- **Focus rings**: 150ms transition

---

## Responsive Breakpoints

| Breakpoint | Value | Usage |
|------------|-------|-------|
| **sm** | 640px | Large phones, small tablets |
| **md** | 768px | Tablets |
| **lg** | 1024px | Laptops |
| **xl** | 1280px | Desktops |
| **2xl** | 1536px | Large screens |

### Container

```tsx
// Standard page container
max-width: 1280px (max-w-7xl)
padding: 0 24px (px-6)
margin: 0 auto

// Narrow content (forms, auth)
max-width: 480px (max-w-sm)
```

---

## Accessibility

### Color Contrast

- **Text on white**: Minimum 4.5:1 (WCAG AA)
- **Large text on white**: Minimum 3:1
- **Text on dark backgrounds**: Minimum 4.5:1

### Focus States

```tsx
// All interactive elements must have visible focus
:focus-visible: {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// Use ring for larger elements
focus: ring-2 ring-primary ring-offset-2
```

### Hit Targets

- Minimum touch target: 44x44px
- Minimum click target: 24x24px (spacing between)

---

## Implementation Notes

### Tailwind Configuration

```typescript
// tailwind.config.ts - extend with design tokens
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        hover: '#2563eb',
        active: '#1d4ed8',
      },
      brand: {
        navy: '#1a365d',
        sky: '#3b82f6',
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fontFamily: {
      sans: ['Inter', '...fallback'],
    },
    spacing: {
      '18': '4.5rem',
      '22': '5.5rem',
    },
  },
}
```

### CSS Variables (for runtime theming)

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-surface: #ffffff;
  --color-surface-elevated: #f9fafb;
  --color-border: #e5e7eb;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

## Checklist for Implementation

- [ ] Update `tailwind.config.ts` with custom colors
- [ ] Add Inter font to app layout
- [ ] Create `src/components/ui/` with base components:
  - [ ] Button (primary, secondary, ghost, destructive)
  - [ ] Input (text, textarea, select)
  - [ ] Card
  - [ ] Badge (status variants)
  - [ ] Container
- [ ] Document component usage in Storybook (future)
- [ ] Create page templates (auth, dashboard, settings)

---

*Document maintained by Engineer | Leksikon.ai*