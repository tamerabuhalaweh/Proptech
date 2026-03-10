# Design System Specification

> PropTech Platform — Saudi/MENA Property Management SaaS
> Version 1.0 | March 2026

---

## 1. Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#1E3A5F` | Primary actions, sidebar, headers |
| `--brand-primary-light` | `#2A4F7F` | Hover states on primary |
| `--brand-primary-dark` | `#152B47` | Active/pressed states |
| `--brand-accent` | `#D4A843` | CTAs, highlights, badges, premium |
| `--brand-accent-light` | `#E4C06A` | Hover on accent elements |
| `--brand-accent-dark` | `#B8912E` | Active on accent elements |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | `#16A34A` | `#22C55E` | Available units, paid status, positive KPIs |
| `--warning` | `#D97706` | `#F59E0B` | Pending, expiring leases, alerts |
| `--destructive` | `#DC2626` | `#EF4444` | Overdue, blocked units, delete actions |
| `--info` | `#2563EB` | `#3B82F6` | Informational badges, links |

### Unit Status Colors (PropTech-Specific)

| Status | Color | Hex | Token |
|--------|-------|-----|-------|
| Available | Green | `#16A34A` | `--unit-available` |
| Reserved | Amber | `#D97706` | `--unit-reserved` |
| Sold / Occupied | Blue | `#2563EB` | `--unit-sold` |
| Blocked | Red | `#DC2626` | `--unit-blocked` |
| Under Maintenance | Gray | `#6B7280` | `--unit-maintenance` |

### Lead Score Colors

| Score | Color | Token |
|-------|-------|-------|
| Hot (80-100) | `#DC2626` | `--lead-hot` |
| Warm (50-79) | `#D97706` | `--lead-warm` |
| Cold (0-49) | `#6B7280` | `--lead-cold` |

### Light Mode Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FFFFFF` | Page background |
| `--surface` | `#F8FAFC` | Cards, panels |
| `--surface-elevated` | `#FFFFFF` | Modals, dropdowns, popovers |
| `--muted` | `#F1F5F9` | Disabled backgrounds, secondary surfaces |
| `--border` | `#E2E8F0` | Card borders, dividers |
| `--border-strong` | `#CBD5E1` | Input borders, table borders |
| `--foreground` | `#0F172A` | Primary text |
| `--foreground-muted` | `#64748B` | Secondary text, placeholders |
| `--foreground-subtle` | `#94A3B8` | Tertiary text, captions |

### Dark Mode Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0B1120` | Page background |
| `--surface` | `#111827` | Cards, panels |
| `--surface-elevated` | `#1E293B` | Modals, dropdowns, popovers |
| `--muted` | `#1E293B` | Disabled backgrounds |
| `--border` | `#1E293B` | Card borders, dividers |
| `--border-strong` | `#334155` | Input borders |
| `--foreground` | `#F8FAFC` | Primary text |
| `--foreground-muted` | `#94A3B8` | Secondary text |
| `--foreground-subtle` | `#64748B` | Tertiary text |

### RTL Color Notes

- Colors are direction-agnostic; no RTL-specific overrides needed.
- Gradient directions should use logical keywords: `to inline-end` instead of `to right`.
- Focus ring offsets remain consistent regardless of direction.

---

## 2. Typography

### Font Families

```css
--font-latin: 'Inter', system-ui, -apple-system, sans-serif;
--font-arabic: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Loading Strategy

- **Inter**: Variable font, self-hosted, `font-display: swap`
- **IBM Plex Sans Arabic**: Weights 300, 400, 500, 600, 700. Self-hosted, `font-display: swap`
- Font selection is automatic via `lang` attribute on `<html>` element
- Use Tailwind `font-sans` class; CSS custom property switches based on `[lang="ar"]`

### Type Scale (4px baseline grid aligned)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-1` | 36px / 2.25rem | 44px / 2.75rem | 700 | Hero numbers (KPI values) |
| `display-2` | 30px / 1.875rem | 36px / 2.25rem | 700 | Page titles |
| `heading-1` | 24px / 1.5rem | 32px / 2rem | 600 | Section titles |
| `heading-2` | 20px / 1.25rem | 28px / 1.75rem | 600 | Card titles |
| `heading-3` | 16px / 1rem | 24px / 1.5rem | 600 | Subsection titles |
| `body-lg` | 16px / 1rem | 24px / 1.5rem | 400 | Prominent body text |
| `body` | 14px / 0.875rem | 20px / 1.25rem | 400 | Default body text |
| `body-sm` | 13px / 0.8125rem | 20px / 1.25rem | 400 | Secondary text |
| `caption` | 12px / 0.75rem | 16px / 1rem | 400 | Labels, timestamps |
| `overline` | 11px / 0.6875rem | 16px / 1rem | 600 | Category labels (uppercase Latin, normal Arabic) |

