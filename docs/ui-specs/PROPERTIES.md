# Properties Listing Page Specification

> Property listing with grid/list view, filters, and optional map view
> Route: `/properties`

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ "Properties"              │ [+ Add Property] primary btn  ││
│ │ "24 properties"           │                               ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Toolbar                                                      │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ 🔍 Search │ Type ▾ │ Status ▾ │ City ▾ │ [Grid] [List]   ││
│ │           │        │          │        │ [Map]   Sort ▾   ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Active Filters (chips row, if any active)                    │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ [Residential ✕] [Riyadh ✕] [Available ✕]  Clear all      ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ GRID VIEW ═══                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│ │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │                      │
│ │ │ IMG  │ │ │ │ IMG  │ │ │ │ IMG  │ │                      │
│ │ └──────┘ │ │ └──────┘ │ │ └──────┘ │                      │
│ │ Al Noor  │ │ Riyadh   │ │ Jeddah   │                      │
│ │ Tower    │ │ Heights  │ │ Plaza    │                      │
│ │ 📍 Riyadh│ │ 📍 Riyadh│ │ 📍 Jeddah│                      │
│ │ 120 units│ │ 85 units │ │ 64 units │                      │
│ │ 92% occ. │ │ 88% occ. │ │ 78% occ. │                      │
│ │ ●●●○     │ │ ●●●○     │ │ ●●○○     │                      │
│ └──────────┘ └──────────┘ └──────────┘                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│ │   ...    │ │   ...    │ │   ...    │                      │
│ └──────────┘ └──────────┘ └──────────┘                      │
│                                                              │
│ Pagination                                                   │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Showing 1-12 of 24  │  ‹ 1 [2] 3 ›  │ 12 per page ▾     ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

═══ LIST VIEW ═══
┌───────────────────────────────────────────────────────────┐
│ □ │ 🖼 │ Property Name │ Type  │ City  │ Units │ Occ. │ ⋯│
│───│────│───────────────│───────│───────│───────│──────│───│
│ □ │ 🖼 │ Al Noor Tower │ Resi… │ Riyadh│  120  │ 92%  │ ⋯│
│ □ │ 🖼 │ Riyadh Heights│ Mixed │ Riyadh│   85  │ 88%  │ ⋯│
│ □ │ 🖼 │ Jeddah Plaza  │ Comm… │ Jeddah│   64  │ 78%  │ ⋯│
└───────────────────────────────────────────────────────────┘

═══ MAP VIEW ═══
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────┐ ┌───────────────────────┐│
│ │                             │ │ Property List         ││
│ │        🗺️ MAP               │ │ (scrollable sidebar)  ││
│ │                             │ │                       ││
│ │   📍   📍                   │ │ ┌─────────────────┐   ││
│ │        📍     📍            │ │ │ Al Noor Tower   │   ││
│ │   📍        📍              │ │ │ 📍 Riyadh       │   ││
│ │                             │ │ │ 120 units       │   ││
│ │   📍         📍             │ │ └─────────────────┘   ││
│ │                             │ │ ┌─────────────────┐   ││
│ │                             │ │ │ Riyadh Heights  │   ││
│ │                             │ │ └─────────────────┘   ││
│ └─────────────────────────────┘ └───────────────────────┘│
└───────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)

- Grid: 2 columns
- List: Full-width table with horizontal scroll
- Map: Full-width map above, cards below (stacked)
- Filters: Collapsible filter sheet (button to open)

### Mobile (<768px)

- Grid: 1 column (full-width cards)
- List: Card layout (no table)
- Map: Full-screen map with bottom sheet for property list
- Filters: Full-screen filter sheet
- Search: Full-width sticky below topbar
- Add Property: FAB (floating action button) bottom-right

---

## 2. Component Breakdown

### 2.1 Page Header

**Components**: `heading-1`, `body-sm`, `Button`

- Title: "Properties" with count badge
- CTA: "+ Add Property" `Button variant="primary" size="lg"`
- Mobile: Title only, Add button becomes FAB

### 2.2 Toolbar

**Components**: `Input`, `Select`, `ToggleGroup`, `Button`, `DropdownMenu`

#### Search

- Debounced search input (300ms)
- Searches property name, address, ID
- `dir="auto"` for mixed language input
- Clear button (X) when has value
- Icon: `Search` at inline-start

#### Filters

| Filter | Type | Options |
|--------|------|---------|
| Property Type | Multi-select dropdown | Residential, Commercial, Mixed-Use, Land |
| Status | Multi-select dropdown | Active, Under Construction, Completed, Archived |
| City | Multi-select dropdown with search | Dynamic from API (Riyadh, Jeddah, Dammam, etc.) |
| Occupancy Range | Dual-range slider | 0% – 100% |
| Units Range | Dual-range slider | Min – Max |

