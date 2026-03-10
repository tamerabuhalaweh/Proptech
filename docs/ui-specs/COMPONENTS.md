# Component Catalog

> Custom components needed beyond shadcn/ui defaults
> PropTech-specific components for property management

---

## Overview

All components listed here extend or complement the shadcn/ui base components. Each component:
- Works in both LTR and RTL layouts
- Supports light and dark modes
- Follows WCAG 2.1 AA accessibility standards
- Uses translatable strings (no hardcoded text)
- Uses logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`)

### Component Naming Convention

```
src/components/
├── ui/              # shadcn/ui base (auto-generated)
├── layout/          # App shell components
├── common/          # Shared across all pages
├── property/        # Property-related components
├── inventory/       # Unit/inventory components
├── crm/             # Lead/CRM components
├── finance/         # Finance-related components
└── settings/        # Settings page components
```

---

## 1. Layout Components

### 1.1 `AppSidebar`

**Location**: `src/components/layout/app-sidebar.tsx`

```typescript
interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentPath: string;
  tenant: TenantInfo;
  user: UserInfo;
  navigation: NavGroup[];
}

interface NavGroup {
  label: string;        // Translation key
  items: NavItem[];
}

interface NavItem {
  label: string;        // Translation key
  labelAr?: string;
  icon: LucideIcon;
  href: string;
  badge?: number;       // Notification count
  children?: NavItem[];
  requiredPermission?: string;
}
```

**Variants**: `expanded` (256px), `collapsed` (64px, icon-only), `mobile-sheet` (full overlay)

**Usage**:
```tsx
<AppSidebar
  collapsed={isCollapsed}
  onToggleCollapse={toggleSidebar}
  currentPath={pathname}
  tenant={currentTenant}
  user={currentUser}
  navigation={sidebarNavigation}
/>
```

### 1.2 `AppTopbar`

**Location**: `src/components/layout/app-topbar.tsx`

```typescript
interface AppTopbarProps {
  breadcrumbs: BreadcrumbItem[];
  onMenuToggle: () => void;  // Mobile hamburger
  showMenuButton: boolean;    // Mobile/tablet only
}

interface BreadcrumbItem {
  label: string;  // Translation key
  href?: string;  // Undefined = current page
}
```

### 1.3 `MobileBottomNav`

**Location**: `src/components/layout/mobile-bottom-nav.tsx`

```typescript
interface MobileBottomNavProps {
  items: Array<{
    label: string;
    icon: LucideIcon;
    href: string;
    badge?: number;
  }>;
  currentPath: string;
}
```

### 1.4 `TenantSwitcher`

**Location**: `src/components/layout/tenant-switcher.tsx`

```typescript
interface TenantSwitcherProps {
  currentTenant: TenantInfo;
  tenants: TenantInfo[];
  onSwitch: (tenantId: string) => void;
}

interface TenantInfo {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
  plan: 'starter' | 'professional' | 'enterprise';
}
```

### 1.5 `CommandSearch`

**Location**: `src/components/layout/command-search.tsx`

```typescript
interface CommandSearchProps {
  placeholder?: string;  // Translation key
  categories: SearchCategory[];
  onSelect: (result: SearchResult) => void;
  recentSearches?: SearchResult[];
}

interface SearchCategory {
  label: string;
  icon: LucideIcon;
  searchFn: (query: string) => Promise<SearchResult[]>;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: LucideIcon;
  href: string;
}
```

---

## 2. Common Components

### 2.1 `KPICard`

**Location**: `src/components/common/kpi-card.tsx`

```typescript
interface KPICardProps {
  label: string;              // Translation key
  value: string | number;
  formattedValue?: string;    // Pre-formatted display value
  icon: LucideIcon;
  iconColor?: string;         // Tailwind color class
  trend?: {
    value: number;            // Percentage change
    direction: 'up' | 'down' | 'neutral';
    label?: string;           // "vs last month"
  };
  sparkline?: number[];       // Array of values for mini chart
  onClick?: () => void;
  loading?: boolean;
}
```

**Variants**: `default`, `compact` (no sparkline, smaller), `large` (display-1 value)

**Usage**:
```tsx
<KPICard
  label="dashboard.kpi.occupancyRate"
  value={87.5}
  formattedValue="87.5%"
  icon={PieChart}
  iconColor="text-blue-600"
  trend={{ value: 3.2, direction: 'up', label: 'dashboard.kpi.vsLastMonth' }}
  sparkline={[82, 83, 84, 85, 86, 87, 87.5]}