### Arabic Typography Adjustments

- Arabic text renders ~15-20% larger at the same font-size; no size reduction needed (Arabic fonts are designed for it).
- **Weight mapping**: Arabic `400` appears lighter than Latin `400`. Use Arabic `500` where Latin uses `400` for body text if visual parity is needed.
- **Letter spacing**: Remove all `letter-spacing` for Arabic (`[lang="ar"] { letter-spacing: 0 }`). Latin can use subtle tracking.
- **`text-transform: uppercase`**: Disable for Arabic (Arabic has no case). Use `[lang="ar"] .overline { text-transform: none }`.
- **Line height**: Arabic may need +4px line height for diacritics. Use `[lang="ar"] { line-height: calc(var(--line-height) + 0.25rem) }` on body text if needed.

### Number Rendering

- **Currency**: Always SAR with Western Arabic numerals (1234) for both languages.
- **Hijri dates**: Render with Arabic-Indic numerals (١٤٤٧/٠٩/١١) in Arabic locale, Western numerals in English.
- Format: `new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' })`.

---

## 3. Spacing System

### Base Unit: 4px

| Token | Value | Tailwind | Usage |
|-------|-------|---------|-------|
| `space-0.5` | 2px | `0.5` | Micro adjustments |
| `space-1` | 4px | `1` | Icon padding, tight gaps |
| `space-2` | 8px | `2` | Inline element spacing |
| `space-3` | 12px | `3` | Small component padding |
| `space-4` | 16px | `4` | Default component padding, card padding |
| `space-5` | 20px | `5` | Section spacing |
| `space-6` | 24px | `6` | Card internal spacing |
| `space-8` | 32px | `8` | Section gaps |
| `space-10` | 40px | `10` | Large section gaps |
| `space-12` | 48px | `12` | Page section spacing |
| `space-16` | 64px | `16` | Major layout gaps |
| `space-20` | 80px | `20` | Page-level spacing |

### Layout Spacing

| Context | Padding | Gap |
|---------|---------|-----|
| Page content area | `p-6` (24px) | — |
| Card | `p-4` to `p-6` | — |
| Card grid | — | `gap-4` to `gap-6` |
| Form fields | — | `gap-4` (16px vertical) |
| Sidebar | `px-3 py-4` | `gap-1` between items |
| Topbar | `px-6 py-3` | — |
| Table cells | `px-4 py-3` | — |
| Modal content | `p-6` | `gap-4` |

### RTL Spacing

- **Always use logical properties**: `ms-*` / `me-*` / `ps-*` / `pe-*` instead of `ml-*` / `mr-*` / `pl-*` / `pr-*`.
- Tailwind CSS 4 with the RTL plugin auto-flips `start`/`end` based on `dir` attribute.
- Inline margins/paddings automatically flip; block-axis values stay unchanged.

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small badges, chips |
| `--radius` | 6px | Buttons, inputs (default) |
| `--radius-md` | 8px | Cards, dropdowns |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Image containers, hero sections |
| `--radius-full` | 9999px | Avatars, circular badges |

---

## 5. Shadow & Elevation System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth (cards at rest) |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Card hover, raised buttons |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Modals, sheets |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Floating panels, toasts |

### Dark Mode Shadows

- Reduce opacity by ~40% in dark mode (shadows less visible on dark backgrounds).
- Add subtle border (`1px solid var(--border)`) on cards/modals in dark mode for separation.