- Each filter uses shadcn `Popover` + `Command` for searchable multi-select
- Active filter count shown as badge on filter button

#### View Toggle

- `ToggleGroup` with 3 options: Grid, List, Map
- Icons: `LayoutGrid`, `List`, `Map`
- Persisted in user preferences

#### Sort

- `DropdownMenu` with options:
  - Name (A-Z / Z-A)
  - Date Added (newest / oldest)
  - Occupancy (highest / lowest)
  - Units (most / fewest)
  - Revenue (highest / lowest)

### 2.3 Active Filter Chips

**Components**: Custom `FilterChip` using shadcn `Badge`

- Row of chips showing active filters
- Each chip: label + `X` close button
- "Clear all" text button at end
- Hidden when no filters active
- Horizontal scroll on mobile

### 2.4 Property Card (Grid View)

**Components**: Custom `PropertyCard` (see COMPONENTS.md)

```
┌────────────────────────┐
│ ┌────────────────────┐ │
│ │                    │ │  Image: 16:10 aspect ratio
│ │    Property Image  │ │  Fallback: Building icon on muted bg
│ │                    │ │  Badge: Status overlay (top-right)
│ │         [Active]   │ │
│ └────────────────────┘ │
│                        │
│ Al Noor Residential     │  Property name (heading-3)
│ Tower                   │
│ 📍 Al Olaya, Riyadh     │  Location (body-sm, muted)
│                        │
│ ┌──────┐ ┌──────┐      │
│ │ 120  │ │ 92%  │      │  Stats row: units, occupancy
│ │units │ │ occ. │      │
│ └──────┘ └──────┘      │
│                        │
│ ●●●○ Residential       │  Type indicator dots + label
│                        │
│ ┌────────┐ ┌────────┐  │  Action row (on hover desktop)
│ │ View   │ │  ⋯    │  │
│ └────────┘ └────────┘  │
└────────────────────────┘
```

- Hover: Subtle `shadow-sm` → `shadow-md` transition
- Click: Navigates to property detail
- Image: Lazy loaded with blur placeholder
- Status badge: Colored overlay badge at top-right of image
- Occupancy: Visual progress bar below stats

### 2.5 Property Table (List View)

**Components**: shadcn `Table`, `Checkbox`, `Badge`, `DropdownMenu`

| Column | Type | Sortable | Width |
|--------|------|----------|-------|
| Checkbox | Selection | No | 40px |
| Image | Thumbnail (40×40) | No | 56px |
| Property Name | Text + subtitle (address) | Yes | flex |
| Type | Badge | Yes | 120px |
| City | Text | Yes | 120px |
| Units | Number | Yes | 80px |
| Occupancy | Progress bar + % | Yes | 140px |
| Revenue (MTD) | Currency | Yes | 140px |
| Status | Badge | Yes | 100px |
| Actions | Dropdown menu | No | 60px |

- Bulk actions: Select rows → toolbar shows "3 selected" + Bulk Actions dropdown (Archive, Export, Compare)
- Row click: Navigate to property detail
- Actions menu: View, Edit, Duplicate, Archive, Delete

### 2.6 Map View

**Components**: Custom `PropertyMap` using a map library (Mapbox GL or Google Maps)

- Full-height map (calc(100vh - topbar - toolbar))
- Property markers: Custom pins with property type icon
- Marker cluster: Group nearby properties, show count
- Click marker → popup with mini property card
- Side panel: Scrollable property list (desktop), bottom sheet (mobile)
- Map controls: Zoom, locate me, satellite toggle
- RTL: Map controls position at `inline-end`

### 2.7 Pagination

**Components**: shadcn `Pagination`, `Select`

- "Showing X-Y of Z" text
- Page numbers with prev/next arrows
- Per-page selector: 12 / 24 / 48 / 96
- Mobile: Simplified "Load more" button or infinite scroll

---

## 3. Responsive Behavior

| Element | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Page header | Title + FAB | Title + button | Title + button |
| Toolbar | Stacked search + filter button | Inline | Inline |
| Filters | Full-screen sheet | Sheet/popover | Inline dropdowns |
| View toggle | Hidden (default grid) | Visible | Visible |
| Grid columns | 1 | 2 | 3 |
| Card actions | Always visible | On hover | On hover |
| Map view | Full-screen + bottom sheet | Split horizontal | Split vertical |
| Pagination | Load more button | Pagination | Pagination |
| Bulk select | Long-press to enter selection mode | Checkbox column | Checkbox column |

---

## 4. RTL Considerations

### Grid Layout

- CSS Grid auto-mirrors (no changes needed for column order)
- Card content alignment: `text-start` (automatic RTL handling)
- Property image badge: Use `absolute top-2 end-2` (not `right-2`)

### List/Table

