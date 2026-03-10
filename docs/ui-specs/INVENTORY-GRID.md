# Inventory Grid Page Specification

> Interactive unit grid — color-coded by status with filters and bulk actions
> Route: `/properties/:slug/inventory` or `/inventory` (global view)

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ "Unit Inventory"      │ Property: [Al Noor Tower ▾]       ││
│ │ "260 units across     │ [+ Add Unit] [Bulk Import]        ││
│ │  3 buildings"         │                                    ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Toolbar                                                      │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Status: [All▾] Type: [All▾] Floor: [All▾] │ 🔍 Search    ││
│ │ Price: [Min]-[Max]                        │ [Grid][Table] ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Status Summary Bar                                           │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ ■■■■■■■■■■■■■■■■■□□□□□□□□                                ││
│ │ 🟢 Available: 45 (17%) │ 🟡 Reserved: 23 (9%)            ││
│ │ 🔵 Occupied: 180 (69%) │ 🔴 Blocked: 12 (5%)             ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ GRID VIEW (Building Layout) ═══                          │
│                                                              │
│ Building Selector Tabs                                       │
│ [Building A (120 units)] [Building B (85 units)] [Bldg C]   │
│                                                              │
│ Floor Grid                                                   │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Floor │  01  │  02  │  03  │  04  │  05  │  06  │  07  │ ││
│ │───────│──────│──────│──────│──────│──────│──────│──────│ ││
│ │ F12   │ 1201 │ 1202 │ 1203 │ 1204 │ 1205 │ 1206 │      │ ││
│ │       │ 🟢   │ 🟢   │ 🔵   │ 🔵   │ 🟡   │ 🔴   │      │ ││
│ │       │ STD  │ 1BR  │ 2BR  │ 2BR  │ 3BR  │ PH   │      │ ││
│ │───────│──────│──────│──────│──────│──────│──────│──────│ ││
│ │ F11   │ 1101 │ 1102 │ 1103 │ 1104 │ 1105 │ 1106 │ 1107 │ ││
│ │       │ 🔵   │ 🔵   │ 🔵   │ 🟢   │ 🔵   │ 🔵   │ 🔵   │ ││
│ │       │ STD  │ 1BR  │ 2BR  │ STD  │ 2BR  │ 3BR  │ 1BR  │ ││
│ │───────│──────│──────│──────│──────│──────│──────│──────│ ││
│ │ F10   │ 1001 │ 1002 │ 1003 │ 1004 │ 1005 │ 1006 │ 1007 │ ││
│ │       │ 🟢   │ 🔵   │ 🟡   │ 🔵   │ 🔵   │ 🟢   │ 🔵   │ ││
│ │       │ STD  │ 1BR  │ 2BR  │ 1BR  │ 2BR  │ 3BR  │ STD  │ ││
│ │ ...   │ ...  │ ...  │ ...  │ ...  │ ...  │ ...  │ ...  │ ││
│ │ F1    │ 101  │ 102  │ 103  │ 104  │ 105  │ 106  │ 107  │ ││
│ │       │ 🔵   │ 🔵   │ 🔵   │ 🔵   │ 🔵   │ 🔵   │ 🔵   │ ││
│ │       │ STD  │ 1BR  │ 2BR  │ 1BR  │ 2BR  │ 3BR  │ STD  │ ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Legend & Actions Bar                                         │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ 🟢 Available  🟡 Reserved  🔵 Occupied  🔴 Blocked       ││
│ │ ⬜ Maintenance                                            ││
│ │                        [Selected: 3 units] [Change Status]││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ TABLE VIEW ═══                                           │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ □ │ Unit# │ Floor │ Bldg │ Type  │ Area │ Price  │Status ││
│ │───│───────│───────│──────│───────│──────│────────│───────││
│ │ □ │ 1201  │ 12    │ A    │ Studio│ 45m² │ 35,000 │ 🟢    ││
│ │ □ │ 1202  │ 12    │ A    │ 1BR   │ 65m² │ 55,000 │ 🟢    ││
│ │ □ │ 1203  │ 12    │ A    │ 2BR   │ 95m² │ 82,000 │ 🔵    ││
│ │ □ │ 1204  │ 12    │ A    │ 2BR   │ 90m² │ 80,000 │ 🔵    ││
│ │ □ │ 1205  │ 12    │ A    │ 3BR   │ 130m²│108,000 │ 🟡    ││
│ └───────────────────────────────────────────────────────────┘│
│ Pagination: ‹ 1 [2] 3 4 5 ›  │ 50 per page ▾              │
└─────────────────────────────────────────────────────────────┘
```

### Unit Cell Detail (on hover / click)

```
┌──────────────────────────┐
│ Unit 1201                │
│ ──────────               │
│ Floor: 12                │
│ Type: Studio             │
│ Area: 45 m²              │
│ Status: Available        │
│ Price: SAR 35,000/yr     │
│                          │
│ [View] [Reserve] [Edit]  │
└──────────────────────────┘
```

### Tablet (768px–1023px)

- Grid: Smaller cells (min-width per cell reduced), horizontal scroll
- Status bar: 2-row layout
- Filters: Collapsible panel
- Table: Standard responsive table with scroll

### Mobile (<768px)

- Grid: Horizontal + vertical scroll (pinch-to-zoom feel)
- Or: Card-based list view (default on mobile)
- Status bar: Stacked vertically
- Filters: Full-screen filter sheet
- Bulk select: Long-press to enter selection mode

---

## 2. Component Breakdown

### 2.1 Page Header

**Components**: `heading-1`, `body-sm`, `Select`, `Button`

- Title: "Unit Inventory"
- Subtitle: Dynamic count "260 units across 3 buildings"
- Property selector: `Select` dropdown (for global inventory view, allows filtering to single property)
- Actions: "+ Add Unit" primary button, "Bulk Import" outline button

### 2.2 Toolbar

**Components**: `Select`, `Input`, `Slider`, `ToggleGroup`

| Filter | Component | Behavior |
|--------|-----------|----------|
| Status | Multi-select | Filter grid cells by status |
| Unit Type | Multi-select | Studio, 1BR, 2BR, 3BR, Penthouse, Commercial |
| Floor | Range select | From floor X to floor Y |
| Price Range | Dual-handle slider | Min/max SAR with inputs |
| Search | Text input | Search unit number, tenant name |
| View Toggle | ToggleGroup | Grid / Table |

- Filters immediately update the grid (no "Apply" button)
- URL params sync: `?status=available,reserved&type=2br&floor=5-12`
- Filter reset: "Clear all" link

### 2.3 Status Summary Bar

**Components**: Custom `SegmentedProgressBar`, `Badge`

- Full-width segmented bar showing proportional status distribution
- Color-coded segments: Green (available), Amber (reserved), Blue (occupied), Red (blocked), Gray (maintenance)
- Below bar: Legend with dot + label + count + percentage
- Clickable: Clicking a status toggles the filter
- Active filter: Corresponding segment highlighted, others dimmed
- Animation: Segments animate width on filter change

### 2.4 Building Selector

**Components**: shadcn `Tabs`

- Tab per building: "Building A (120 units)"
- Badge on each tab showing unit count
- Or dropdown select if > 5 buildings
- "All Buildings" option for global view (grid becomes multi-section)

### 2.5 Unit Grid (Core Component)

**Components**: Custom `UnitGrid` (see COMPONENTS.md for full spec)

#### Grid Structure

- **Layout**: CSS Grid with floor rows (top = highest floor) × unit columns
- **Cell size**: ~80×80px desktop, ~60×60px tablet, variable mobile
- **Floor labels**: Sticky column at `inline-start`
- **Column headers**: Unit position labels (optional, or auto-numbered)

#### Cell Content

Each cell displays:
1. **Unit number** (top, `caption` size, bold)
2. **Status indicator** (background color fill)
3. **Unit type abbreviation** (bottom, `overline` size)
   - STD (Studio), 1BR, 2BR, 3BR, 4BR, PH (Penthouse), COM (Commercial)

#### Cell States

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Available | `bg-green-100` / `bg-green-900/20` dark | `border-green-300` | `text-green-800` |
| Reserved | `bg-amber-100` / `bg-amber-900/20` dark | `border-amber-300` | `text-amber-800` |
| Occupied | `bg-blue-100` / `bg-blue-900/20` dark | `border-blue-300` | `text-blue-800` |
| Blocked | `bg-red-100` / `bg-red-900/20` dark | `border-red-300` | `text-red-800` |
| Maintenance | `bg-gray-100` / `bg-gray-800/20` dark | `border-gray-300` | `text-gray-600` |
| Selected | Above + `ring-2 ring-brand-primary` | Above + thick border | Above |
| Filtered out | `opacity-20` | Above dimmed | Dimmed |
| Hover | Above + `shadow-sm` + slight scale(1.02) | Above | Above |

#### Interactions

- **Hover**: Show tooltip with unit details (number, type, area, price, status, tenant if occupied)
- **Click**: Open unit detail sheet/modal
- **Multi-select**: `Cmd/Ctrl+Click` to select multiple, `Shift+Click` for range
- **Right-click**: Context menu with quick actions (Change Status, Reserve, Block, Edit)
- **Drag-select**: Click and drag to select a range of cells (desktop only)

### 2.6 Bulk Action Bar

**Components**: Custom `BulkActionBar`, `Button`, `Badge`

- Appears sticky at bottom when units are selected
- Shows: "X units selected" + action buttons
- Actions: Change Status, Reserve, Block/Unblock, Export Selected, Clear Selection
- Change Status: Opens dialog with status dropdown + optional note + confirmation
- Animated slide-up when first unit selected, slide-down on clear

### 2.7 Unit Table (Table View)

**Components**: shadcn `Table`, `Checkbox`, `Badge`, `DropdownMenu`

| Column | Type | Sortable | Width |
|--------|------|----------|-------|
| Checkbox | Selection | No | 40px |
| Unit Number | Text (monospace) | Yes | 100px |
| Floor | Number | Yes | 80px |
| Building | Text | Yes | 100px |
| Type | Badge | Yes | 100px |
| Area (m²) | Number | Yes | 100px |
| Bedrooms | Number | Yes | 80px |
| Bathrooms | Number | Yes | 80px |
| Price (SAR/yr) | Currency | Yes | 140px |
| Status | Status badge | Yes | 120px |
| Tenant | Text (if occupied) | Yes | 160px |
| Actions | Dropdown | No | 60px |

- All columns from table view also apply from PROPERTIES.md table patterns
- Row click opens unit detail
- Status filter chips in header area

### 2.8 Unit Detail Sheet

**Components**: shadcn `Sheet` (side drawer)

```
┌────────────────────────────────┐
│ Unit 1201                 [X] │
│ ─────────────────             │
│ Building A, Floor 12          │
│                               │
│ Status: [🟢 Available ▾]      │
│                               │
│ Details                       │
│ ─────────                     │
│ Type: Studio                  │
│ Area: 45 m²                  │
│ Bedrooms: 0                  │
│ Bathrooms: 1                 │
│ Balcony: Yes                 │
│ View: City View              │
│ Parking: Spot #12            │
│                               │
│ Pricing                       │
│ ─────────                     │
│ Annual Rent: SAR 35,000      │
│ Price/sqm: SAR 778           │
│ Last Updated: 15 Sha'ban 1447│
│                               │
│ Tenant (if occupied)          │
│ ─────────                     │
│ Name: Mohammed Al-Qahtani    │
│ Lease: 1 Muharram - 30 Dhul  │
│ Rent: SAR 35,000/yr          │
│ Status: Active               │
│                               │
│ History                       │
│ ─────────                     │
│ • Status changed to occupied  │
│   15 Muharram 1447            │
│ • Reserved by Agent Ahmed    │
│   10 Muharram 1447            │
│                               │
│ [Edit Unit] [View Lease]      │
└────────────────────────────────┘
```

- Slide in from `inline-end` (right in LTR, left in RTL)
- Width: 400px desktop, full-width mobile
- Sections: collapsible accordions

---

## 3. Responsive Behavior

| Element | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Page header | Stacked, compact | Inline | Full inline |
| Toolbar | Filter button → sheet | Compact inline | Full inline |
| Status bar | Vertical stack | 2-row | Single row |
| View toggle | Default card list | Grid + Table | Grid + Table |
| Grid cells | 50×50px, scroll both axes | 60×60px, scroll horizontal | 80×80px, no scroll |
| Grid floors | 4-5 visible, scroll vertical | 6-8 visible | All visible (or scroll if >15) |
| Building tabs | Dropdown select | Scrollable tabs | Full tabs |
| Bulk action bar | Fixed bottom, 2 rows | Fixed bottom, single row | Fixed bottom, single row |
| Unit detail | Full-screen sheet | Side sheet 400px | Side sheet 400px |
| Table view | Card layout | Scroll table | Full table |
| Multi-select | Long-press start | Ctrl+Click | Ctrl+Click, Drag |

---

## 4. RTL Considerations

### Grid Layout

- **Floor labels**: `inline-start` column (left in LTR, right in RTL)
- **Units read order**: `inline-start` to `inline-end` (same as text)
- **Unit numbering**: Remains logical (101, 102, 103...) — visual position mirrors
- CSS Grid: Use `direction: inherit` on grid container — cells auto-mirror
- Alternatively, explicitly reverse column order in RTL for correct spatial mapping

### Status Bar

- Segmented bar: Linear, no direction dependency
- Legend items: Natural inline flow (auto-reverses in RTL)

### Table View

- Checkbox: `inline-start`
- Text columns: `text-start`
- Number columns: `text-end`
- Actions: `inline-end`

### Unit Detail Sheet

- Slide from `inline-end`
- Close button: `inline-end` of header
- Key-value pairs: Label `inline-start`, value `inline-end`
- History timeline: Dot at `inline-start`, content to the right (or left in RTL)

### Tooltips

- Position: Above the cell (no directional dependency)
- Text alignment: `text-start`
- Content direction: Inherits from `dir`

### Bulk Actions Bar

- Selected count: `inline-start`
- Action buttons: `inline-end`

---

## 5. Accessibility

### Grid Accessibility

```html
<section aria-label="Unit inventory grid">
  <div role="grid" aria-label="Building A unit grid, 12 floors, 7 units per floor">
    <div role="row" aria-label="Floor 12">
      <div role="rowheader">Floor 12</div>
      <div role="gridcell" 
           aria-label="Unit 1201, Studio, Available, 45 square meters, SAR 35,000 per year"
           tabindex="0"
           aria-selected="false">
        1201
      </div>
      <!-- more cells -->
    </div>
    <!-- more rows -->
  </div>
