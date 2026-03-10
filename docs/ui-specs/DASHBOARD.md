# Dashboard Page Specification

> Main dashboard — KPIs, charts, recent activity, quick actions
> Route: `/dashboard`

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ "Dashboard"          │ Date Range Picker │ Export │ ⚙️    ││
│ │ "Welcome back, Ahmed" │ [Last 30 days ▾] │        │       ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ KPI Cards Row (4 columns)                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Total    │ │ Occupancy│ │ Revenue  │ │ Active   │        │
│ │ Properties│ │ Rate    │ │ (MTD)    │ │ Leads    │        │
│ │ 24       │ │ 87.5%   │ │ SAR 2.4M │ │ 156      │        │
│ │ ↑2 this  │ │ ↑3.2%   │ │ ↑12%     │ │ ↑24 new  │        │
│ │ month    │ │ vs last  │ │ vs last  │ │ this week│        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│ Main Charts Row (2 columns: 60/40 split)                     │
│ ┌───────────────────────────┐ ┌────────────────────┐        │
│ │ Revenue Trend             │ │ Unit Status         │        │
│ │ [Line chart]              │ │ [Donut chart]       │        │
│ │ ───────────────           │ │     ◉ Available 45  │        │
│ │ /     \    /              │ │     ◉ Reserved 23   │        │
│ │/       \  /               │ │     ◉ Sold 180      │        │
│ │         \/                │ │     ◉ Blocked 12    │        │
│ │ [Monthly | Quarterly]     │ │                     │        │
│ └───────────────────────────┘ └────────────────────┘        │
│                                                              │
│ Secondary Row (2 columns: 50/50)                             │
│ ┌───────────────────────────┐ ┌────────────────────┐        │
│ │ Recent Activity           │ │ Quick Actions       │        │
│ │ ─────────────────         │ │ ──────────────      │        │
│ │ 🔵 Lead assigned          │ │ [+ Add Property]    │        │
│ │    Ahmed → Villa #12      │ │ [+ New Lead]        │        │
│ │    2 min ago              │ │ [📄 Generate Report]│        │
│ │ 🟢 Payment received       │ │ [📋 View Inventory] │        │
│ │    SAR 45,000 - Unit 3B   │ │                     │        │
│ │    15 min ago             │ │ Upcoming             │        │
│ │ 🟡 Lease expiring         │ │ ──────────────      │        │
│ │    Unit 7A - in 30 days   │ │ 📅 3 lease renewals  │        │
│ │    1 hour ago             │ │    due this week     │        │
│ │ 🔴 Maintenance overdue    │ │ 📅 5 property visits │        │
│ │    AC repair - Bldg 2     │ │    scheduled today   │        │
│ │    3 hours ago            │ │                     │        │
│ │ [View all activity →]     │ │                     │        │
│ └───────────────────────────┘ └────────────────────┘        │
│                                                              │
│ Properties Overview Row (full width)                         │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Top Properties by Revenue           [View All →]          ││
│ │ ┌─────────────────────────────────────────────────────┐   ││
│ │ │ Property │ Units │ Occupancy │ Revenue │ Trend      │   ││
│ │ │──────────│───────│───────────│─────────│────────────│   ││
│ │ │ Al Noor  │ 120   │ 92%      │ SAR 890K│ ↑ 5%       │   ││
│ │ │ Riyadh   │ 85    │ 88%      │ SAR 650K│ ↑ 3%       │   ││
│ │ │ Tower    │       │          │         │            │   ││
│ │ │ Jeddah   │ 64    │ 78%      │ SAR 420K│ ↓ 2%       │   ││
│ │ │ Plaza    │       │          │         │            │   ││
│ │ └─────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)

- KPI cards: 2×2 grid
- Charts: Stacked full-width (revenue above, donut below)
- Activity + Quick Actions: Stacked full-width
- Properties table: Horizontal scroll or card layout

### Mobile (<768px)

- KPI cards: Horizontal scroll (swipeable row) or 2×2 compact grid
- Charts: Full-width stacked, simplified (smaller labels)
- Activity: Full-width list
- Quick Actions: 2×2 icon grid (compact)
- Properties: Card layout (one per row)

---

## 2. Component Breakdown

### 2.1 Page Header

**Components**: `heading-1`, `body-sm`, custom `DateRangePicker`, `Button`, `DropdownMenu`

- Title: "Dashboard" (`heading-1`)
- Subtitle: "Welcome back, {name}" or greeting based on time of day (`body-sm`, `--foreground-muted`)
- Date range picker: Uses shadcn `Popover` + `Calendar` with Hijri support
- Export button: `Button variant="outline"` with `Download` icon
- Settings: `Button variant="ghost"` icon button for dashboard customization