- Checkbox column stays at `inline-start`
- Text columns: `text-start`
- Number/currency columns: `text-end`
- Actions column: `inline-end`
- Sort icons: Remain at `inline-end` of header cell

### Search & Filters

- Search icon: `inline-start` position (auto-flips)
- Clear button: `inline-end` (auto-flips)
- Filter dropdown alignment: `align="start"` (Radix handles RTL)
- Filter chips: Row direction auto-reverses

### Map

- Controls: Move to `inline-end` side
- Popup/info window: Text alignment follows `dir`
- Side panel: At `inline-end` (right in LTR, left in RTL)

### Pagination

- Page numbers: LTR direction maintained (numbers don't reverse)
- Prev/Next arrows: Mirror via Radix direction awareness
- "Showing X-Y of Z": Translated, number order maintained

---

## 5. Accessibility

### Page Structure

```html
<main>
  <header>
    <h1>Properties <span class="sr-only">(24 total)</span></h1>
  </header>
  
  <section aria-label="Property filters">
    <form role="search">
      <input aria-label="Search properties" />
    </form>
    <!-- filters -->
  </section>
  
  <section aria-label="Active filters">
    <ul role="list">
      <li><button aria-label="Remove filter: Residential">Residential ✕</button></li>
    </ul>
  </section>
  
  <section aria-label="Property listings">
    <!-- Grid: role="list" with role="listitem" -->
    <!-- Table: standard table markup -->
  </section>
  
  <nav aria-label="Pagination">...</nav>
</main>
```

### Grid View

- Cards: `role="listitem"` within `role="list"` container
- Card: `role="article"` with `aria-label="Al Noor Tower, Riyadh, 120 units"`
- Image: `alt="Al Noor Tower exterior photo"`
- Status badge: `aria-label="Status: Active"`
- Card click: Entire card is a link (`<a>`) wrapping content, or card has `role="link"`

### List View

- Standard `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`
- Sortable columns: `aria-sort="ascending|descending|none"`
- Sort button: `aria-label="Sort by occupancy, currently ascending"`
- Row selection: `aria-checked` on checkbox, `aria-label="Select Al Noor Tower"`
- Bulk actions: Announced via `aria-live` region "3 properties selected"

### Filters

- Filter triggers: `aria-expanded`, `aria-haspopup="listbox"`
- Active filter count: `aria-label="Property type filter, 2 selected"`
- Clear all: `aria-label="Clear all filters"`

### Map

- Map: `role="application"` with `aria-label="Property locations map"`
- Provide list alternative (all properties visible in side panel)
- Marker popups: Focusable, keyboard-dismissable

---

## 6. Data Requirements

### API Endpoints

| Endpoint | Method | Params |
|----------|--------|--------|
| `GET /api/properties` | GET | `search`, `type[]`, `status[]`, `city[]`, `occupancyMin`, `occupancyMax`, `sortBy`, `sortOrder`, `page`, `perPage` |
| `GET /api/properties/map` | GET | `bounds` (lat/lng bounding box), `type[]`, `status[]` |
| `GET /api/properties/filters` | GET | — (returns available filter options: cities, types, etc.) |
| `POST /api/properties` | POST | Property creation payload |
| `DELETE /api/properties/:id` | DELETE | — |
| `PATCH /api/properties/bulk` | PATCH | `ids[]`, `action` (archive, unarchive) |

### Response Shape

```typescript
interface PropertyListResponse {
  data: PropertySummary[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

interface PropertySummary {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  type: 'residential' | 'commercial' | 'mixed' | 'land';
  status: 'active' | 'under_construction' | 'completed' | 'archived';
  address: {
    street: string;
    streetAr: string;
    city: string;
    cityAr: string;
    district: string;
    districtAr: string;
    coordinates: { lat: number; lng: number; };
  };
  coverImage?: { url: string; blurHash: string; };
  stats: {
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    revenueMTD: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Interactive States

### Loading

- Grid: 6 skeleton property cards (image placeholder + text lines)
- List: 10 skeleton table rows (pulse animation)
- Map: Map loads with spinner overlay, markers appear progressively
- Filters: Skeleton select buttons

### Empty States

| Context | Message | Illustration | CTA |
|---------|---------|-------------|-----|
| No properties at all | "No properties yet. Add your first property to get started." | Building illustration | "Add Property" button |
| No results (filters) | "No properties match your filters. Try adjusting your criteria." | Empty search illustration | "Clear filters" button |
| No results (search) | "No properties found for '{query}'." | Search illustration | "Clear search" |

### Error States

- API error: Inline error card with "Failed to load properties" + retry button
- Pagination error: Toast notification + retry
- Map load error: Fallback to list/grid view with info banner

### Optimistic Updates

- Archive property: Immediately remove from list, undo toast (5s)
- Bulk actions: Progress indicator during batch operation