### Elevation Layers (z-index)

| Layer | z-index | Usage |
|-------|---------|-------|
| Base | `0` | Page content |
| Raised | `10` | Sticky headers, floating buttons |
| Dropdown | `20` | Dropdowns, popovers, comboboxes |
| Overlay | `30` | Overlay backdrop |
| Modal | `40` | Modal dialogs, sheets |
| Toast | `50` | Toast notifications |
| Tooltip | `60` | Tooltips |

---

## 6. Component Variants

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| `primary` | `--brand-primary` | `white` | none | Main CTAs, save, confirm |
| `accent` | `--brand-accent` | `--brand-primary-dark` | none | Premium actions, upgrade |
| `secondary` | `--surface` | `--foreground` | `--border` | Secondary actions |
| `outline` | `transparent` | `--brand-primary` | `--brand-primary` | Tertiary actions |
| `ghost` | `transparent` | `--foreground-muted` | none | Icon buttons, inline actions |
| `destructive` | `--destructive` | `white` | none | Delete, cancel lease |
| `link` | `transparent` | `--brand-primary` | none | Inline links styled as buttons |

**Sizes**: `sm` (32px h), `default` (36px h), `lg` (44px h), `icon` (36×36px)

**States**: default → hover (+lightness) → focus (ring) → active (darker) → disabled (50% opacity)

### Inputs

| Variant | Usage |
|---------|-------|
| `default` | Standard text input with border |
| `filled` | Muted background, no border (search bars) |
| `error` | Red border + error message below |
| `with-icon` | Icon at inline-start (use `ps-10` for icon space) |
| `with-addon` | Text/button addon at inline-start or inline-end |

**Sizes**: `sm` (32px h), `default` (36px h), `lg` (44px h)

**Arabic input**: Support `inputMode` and `dir="auto"` for mixed content.

### Cards

| Variant | Usage |
|---------|-------|
| `default` | Standard card with border and subtle shadow |
| `elevated` | No border, `shadow-sm` |
| `interactive` | Hover shadow + pointer cursor (clickable cards) |
| `outlined` | Border only, no shadow or background |
| `stat` | KPI/metric card with large display number |
| `property` | Property listing card (image + details) |

### Tables

- Use shadcn/ui `<Table>` with custom styling.
- Sticky header (`sticky top-0 z-10`).
- Striped rows optional (`even:bg-muted/50`).
- Row hover: `hover:bg-muted`.
- Sortable columns: icon indicator at inline-end of header cell.
- Responsive: Horizontal scroll on mobile, or collapse to card layout.
- RTL: Use `text-start` for alignment. Currency/number columns use `text-end`.

### Modals / Dialogs

| Size | Max Width | Usage |
|------|----------|-------|
| `sm` | 400px | Confirmations, simple forms |
| `default` | 500px | Standard forms, details |
| `lg` | 640px | Complex forms, multi-step |
| `xl` | 800px | Data-heavy views, tables |
| `full` | 95vw / 95vh | Media galleries, inventory grids |

- Always include close button (X) at inline-end of header.
- Trap focus within modal.
- Close on Escape key.
- Overlay: `bg-black/50` with `backdrop-blur-sm`.

---

## 7. Icon System

### Library: Lucide Icons

- **Package**: `lucide-react`
- **Default size**: 16px for inline, 20px for buttons, 24px for nav items
- **Stroke width**: 1.5px (default Lucide)
- **Color**: Inherits `currentColor`

### Icon Categories for PropTech

| Category | Icons |
|----------|-------|
| Navigation | `LayoutDashboard`, `Building2`, `Users`, `Settings`, `Bell`, `Search` |
| Properties | `Building`, `Building2`, `Home`, `MapPin`, `Layers`, `Grid3X3` |
| Finance | `DollarSign` (use `Currency` for SAR), `CreditCard`, `Receipt`, `TrendingUp`, `TrendingDown` |
| Status | `CheckCircle`, `XCircle`, `AlertTriangle`, `Clock`, `Loader2` |
| Actions | `Plus`, `Edit`, `Trash2`, `Download`, `Upload`, `Filter`, `SortAsc`, `SortDesc` |
| Communication | `Mail`, `Phone`, `MessageSquare`, `Send` |
| Calendar | `Calendar`, `CalendarDays`, `CalendarCheck` |
| Users | `User`, `UserPlus`, `Users`, `Shield`, `Key` |