</section>
```

### Keyboard Navigation

- **Arrow keys**: Move focus between grid cells (up/down for floors, left/right for units)
- **Enter**: Open unit detail sheet
- **Space**: Toggle cell selection
- **Ctrl+A**: Select all visible units
- **Escape**: Deselect all / close detail sheet
- **Home/End**: Jump to first/last unit on current floor
- **Page Up/Down**: Jump to next/previous floor
- Focus visible: `ring-2` on focused cell

### Screen Reader

- Grid announced as "Unit inventory grid, Building A, 12 rows, 7 columns"
- Each cell reads full context: "Unit 1201, Studio, Available, 45 square meters, SAR 35,000 per year"
- Status changes announced: "Unit 1201 status changed to Reserved"
- Bulk selection announced: "3 units selected. Press Enter to change status."
- Filters: "Showing 45 of 120 units, filtered by Available status"

### Color Independence

- Status colors supplemented with:
  - Text labels in each cell (type abbreviation)
  - Pattern fills option (diagonal lines for blocked, dots for reserved)
  - Status icon in tooltip (checkmark, clock, lock, wrench)
- High contrast mode: Borders become thicker, colors more saturated

### Tooltip Accessibility

- Tooltips triggered by both hover and focus
- `role="tooltip"` with `aria-describedby`
- Timeout: Stays visible for 5s or until focus/hover moves away
- Dismissable with `Escape`

---

## 6. Data Requirements

### API Endpoints

| Endpoint | Method | Params |
|----------|--------|--------|
| `GET /api/properties/:id/units` | GET | `status[]`, `type[]`, `floorMin`, `floorMax`, `priceMin`, `priceMax`, `search`, `sortBy`, `sortOrder`, `page`, `perPage`, `buildingId` |
| `GET /api/properties/:id/units/summary` | GET | — (returns status counts) |
| `GET /api/units/:id` | GET | — (unit detail) |
| `PATCH /api/units/:id` | PATCH | Unit update payload |
| `PATCH /api/units/bulk` | PATCH | `ids[]`, `status`, `note` |
| `POST /api/properties/:id/units` | POST | Unit creation payload |
| `POST /api/properties/:id/units/import` | POST | CSV/Excel file |
| `GET /api/inventory` | GET | Global inventory (all properties), same filters + `propertyId` |

### Response Shape (Unit)

```typescript
interface Unit {
  id: string;
  number: string;
  floor: number;
  buildingId: string;
  buildingName: string;
  buildingNameAr: string;
  