/>
```

### 2.2 `StatusBadge`

**Location**: `src/components/common/status-badge.tsx`

```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  statusConfig?: Record<string, {
    label: string;      // Translation key
    color: string;      // Tailwind color class
    icon?: LucideIcon;
  }>;
}
```

**Preset configs**: `unitStatus`, `leadStage`, `leaseStatus`, `paymentStatus`

**Usage**:
```tsx
<StatusBadge status="available" variant="dot" />
<StatusBadge status="hot" statusConfig={leadScoreConfig} />
```

### 2.3 `DateDisplay`

**Location**: `src/components/common/date-display.tsx`

```typescript
interface DateDisplayProps {
  date: string | Date;
  format?: 'short' | 'medium' | 'long' | 'relative';
  showHijri?: boolean;       // Show Hijri alongside Gregorian
  hijriPrimary?: boolean;    // Hijri is the main date
  showBoth?: boolean;        // Show both calendars
  className?: string;
}
```

**Usage**:
```tsx
<DateDisplay date="2026-03-10" showBoth />
// EN: "Mar 10, 2026 (11 Sha'ban 1447)"
// AR: "١١ شعبان ١٤٤٧ (١٠ مارس ٢٠٢٦)"
```

### 2.4 `CurrencyDisplay`

**Location**: `src/components/common/currency-display.tsx`

```typescript
interface CurrencyDisplayProps {
  amount: number;
  currency?: string;           // Default: 'SAR'
  locale?: string;             // Auto-detected from context
  compact?: boolean;           // 1.5M instead of 1,500,000
  showChange?: boolean;        // Show +/- prefix
  className?: string;
}
```

**Usage**:
```tsx
<CurrencyDisplay amount={1500000} compact />
// EN: "SAR 1.5M"
// AR: "١.٥ مليون ر.س"
```

### 2.5 `EmptyState`

**Location**: `src/components/common/empty-state.tsx`

```typescript
interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: 'building' | 'search' | 'inbox' | 'chart' | 'users';
  title: string;              // Translation key
  description?: string;       // Translation key
  action?: {
    label: string;            // Translation key
    onClick: () => void;
    variant?: ButtonVariant;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
```

**Usage**:
```tsx
<EmptyState
  illustration="building"
  title="properties.empty.title"
  description="properties.empty.description"
  action={{ label: "properties.addProperty", onClick: handleAdd }}
/>
```

### 2.6 `FilterChip`

**Location**: `src/components/common/filter-chip.tsx`

```typescript
interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipBarProps {
  filters: Array<{ label: string; value: string; key: string }>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}
```

### 2.7 `DataTable`

**Location**: `src/components/common/data-table.tsx`

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: EmptyStateProps;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  };
  selection?: {
    selected: string[];
    onSelectionChange: (ids: string[]) => void;
  };
  bulkActions?: Array<{
    label: string;
    icon: LucideIcon;
    onClick: (selectedIds: string[]) => void;
    variant?: 'default' | 'destructive';
  }>;
  onRowClick?: (row: T) => void;
  rowId: (row: T) => string;
}
```

Built on `@tanstack/react-table` with shadcn/ui `Table` styling.

### 2.8 `SegmentedProgressBar`

**Location**: `src/components/common/segmented-progress-bar.tsx`

```typescript
interface SegmentedProgressBarProps {
  segments: Array<{
    label: string;         // Translation key
    value: number;
    color: string;         // Tailwind color
    icon?: LucideIcon;
  }>;
  total?: number;           // If not provided, sum of segments
  showLegend?: boolean;
  showPercentage?: boolean;
  onSegmentClick?: (segmentLabel: string) => void;
  activeSegment?: string;
  height?: 'sm' | 'default' | 'lg';
}
```

**Usage**:
```tsx
<SegmentedProgressBar
  segments={[
    { label: 'Available', value: 45, color: 'bg-green-500' },
    { label: 'Reserved', value: 23, color: 'bg-amber-500' },
    { label: 'Occupied', value: 180, color: 'bg-blue-500' },
    { label: 'Blocked', value: 12, color: 'bg-red-500' },
  ]}
  showLegend
  showPercentage
/>
```

### 2.9 `ConfirmDialog`

**Location**: `src/components/common/confirm-dialog.tsx`

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}
```

### 2.10 `PageHeader`

**Location**: `src/components/common/page-header.tsx`

```typescript
interface PageHeaderProps {
  title: string;              // Translation key
  subtitle?: string;          // Translation key or dynamic
  badge?: string | number;    // Count badge next to title
  actions?: React.ReactNode;  // Action buttons slot
  breadcrumbs?: BreadcrumbItem[];
}
```

---

## 3. Property Components

### 3.1 `PropertyCard`

**Location**: `src/components/property/property-card.tsx`

```typescript
interface PropertyCardProps {
  property: PropertySummary;
  variant?: 'grid' | 'list' | 'compact' | 'map-popup';
  showActions?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}