### 2.2 KPI Cards Row

**Components**: Custom `KPICard` (extends shadcn `Card`)

Each card contains:
- **Icon**: Lucide icon in a tinted circular background
- **Label**: `caption` size, `--foreground-muted`
- **Value**: `display-1` size, `--foreground`
- **Trend indicator**: Arrow icon + percentage + "vs last period" text
  - Green `↑` for positive, Red `↓` for negative, Gray `→` for neutral
- **Sparkline** (optional): Tiny inline chart showing 7-day trend

Cards:

| KPI | Icon | Format |
|-----|------|--------|
| Total Properties | `Building2` | Integer |
| Occupancy Rate | `PieChart` | Percentage |
| Revenue (MTD) | `TrendingUp` | SAR currency |
| Active Leads | `Users` | Integer + "new this week" |

### 2.3 Revenue Trend Chart

**Components**: Custom chart wrapper using Recharts or Chart.js

- **Type**: Area/line chart with gradient fill
- **X-axis**: Months (Hijri or Gregorian based on locale)
- **Y-axis**: Revenue in SAR (abbreviated: 500K, 1M, 1.5M)
- **Toggle**: Monthly / Quarterly view tabs
- **Tooltip**: Hover shows exact value + date
- **Color**: Primary gradient (`--brand-primary` at 20% opacity fill, solid line)
- **Comparison line**: Optional dotted line for previous period
- **Empty state**: "No revenue data for this period" with illustration

### 2.4 Unit Status Donut Chart

**Components**: Custom chart wrapper

- **Type**: Donut chart with center text (total units count)
- **Segments**: Available (green), Reserved (amber), Sold (blue), Blocked (red)
- **Legend**: Below chart with color dots + label + count
- **Interaction**: Click segment to filter properties list
- **Center text**: Total units number in `display-2`

### 2.5 Recent Activity Feed

**Components**: Custom `ActivityFeed` using `ScrollArea`

- List of activity items, max 10 shown
- Each item:
  - Status dot (color-coded by type)
  - Title (bold) + description
  - Relative timestamp ("2 min ago", "1 hour ago")
  - Optional: Avatar of user who performed action
- Activity types & colors:
  - 🔵 Lead activity (assigned, created, updated)
  - 🟢 Payment received
  - 🟡 Lease events (expiring, renewed)
  - 🔴 Maintenance/alerts
  - ⚪ System events
- "View all activity" link at bottom
- Auto-updates via polling or WebSocket

### 2.6 Quick Actions Panel

**Components**: `Card`, `Button`

- Grid of action buttons (2 columns)
- Each: Icon + label, `variant="outline"` or `variant="ghost"`
- Actions: Add Property, New Lead, Generate Report, View Inventory
- Below: "Upcoming" section with calendar-style items
- Each upcoming item: calendar icon + description + date

### 2.7 Top Properties Table

**Components**: shadcn `Table`, custom `TrendBadge`

- Sortable columns: Property Name, Units, Occupancy, Revenue, Trend
- Max 5 rows shown on dashboard
- "View All" link to properties page
- Occupancy: Progress bar or percentage with color coding
- Trend: Green/red arrow + percentage
- Clickable rows → navigate to property detail

---

## 3. Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| KPI Cards | Horizontal scroll | 2×2 grid | 4-column row |
| Revenue Chart | Full-width, h-48 | Full-width, h-56 | 60% width, h-72 |
| Unit Donut | Full-width, h-48 | Full-width, h-56 | 40% width, h-72 |
| Activity Feed | Full-width, 5 items | Full-width, 8 items | 50% width, 10 items |
| Quick Actions | 2×2 compact icons | Full-width, list | 50% width, grid |
| Properties Table | Card layout | Scroll table | Full table |
| Date Range Picker | Full-screen sheet | Popover | Popover |

---

## 4. RTL Considerations

### Layout Mirroring

- KPI card grid: No change needed (CSS Grid auto-mirrors).
- Trend arrows: `↑` / `↓` are direction-neutral. No mirroring needed.
- Charts:
  - **X-axis labels**: Read inline-start to inline-end (auto-handled by Recharts with RTL config).
  - **Y-axis**: Position at `inline-end` in RTL (right side in LTR, left in RTL). Recharts: `yAxisId` + `orientation="right"` in RTL.
  - **Tooltip**: Align to cursor position (auto).
  - **Legend**: Text alignment `text-start`.
- Activity feed: Dot on `inline-start`, timestamp on `inline-end`.
- Quick actions: Grid order is visual (CSS Grid handles RTL).
- Table: Text columns `text-start`, number/currency columns `text-end`.

### Number Formatting