### RTL Icon Handling

- **Mirror these icons** in RTL: arrows (`ChevronRight` → `ChevronLeft`), `ExternalLink`, `Reply`, `Undo`, `Redo`, `ArrowRight`, `ArrowLeft`.
- **Do NOT mirror**: `Search`, `Phone`, `Check`, `X`, `Star`, `Heart`, `Clock`, media controls.
- Implementation: Use CSS `[dir="rtl"] .icon-directional { transform: scaleX(-1); }`.
- shadcn/ui CLI handles this automatically with the RTL transform.

---

## 8. Animation & Transition Guidelines

### Principles

1. **Purposeful**: Animations convey meaning (state change, spatial relationship), not decoration.
2. **Fast**: Max 200ms for micro-interactions, 300ms for layout transitions.
3. **Subtle**: Prefer opacity + transform over color/size animations.
4. **Accessible**: Respect `prefers-reduced-motion` — disable all non-essential animations.

### Transition Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--transition-fast` | 100ms | `ease-out` | Hover states, focus rings |
| `--transition-base` | 150ms | `ease-in-out` | Button presses, toggles |
| `--transition-moderate` | 200ms | `ease-in-out` | Dropdowns, popovers |
| `--transition-slow` | 300ms | `ease-in-out` | Modals, sheets, page transitions |

### Standard Animations

| Animation | Properties | Duration | Usage |
|-----------|-----------|----------|-------|
| Fade in | `opacity: 0→1` | 150ms | Tooltips, toasts |
| Slide in (from inline-end) | `translateX(100%→0)` | 300ms | Sheet/drawer open |
| Slide in (from bottom) | `translateY(16px→0) + opacity` | 200ms | Dropdowns, mobile sheets |
| Scale in | `scale(0.95→1) + opacity` | 200ms | Modals, popovers |
| Skeleton pulse | `opacity: 0.5→1→0.5` | 1.5s loop | Loading skeletons |
| Spin | `rotate(0→360deg)` | 600ms loop | Loading spinners |

### RTL Animation Notes

- **Slide-in direction flips automatically** when using logical transforms (`translateX` with `start/end` concept).
- Sidebar expand: Slides from `inline-start` (left in LTR, right in RTL).
- Sheet/drawer: Slides from `inline-end` (right in LTR, left in RTL).
- Use Radix UI's built-in animation direction support.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Breakpoints & Responsive Design

| Breakpoint | Min Width | Tailwind | Layout |
|-----------|-----------|---------|--------|
| Mobile | 0px | default | Single column, bottom nav |
| Tablet | 768px | `md:` | Two columns, collapsible sidebar |
| Desktop | 1024px | `lg:` | Full sidebar + content |
| Wide | 1280px | `xl:` | Extended content area |
| Ultra-wide | 1536px | `2xl:` | Max-width container centered |

### Layout Strategy

- **Mobile-first**: Base styles target mobile; add complexity with `md:` and `lg:`.
- **Max content width**: `1400px` centered, with `px-4` gutters on mobile, `px-6` on desktop.
- **Sidebar**: Hidden on mobile (hamburger toggle), collapsible icon-only on tablet, full on desktop.
- **Cards**: 1-col mobile → 2-col tablet → 3-4 col desktop.

---

## 10. Accessibility Standards (WCAG 2.1 AA)

### Color Contrast

- **Text on background**: Minimum 4.5:1 ratio for body text, 3:1 for large text (≥18px or ≥14px bold).
- **Interactive elements**: 3:1 contrast against adjacent colors.
- **Status colors**: Never rely on color alone; pair with icons or text labels.
- Verified: `#1E3A5F` on `#FFFFFF` = 10.4:1 ✅, `#D4A843` on `#1E3A5F` = 4.8:1 ✅.