```

**Variants**:

| Variant | Description | Size |
|---------|-------------|------|
| `grid` | Card with image, title, stats, actions | ~300×360px |
| `list` | Horizontal card: thumbnail + info row | Full-width × ~80px |
| `compact` | Small card for side panels | ~250×200px |
| `map-popup` | Minimal card for map info window | ~240×160px |

**Grid variant structure**:
```
┌──────────────────────────┐
│ [Image 16:10 ratio]      │
│ [Status Badge overlay]   │
├──────────────────────────┤
│ Property Name (heading-3) │
│ 📍 District, City (muted) │
│                           │
│ ┌─────┐ ┌─────┐ ┌──────┐ │
│ │ 120 │ │ 92% │ │ Type │ │
│ │units│ │ occ │ │badge │ │
│ └─────┘ └─────┘ └──────┘ │
│                           │
│ [Occupancy progress bar]  │
│                           │
│ [View]         [⋯ More]   │ ← hover only on desktop
└──────────────────────────┘
```

**Interactions**:
- Hover: `shadow-sm` → `shadow-md`, subtle lift
- Click: Navigate to property detail
- Image error: Fallback placeholder with `Building2` icon on `bg-muted`
- Loading: Skeleton version (image rect + text lines)

### 3.2 `PropertyMap`

**Location**: `src/components/property/property-map.tsx`

```typescript
interface PropertyMapProps {
  properties: Array<{
    id: string;
    name: string;
    nameAr: string;
    coordinates: { lat: number; lng: number };
    type: string;
    status: string;
    coverImage?: string;
  }>;
  selectedId?: string;
  onMarkerClick: (id: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  defaultCenter?: { lat: number; lng: number };  // Default: Riyadh
  defaultZoom?: number;
}
```

**Features**:
- Custom markers with property type icons
- Marker clustering for dense areas
- Click marker → show `PropertyCard variant="map-popup"`
- Selected marker: Highlighted with accent color ring
- Map style: Custom style matching brand colors (muted map, property markers pop)

### 3.3 `BuildingVisualization`

**Location**: `src/components/property/building-visualization.tsx`

```typescript
interface BuildingVisualizationProps {
  buildings: BuildingGrid[];
  selectedUnitId?: string;
  onUnitClick: (unitId: string) => void;
  onUnitHover?: (unitId: string | null) => void;
  highlightStatus?: string[];   // Highlight units with these statuses
  dimOthers?: boolean;          // Dim non-highlighted units
  cellSize?: 'sm' | 'default' | 'lg';
  showLegend?: boolean;
}
```

**Cell rendering**:
```
┌──────┐
│ 1201 │  ← Unit number (caption, bold)
│ 🟢   │  ← Status color fill
│ STD  │  ← Type abbreviation (overline)
└──────┘
```

### 3.4 `AmenityGrid`

**Location**: `src/components/property/amenity-grid.tsx`

```typescript
interface AmenityGridProps {
  amenities: Array<{
    icon: string;    // Lucide icon name
    name: string;    // Translation key
  }>;
  columns?: 2 | 3 | 4;
}
```

---

## 4. Inventory Components

### 4.1 `UnitGrid`

**Location**: `src/components/inventory/unit-grid.tsx`

```typescript
interface UnitGridProps {
  building: BuildingGrid;
  selectedUnits: string[];
  onUnitClick: (unitId: string) => void;
  onUnitSelect: (unitId: string, multiSelect: boolean) => void;
  onUnitRangeSelect: (startId: string, endId: string) => void;
  onUnitContextMenu: (unitId: string, position: { x: number; y: number }) => void;
  filters?: {
    status?: string[];
    type?: string[];
  };
  cellSize?: number;        // px, default 80
  showTooltip?: boolean;
}
```

**Key behaviors**:
- Keyboard grid navigation (arrow keys)
- Multi-select: Ctrl+Click, Shift+Click range
- Right-click context menu
- Tooltip on hover with unit details
- Filter: Non-matching cells dimmed to 20% opacity
- Virtual rendering for buildings with >200 units

### 4.2 `UnitCell`

**Location**: `src/components/inventory/unit-cell.tsx`

```typescript
interface UnitCellProps {
  unit: {
    id: string;
    number: string;
    type: string;
    status: UnitStatus;
    area: number;
    price: number;
  };
  selected: boolean;
  dimmed: boolean;
  focused: boolean;
  size: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

type UnitStatus = 'available' | 'reserved' | 'occupied' | 'blocked' | 'maintenance';
```

**Status styling**:

| Status | Light BG | Dark BG | Border | Text |
|--------|---------|---------|--------|------|
| available | `bg-emerald-50` | `bg-emerald-950/30` | `border-emerald-200` | `text-emerald-700` |
| reserved | `bg-amber-50` | `bg-amber-950/30` | `border-amber-200` | `text-amber-700` |
| occupied | `bg-blue-50` | `bg-blue-950/30` | `border-blue-200` | `text-blue-700` |
| blocked | `bg-red-50` | `bg-red-950/30` | `border-red-200` | `text-red-700` |
| maintenance | `bg-gray-50` | `bg-gray-900/30` | `border-gray-200` | `text-gray-600` |

### 4.3 `UnitDetailSheet`

**Location**: `src/components/inventory/unit-detail-sheet.tsx`

```typescript
interface UnitDetailSheetProps {
  unitId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (unitId: string, newStatus: UnitStatus) => void;
  onEdit?: (unitId: string) => void;
}
```

Content sections: Unit info, Pricing, Tenant (if occupied), History timeline, Actions.

### 4.4 `BulkActionBar`

**Location**: `src/components/inventory/bulk-action-bar.tsx`

```typescript
interface BulkActionBarProps {
  selectedCount: number;
  onChangeStatus: (status: UnitStatus) => void;
  onExport: () => void;
  onClearSelection: () => void;
  className?: string;
}
```

**Layout**: Sticky bottom bar, slides up on selection, down on clear.

```
┌──────────────────────────────────────────────────────────┐
│ ✕ 3 units selected │ [Change Status ▾] │ [Export] │ Clear│
└──────────────────────────────────────────────────────────┘
```

### 4.5 `UnitContextMenu`

**Location**: `src/components/inventory/unit-context-menu.tsx`

```typescript
interface UnitContextMenuProps {
  unit: Unit;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
}
```

**Menu items**: View Details, Change Status →, Reserve, Block/Unblock, Edit, View Lease, Copy Unit Number.

---

## 5. CRM Components

### 5.1 `PipelineBoard`

**Location**: `src/components/crm/pipeline-board.tsx`

```typescript
interface PipelineBoardProps {
  stages: PipelineStage[];
  onMoveCard: (leadId: string, fromStage: string, toStage: string) => void;
  onCardClick: (leadId: string) => void;
  cardVariant?: 'compact' | 'standard';
  loading?: boolean;
}

interface PipelineStage {
  id: string;
  name: string;          // Translation key
  color: string;         // Header accent color
  leads: LeadCardData[];
  totalValue: number;
}
```

**Features**:
- Horizontal scrollable board (`overflow-x-auto`)
- Columns: Fixed-width (280px), natural height
- Drag & drop: `@dnd-kit/core` with `@dnd-kit/sortable`
- Column scroll: Each column independently scrollable
- RTL: Column order auto-reverses
- Keyboard DnD: `M` to move, arrows to pick column, `Enter` to confirm

### 5.2 `LeadCard`

**Location**: `src/components/crm/lead-card.tsx`

```typescript
interface LeadCardProps {
  lead: LeadCardData;
  variant?: 'compact' | 'standard';
  draggable?: boolean;
  onClick?: () => void;
}

interface LeadCardData {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  scoreLabel: 'hot' | 'warm' | 'cold';
  location: string;
  locationAr: string;
  interest: string;        // e.g., "2BR Apartment"
  interestAr: string;
  budgetMin: number;
  budgetMax: number;
  agent: {
    name: string;
    avatar?: string;
  };
  nextAction?: {
    type: string;
    date: string;
  };
  lastActivityAt: string;
}
```

**Compact variant**:
```
┌────────────────────────────┐
│ Ahmed Al-Q.     🔴 85       │
│ 📍 Riyadh │ SAR 1.5-2M      │
│ 👤 Saad         2d ago      │
└────────────────────────────┘
```

**Standard variant**:
```
┌────────────────────────────┐
│ 👤 Ahmed Al-Qahtani         │
│                             │
│ 🔴 Hot │ Score: 85          │
│ 📍 Al Olaya, Riyadh         │
│ 🏢 2BR Apartment            │
│ 💰 SAR 1.5M - 2M            │
│                             │
│ 📅 Call today 2PM           │
│                             │
│ 👤 Saad │ 2d ago             │
└────────────────────────────┘
```

### 5.3 `ScoreBadge`

**Location**: `src/components/crm/score-badge.tsx`

```typescript
interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;        // Show "Hot"/"Warm"/"Cold" text
  showValue?: boolean;        // Show numeric score
  size?: 'sm' | 'default' | 'lg';
  variant?: 'badge' | 'ring';  // Badge = pill, Ring = circular indicator
}
```

**Rendering**:
- `badge` variant: Colored pill with icon + optional text
- `ring` variant: Circular progress ring with score in center

### 5.4 `LeadDetailSheet`

**Location**: `src/components/crm/lead-detail-sheet.tsx`

```typescript
interface LeadDetailSheetProps {
  leadId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange?: (leadId: string, newStage: string) => void;
}
```

Tabs: Overview, Activity, Notes, Tasks, Documents.

### 5.5 `ActivityTimeline`

**Location**: `src/components/crm/activity-timeline.tsx`

```typescript
interface ActivityTimelineProps {
  activities: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'system';
    title: string;
    titleAr: string;
    description?: string;
    descriptionAr?: string;
    actor: { name: string; avatar?: string; };
    timestamp: string;
    timestampHijri: string;
  }>;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

**Layout**:
```
│ ● Call with Ahmed           2 hours ago
│   Discussed 2BR options in Al Olaya
│
│ ● Email sent                Yesterday
│   Brochure and pricing shared
│
│ ○ Lead created              Mar 8, 2026
│   Source: Website form
```

- Dot at `inline-start`, timeline line connecting dots
- Filled dot for user actions, hollow dot for system events
- Icon per type (Phone, Mail, Calendar, StickyNote, RefreshCw, Settings)

### 5.6 `PipelineSummary`

**Location**: `src/components/crm/pipeline-summary.tsx`

```typescript
interface PipelineSummaryProps {
  stages: Array<{ name: string; nameAr: string; count: number; value: number; }>;
  conversionRate: number;
  avgDaysToClose: number;
  onStageClick?: (stage: string) => void;
}
```

Visual funnel with connected stage indicators, counts, and values.

---

## 6. Finance Components

### 6.1 `RevenueChart`

**Location**: `src/components/finance/revenue-chart.tsx`

```typescript
interface RevenueChartProps {
  data: Array<{
    date: string;
    dateHijri: string;
    revenue: number;
    previousPeriod?: number;
  }>;
  period: 'monthly' | 'quarterly';
  onPeriodChange: (period: 'monthly' | 'quarterly') => void;
  showComparison?: boolean;
  loading?: boolean;
}
```

Uses Recharts. Area chart with gradient fill. Responsive container.

### 6.2 `UnitStatusChart`

**Location**: `src/components/finance/unit-status-chart.tsx`

```typescript
interface UnitStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  totalUnits: number;
  onSegmentClick?: (status: string) => void;
  loading?: boolean;
}
```

Donut chart with total in center. Legend below.

---

## 7. Settings Components

### 7.1 `SettingsNav`

**Location**: `src/components/settings/settings-nav.tsx`

```typescript
interface SettingsNavProps {
  groups: Array<{
    label: string;
    icon: LucideIcon;
    items: Array<{
      label: string;
      href: string;
      badge?: string;
    }>;
  }>;
  currentPath: string;
}
```

### 7.2 `PlanCard`

**Location**: `src/components/settings/plan-card.tsx`

```typescript
interface PlanCardProps {
  plan: {
    name: string;
    nameAr: string;
    price: number;
    currency: string;
    period: 'monthly' | 'annually';
    features: Array<{ label: string; included: boolean; }>;
    limits: { properties: number; users: number; storageGB: number; };
  };
  current?: boolean;
  recommended?: boolean;
  onSelect?: () => void;
}
```

### 7.3 `UsageMeter`

**Location**: `src/components/settings/usage-meter.tsx`

```typescript
interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;             // "properties", "users", "GB"
  thresholds?: {
    warning: number;         // Percentage (e.g., 80)
    critical: number;        // Percentage (e.g., 95)
  };
}
```

Color transitions: Green (<50%) → Amber (50-80%) → Red (>80%).

### 7.4 `PermissionMatrix`

**Location**: `src/components/settings/permission-matrix.tsx`

```typescript
interface PermissionMatrixProps {
  modules: Array<{
    name: string;
    nameAr: string;
    permissions: Array<{
      action: 'view' | 'create' | 'edit' | 'delete' | 'export';
      enabled: boolean;
    }>;
  }>;
  editable?: boolean;
  onChange?: (moduleName: string, action: string, enabled: boolean) => void;
}
```

### 7.5 `InviteUserDialog`

**Location**: `src/components/settings/invite-user-dialog.tsx`

```typescript
interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Array<{ id: string; name: string; nameAr: string; }>;
  properties: Array<{ id: string; name: string; nameAr: string; }>;
  onInvite: (data: InviteData) => Promise<void>;
}

interface InviteData {
  email: string;
  roleId: string;
  propertyIds: string[] | 'all';
  sendWelcomeEmail: boolean;
}
```

---

## 8. Shared Hooks

### 8.1 `useDirection`

```typescript
function useDirection(): {
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  startSide: 'left' | 'right';
  endSide: 'left' | 'right';
};
```

### 8.2 `useLocale`

```typescript
function useLocale(): {
  locale: 'en' | 'ar';
  t: (key: string, params?: Record<string, string>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | Date, options?: DateFormatOptions) => string;
  formatDateHijri: (date: string | Date) => string;
  formatNumber: (num: number) => string;
  calendar: 'hijri' | 'gregorian';
};
```

### 8.3 `useBreakpoint`

```typescript
function useBreakpoint(): {
  isMobile: boolean;     // <768
  isTablet: boolean;     // 768-1023
  isDesktop: boolean;    // ≥1024
  isWide: boolean;       // ≥1280
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
};
```

### 8.4 `useUnitSelection`

```typescript
function useUnitSelection(): {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggleSelect: (id: string) => void;
  rangeSelect: (startId: string, endId: string, allIds: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectedCount: number;
};
```

---

## 9. shadcn/ui Components Used (Base)

The following shadcn/ui components are used across the platform and should be installed:

| Component | Usage |
|-----------|-------|
| `Accordion` | Settings sections, FAQ |
| `Avatar` | User avatars, tenant logos |
| `Badge` | Status badges, counts |
| `Breadcrumb` | Page navigation |
| `Button` | All actions |
| `Calendar` | Date pickers (with Hijri adapter) |
| `Card` | Content containers |
| `Checkbox` | Table selection, forms |
| `Collapsible` | Sidebar groups |
| `Command` | Global search (cmdk) |
| `Dialog` | Modal dialogs |
| `DropdownMenu` | Action menus |
| `Form` | All forms (react-hook-form) |
| `Input` | Text inputs |
| `Label` | Form labels |
| `Pagination` | Table/list pagination |
| `Popover` | Filters, date pickers |
| `Progress` | Usage meters, occupancy |
| `RadioGroup` | Settings options |
| `ScrollArea` | Sidebar, long lists |
| `Select` | Dropdown selects |
| `Separator` | Visual dividers |
| `Sheet` | Side drawers, mobile panels |
| `Skeleton` | Loading states |
| `Slider` | Price range filters |
| `Switch` | Toggle settings |
| `Table` | Data tables |
| `Tabs` | Page tabs, building tabs |
| `Textarea` | Notes, descriptions |
| `Toast` | Notifications, confirmations |
| `Toggle` | View toggles |
| `ToggleGroup` | View mode switch |
| `Tooltip` | Icon explanations, unit details |

### shadcn/ui Modifications for RTL

When installing components, use the shadcn CLI with RTL support enabled. The CLI will automatically transform:
- `ml-*` → `ms-*`, `mr-*` → `me-*`
- `pl-*` → `ps-*`, `pr-*` → `pe-*`
- `left-*` → `start-*`, `right-*` → `end-*`
- `text-left` → `text-start`, `text-right` → `text-end`
- Directional icons are wrapped with `scaleX(-1)` in RTL

---

## 10. Third-Party Libraries

| Library | Usage | Version |
|---------|-------|---------|
| `@tanstack/react-table` | Data tables (DataTable) | ^8.x |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Kanban drag & drop | ^6.x |
| `recharts` | Charts (Revenue, Donut, Sparkline) | ^2.x |
| `lucide-react` | Icons | ^0.4x |
| `react-hook-form` + `zod` | Form validation | ^7.x + ^3.x |
| `next-intl` | Internationalization | ^3.x |
| `date-fns` + `date-fns-jalali` | Date formatting (Hijri adapter) | ^3.x |
| `cmdk` | Command palette | ^1.x |
| `embla-carousel-react` | Image carousels | ^8.x |
| `react-map-gl` or `@vis.gl/react-google-maps` | Map view | Latest |
| `vaul` | Drawer (mobile sheets) | ^1.x |
| `sonner` | Toast notifications | ^1.x |
| `nuqs` | URL query state management | ^2.x |