- Use `Intl.NumberFormat('ar-SA')` for Arabic locale.
- Currency: `SAR 2,400,000` (en) → `٢٬٤٠٠٬٠٠٠ ر.س` (ar).
- Percentages: `87.5%` (en) → `٪٨٧٫٥` (ar).
- Dates in charts: Hijri month names in Arabic locale.

### Text Content

- Greeting: "Welcome back, Ahmed" → "مرحباً بعودتك، أحمد"
- All labels translatable via i18n keys.
- Activity descriptions: Template strings with translated verbs.

---

## 5. Accessibility

### Semantic Structure

```html
<main>
  <header>
    <h1>Dashboard</h1>
    <p>Welcome back, Ahmed</p>
  </header>
  
  <section aria-label="Key Performance Indicators">
    <div role="list">
      <article role="listitem" aria-label="Total Properties: 24">...</article>
      <!-- ... -->
    </div>
  </section>
  
  <section aria-label="Revenue Trend">
    <figure role="img" aria-label="Revenue trend chart showing...">
      <canvas>...</canvas>
      <figcaption>Monthly revenue from October 2025 to March 2026</figcaption>
    </figure>
  </section>
  
  <section aria-label="Recent Activity">
    <h2>Recent Activity</h2>
    <ol aria-label="Activity feed">...</ol>
  </section>
</main>
```

### Chart Accessibility

- Charts have `role="img"` with descriptive `aria-label`.
- Provide data table alternative (toggleable): "View as table" button below each chart.
- Color-coded segments always paired with text labels.
- Donut chart legend is keyboard-navigable.

### KPI Cards

- Each card is an `<article>` with `aria-label` summarizing the KPI.
- Trend direction announced: "increased by 3.2 percent versus last period".
- `aria-live="polite"` on KPI values if they update in real-time.

### Activity Feed

- Ordered list (`<ol>`) for chronological items.
- Relative times have `<time datetime="...">` with ISO timestamp.
- New items: `aria-live="polite"` container for auto-updates.

---

## 6. Data Requirements

### API Endpoints

| Data | Endpoint | Method | Params |
|------|----------|--------|--------|
| KPI summary | `GET /api/dashboard/kpis` | GET | `dateFrom`, `dateTo`, `tenantId` |
| Revenue trend | `GET /api/dashboard/revenue-trend` | GET | `period` (monthly/quarterly), `dateFrom`, `dateTo` |
| Unit status breakdown | `GET /api/dashboard/unit-status` | GET | `tenantId` |
| Recent activity | `GET /api/dashboard/activity` | GET | `limit`, `offset` |
| Top properties | `GET /api/dashboard/top-properties` | GET | `sortBy`, `limit` |
| Upcoming events | `GET /api/dashboard/upcoming` | GET | `days` (default 7) |

### Response Shape (KPI)

```typescript
interface DashboardKPIs {
  totalProperties: { value: number; change: number; changePercent: number; };
  occupancyRate: { value: number; change: number; changePercent: number; };
  revenueMTD: { value: number; currency: 'SAR'; change: number; changePercent: number; };
  activeLeads: { value: number; newThisWeek: number; };
}
```

### Response Shape (Revenue Trend)

```typescript
interface RevenueTrendPoint {
  date: string;       // ISO date
  dateHijri: string;  // Hijri formatted
  revenue: number;
  previousPeriod?: number;
}
```

### Caching & Update

- KPIs: Cache 5 min, background revalidation.
- Revenue chart: Cache 15 min.
- Activity feed: Polling every 30s or WebSocket push.
- Top properties: Cache 15 min.

---

## 7. Interactive States

### Loading

- KPI cards: 4 skeleton cards with pulsing gradient
- Charts: Skeleton rectangle with centered spinner
- Activity feed: 5 skeleton list items (avatar dot + 2 text lines)
- Properties table: Skeleton table rows (5 rows, header visible)

### Empty States

| Section | Empty Message | CTA |
|---------|--------------|-----|
| KPI (no properties) | "Add your first property to see metrics" | "Add Property" button |
| Revenue chart | "No revenue data yet. Start collecting payments." | "Set up billing" |
| Unit status | "No units configured. Add units to your properties." | "Go to Properties" |
| Activity feed | "No recent activity. Actions will appear here." | None |
| Properties table | "No properties found. Get started by adding one." | "Add Property" button |

### Error States

- API error on section: Section shows inline error card with retry button
- Full page error: Error boundary with "Something went wrong" + retry + report issue link
- Partial data: Show available sections, error badge on failed ones

### Real-time Updates

- New activity item: Slide-in animation from top of list
- KPI value change: Number counter animation (count up/down to new value)
- Notification dot pulse on new notification