### Focus Management

- Visible focus ring on all interactive elements: `ring-2 ring-brand-primary ring-offset-2`.
- Focus ring color adjusts for dark mode.
- Tab order follows visual layout (logical, not DOM order hacks).
- Trap focus in modals and drawers.

### Screen Reader Support

- All images: `alt` text or `aria-hidden="true"` for decorative.
- Icon-only buttons: `aria-label` required.
- Status badges: `role="status"` with descriptive `aria-label`.
- Live regions for notifications: `aria-live="polite"` for toasts, `aria-live="assertive"` for errors.
- Tables: Proper `<th scope="col|row">`, `<caption>`.
- Forms: `<label>` for every input, `aria-describedby` for help text, `aria-invalid` for errors.

### Keyboard Navigation

- All functionality accessible via keyboard.
- `Escape` closes modals, dropdowns, popovers.
- `Arrow keys` navigate within menus, comboboxes, grids.
- `Enter`/`Space` activate buttons and links.
- Skip-to-content link as first focusable element.

### RTL Accessibility

- `dir="rtl"` and `lang="ar"` on `<html>` element.
- Screen readers automatically handle RTL reading order.
- Ensure `aria-label` values are translated.

---

## 11. Tailwind CSS 4 Configuration

### CSS Variables Approach

All design tokens are defined as CSS custom properties in `globals.css` and referenced in `tailwind.config.ts`:

```css
@layer base {
  :root {
    --brand-primary: 30 58 95;       /* #1E3A5F */
    --brand-accent: 212 168 67;      /* #D4A843 */
    --background: 255 255 255;
    --foreground: 15 23 42;
    /* ... all tokens */
  }

  .dark {
    --background: 11 17 32;
    --foreground: 248 250 252;
    /* ... dark overrides */
  }
}
```

### Key Tailwind Plugins

1. **tailwindcss-rtl** — Logical property utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
2. **tailwindcss-animate** — Animation utilities for Radix/shadcn
3. **@tailwindcss/container-queries** — Container-based responsive design for cards/widgets

---

## 12. Internationalization (i18n) Rules

### Translation Keys

- No hardcoded strings in any component.
- Use `next-intl` or `react-i18next` with namespace-based keys.
- Key format: `namespace.section.key` (e.g., `dashboard.kpi.totalRevenue`).

### Number & Date Formatting

| Data Type | English (en-SA) | Arabic (ar-SA) |
|----------|-----------------|----------------|
| Currency | SAR 1,250,000 | ١٬٢٥٠٬٠٠٠ ر.س |
| Date (Gregorian) | Mar 10, 2026 | ١٠ مارس ٢٠٢٦ |
| Date (Hijri) | Sha'ban 11, 1447 | ١١ شعبان ١٤٤٧ |
| Percentage | 85.5% | ٪٨٥٫٥ |
| Phone | +966 50 123 4567 | +966 50 123 4567 |

### Calendar

- Support dual calendar display (Hijri primary in Arabic, Gregorian primary in English).
- Use `Intl.DateTimeFormat` with `calendar: 'islamic-umalqura'` for Hijri.
- Date pickers show both calendars with toggle.

---

## 13. File Structure (for implementation)

```
src/
├── styles/
│   ├── globals.css          # CSS variables, base styles
│   ├── fonts.ts             # Font configuration
│   └── theme.ts             # Theme utilities
├── components/
│   ├── ui/                  # shadcn/ui components (auto-generated)
│   ├── layout/              # Shell, Sidebar, Topbar
│   ├── property/            # PropertyCard, UnitGrid, etc.
│   ├── crm/                 # LeadCard, PipelineBoard, etc.
│   └── common/              # Shared: StatusBadge, KPICard, etc.
├── lib/
│   ├── i18n/                # Translation config + dictionaries
│   ├── utils.ts             # cn() helper, formatters
│   └── constants.ts         # Status enums, color maps
└── hooks/
    ├── use-direction.ts     # RTL/LTR hook
    ├── use-locale.ts        # Locale + calendar hook
    └── use-breakpoint.ts    # Responsive breakpoint hook
```