  type: 'studio' | '1br' | '2br' | '3br' | '4br' | 'penthouse' | 'commercial' | 'retail';
  status: 'available' | 'reserved' | 'occupied' | 'blocked' | 'maintenance';
  
  area: number;           // sqm
  bedrooms: number;
  bathrooms: number;
  
  features: {
    balcony: boolean;
    view: string;          // 'city' | 'garden' | 'pool' | 'street'
    viewAr: string;
    parkingSpot?: string;
    furnished: boolean;
  };
  
  pricing: {
    annualRent: number;
    pricePerSqm: number;
    lastUpdated: string;
  };
  
  tenant?: {
    id: string;
    name: string;
    nameAr: string;
    leaseStart: string;
    leaseEnd: string;
    leaseStatus: 'active' | 'expiring' | 'expired';
  };
  
  history: Array<{
    action: string;
    actionAr: string;
    date: string;
    dateHijri: string;
    actor: string;
    note?: string;
  }>;
}

interface UnitSummary {
  total: number;
  available: number;
  reserved: number;
  occupied: number;
  blocked: number;
  maintenance: number;
}
```

### Grid Data Structure

```typescript
interface BuildingGrid {
  buildingId: string;
  name: string;
  nameAr: string;
  maxFloor: number;
  maxUnitsPerFloor: number;
  floors: Array<{
    floor: number;
    units: Array<{
      id: string;
      number: string;
      column: number;     // position in floor
      type: string;
      status: string;
      area: number;
      price: number;
    } | null>;            // null for empty positions
  }>;
}
```

---

## 7. Interactive States

### Loading

- Grid: Skeleton grid with pulsing cells (match grid dimensions)
- Status bar: Skeleton segmented bar
- Table: 10 skeleton rows
- Building tabs: Visible with skeleton badges

### Empty States

| Context | Message | CTA |
|---------|---------|-----|
| No units at all | "No units configured for this property. Add units to start managing inventory." | "Add Units" + "Bulk Import" buttons |
| No results (filters) | "No units match your filters. Try adjusting your criteria." | "Clear Filters" |
| No building data | "Building layout not configured." | "Configure Buildings" |

### Error States

- Grid load error: Full-section error with retry
- Bulk update error: Toast with failure details + option to retry
- Unit detail error: Error message in sheet

### Optimistic Updates

- Status change: Immediately update cell color, revert on API error
- Bulk status: Progress bar during batch operation, cells update sequentially
- Selection: Instant visual feedback (ring + slight scale)

### Performance

- Virtual scrolling for grids with >200 units
- Grid cells rendered with `content-visibility: auto` for large buildings
- Table: Virtual table rows for >100 units
- Status summary: Separate API call, cached 30s
