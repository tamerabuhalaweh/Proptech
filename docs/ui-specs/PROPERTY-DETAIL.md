# Property Detail Page Specification

> Single property view — units grid, building blocks, pricing matrix, media gallery
> Route: `/properties/:slug`

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumb: Properties > Al Noor Residential Tower          │
│                                                              │
│ Property Header                                              │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ ┌────────┐  Al Noor Residential Tower        [Edit] [⋯]  ││
│ │ │  IMG   │  📍 Al Olaya District, Riyadh                  ││
│ │ │ thumb  │  [Active] [Residential]                        ││
│ │ └────────┘  Built: 1445 AH | 120 Units | 12 Floors       ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Tab Navigation                                               │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ [Overview] [Units] [Pricing] [Media] [Documents] [Finance]││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ OVERVIEW TAB ═══                                         │
│                                                              │
│ KPI Row (4 cards)                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Total    │ │ Occupancy│ │ Revenue  │ │ Avg Rent │        │
│ │ Units    │ │ Rate     │ │ (MTD)    │ │ per sqm  │        │
│ │ 120      │ │ 92%      │ │ SAR 890K │ │ SAR 45   │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│ Two Column Layout                                            │
│ ┌───────────────────────┐ ┌─────────────────────────┐       │
│ │ Unit Status Breakdown │ │ Property Details         │       │
│ │ ┌───────────────────┐ │ │ ────────────────         │       │
│ │ │ ■■■■■■■■■□□       │ │ │ Type: Residential        │       │
│ │ │ Available: 10     │ │ │ Year Built: 1445 AH      │       │
│ │ │ Reserved:   8     │ │ │ Total Area: 15,000 sqm   │       │
│ │ │ Occupied:  92     │ │ │ Floors: 12               │       │
│ │ │ Blocked:   10     │ │ │ Parking: 200 spots       │       │
│ │ └───────────────────┘ │ │ Developer: Al Noor Group  │       │
│ │                       │ │ Manager: Ahmed Hassan     │       │
│ │ Revenue by Month      │ │                           │       │
│ │ ┌───────────────────┐ │ │ Amenities                │       │
│ │ │    ╱\             │ │ │ ────────                  │       │
│ │ │   ╱  \   ╱\      │ │ │ 🏊 Pool  🅿 Parking       │       │
│ │ │  ╱    \_╱  \     │ │ │ 🏋 Gym   🛡 Security      │       │
│ │ │_╱            \_   │ │ │ 🌿 Garden 🕌 Mosque       │       │
│ │ └───────────────────┘ │ │                           │       │
│ └───────────────────────┘ └─────────────────────────┘       │
│                                                              │
│ Building Blocks Visualization (Full Width)                   │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Building A               Building B                       ││
│ │ ┌──────────────────┐    ┌──────────────────┐             ││
│ │ │ F12 │101│102│103│    │ F8  │201│202│203│             ││
│ │ │ F11 │   │   │   │    │ F7  │   │   │   │             ││
│ │ │ F10 │   │   │   │    │ F6  │   │   │   │             ││
│ │ │ F9  │   │   │   │    │ F5  │   │   │   │             ││
│ │ │ ... │   │   │   │    │ ... │   │   │   │             ││
│ │ └──────────────────┘    └──────────────────┘             ││
│ │ Legend: ■ Available ■ Reserved ■ Occupied ■ Blocked      ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ UNITS TAB ═══                                            │
│ (See INVENTORY-GRID.md for full spec)                        │
│                                                              │
│ ═══ PRICING TAB ═══                                          │
│ Pricing Matrix                                               │
│ ┌───────────────────────────────────────────────────────────┐│
│ │          │ Studio │ 1BR    │ 2BR    │ 3BR    │ Penthouse ││
│ │──────────│────────│────────│────────│────────│───────────││
│ │ Floor 1-3│ 35,000 │ 55,000 │ 75,000 │ 95,000 │     —     ││
│ │ Floor 4-6│ 38,000 │ 58,000 │ 78,000 │ 98,000 │     —     ││
│ │ Floor 7-9│ 42,000 │ 62,000 │ 82,000 │102,000 │     —     ││
│ │ Floor 10+│ 48,000 │ 68,000 │ 88,000 │108,000 │ 250,000   ││
│ │──────────│────────│────────│────────│────────│───────────││
│ │ Average  │ 40,750 │ 60,750 │ 80,750 │100,750 │ 250,000   ││
│ └───────────────────────────────────────────────────────────┘│
│ [Edit Pricing] [Export Matrix]                               │
│                                                              │
│ ═══ MEDIA TAB ═══                                            │
│ Media Gallery                                                │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ [All] [Exterior] [Interior] [Floor Plans] [360°]         ││
│ │                                                           ││
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     ││
│ │ │      │ │      │ │      │ │      │                     ││
│ │ │ IMG1 │ │ IMG2 │ │ IMG3 │ │ IMG4 │                     ││
│ │ │      │ │      │ │      │ │      │                     ││
│ │ └──────┘ └──────┘ └──────┘ └──────┘                     ││
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     ││
│ │ │      │ │      │ │      │ │ + Add│                     ││
│ │ │ IMG5 │ │ IMG6 │ │ IMG7 │ │ More │                     ││
│ │ └──────┘ └──────┘ └──────┘ └──────┘                     ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)

- Header: Stack image above text
- KPI cards: 2×2 grid
- Two-column sections: Stack full-width
- Building blocks: Horizontal scroll
- Pricing matrix: Horizontal scroll
- Gallery: 2-column grid

### Mobile (<768px)

- Header: Compact card with image banner
- KPI cards: Horizontal scroll
- Tabs: Scrollable horizontal tabs
- Building blocks: Single building view with swipe
- Pricing matrix: Accordion by floor group or card layout
- Gallery: 2-column masonry, tap to lightbox

---

## 2. Component Breakdown

### 2.1 Property Header

**Components**: `Avatar`, `Badge`, `Button`, `DropdownMenu`, `Breadcrumb`

- Thumbnail: 80×80px rounded property image
- Title: `heading-1` with property name
- Address: `body-sm` with `MapPin` icon
- Status badges: `Badge` components for status + type
- Meta row: Built year, units, floors (icon + text chips)
- Actions: "Edit" `Button variant="outline"`, "More" `DropdownMenu` (Delete, Archive, Duplicate, Share)

### 2.2 Tab Navigation

**Components**: shadcn `Tabs`

- Tabs: Overview, Units, Pricing, Media, Documents, Finance
- Underline style (not pills)
- Scroll on mobile (horizontal overflow)
- URL-synced: `/properties/al-noor-tower?tab=units`
- Badge on tab: Show count where relevant (Units: 120, Documents: 8)

### 2.3 KPI Cards

Same as Dashboard KPI cards (see `DASHBOARD.md`), with property-specific metrics:

| KPI | Icon | Format |
|-----|------|--------|
| Total Units | `Grid3X3` | Integer |
| Occupancy Rate | `PieChart` | Percentage with progress ring |
| Revenue (MTD) | `TrendingUp` | SAR currency |
| Avg Rent/sqm | `DollarSign` | SAR per sqm |

### 2.4 Unit Status Breakdown

**Components**: Custom `StatusBar`, `Legend`

- Horizontal stacked bar chart showing unit status proportions
- Below: Legend with color dot + label + count for each status
- Clickable: Clicking a status filters the Units tab
- Alternatively: Mini donut chart

### 2.5 Property Details Card

**Components**: `Card`, custom `DetailRow`

- Two-column key-value list
- Keys: `caption` size, muted color
- Values: `body` size, regular weight
- Sections: Basic Info, Location, Management, Amenities
- Amenities: Icon grid (2-3 columns of icon + label)

### 2.6 Building Blocks Visualization

**Components**: Custom `BuildingVisualization` (see COMPONENTS.md)

- Visual representation of building structure
- Each building as a grid: floors (rows) × units (columns)
- Cells color-coded by unit status
- Floor labels on inline-start axis
- Unit numbers inside cells
- Click cell → opens unit detail modal or navigates to unit
- Hover: Tooltip with unit number, type, status, price
- If multiple buildings: Horizontal scrollable or tab-per-building
- Legend bar at bottom

### 2.7 Pricing Matrix

**Components**: shadcn `Table`, custom `EditableCell`

- Cross-tabulation: Floor groups (rows) × Unit types (columns)
- Values: Annual rent in SAR
- Editable mode: Click "Edit Pricing" → cells become inputs
- Average row at bottom (auto-calculated)
- Comparison: Toggle to show price per sqm
- Color coding: Gradient from low (cool) to high (warm)
- Export: CSV/Excel download

### 2.8 Media Gallery

**Components**: Custom `MediaGallery`, `Dialog` (lightbox)

- Category tabs/filters: All, Exterior, Interior, Floor Plans, 360°
- Grid layout: 4 columns desktop, 3 tablet, 2 mobile
- Each item: Image thumbnail with hover overlay showing title
- Click: Opens lightbox with navigation (prev/next)
- Upload: Drag-and-drop zone or file picker
- Reorder: Drag to rearrange
- Types supported: Images (jpg, png, webp), PDFs (floor plans), 360° panoramas
- Video support: Embedded player for property videos

### 2.9 Documents Tab

**Components**: shadcn `Table`, `Badge`, `Button`

- List of documents associated with property
- Columns: Name, Type, Category, Date Uploaded, Uploaded By, Actions
- Categories: Legal, Contracts, Floor Plans, Reports, Permits
- Upload: Drag-and-drop zone at top
- Preview: PDF viewer in side sheet or new tab
- Bulk download: Select + download zip

### 2.10 Finance Tab

- Revenue chart (monthly, same style as dashboard)
- Recent transactions table
- Outstanding balances
- Collection summary
- Link to full finance module

---

## 3. Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | Banner image + stacked info | Side-by-side compact | Full horizontal |
| Tabs | Scrollable pills | Scrollable underline | Full underline |
| KPI Cards | Horizontal scroll | 2×2 grid | 4-column row |
| Details + Charts | Full-width stacked | Full-width stacked | 2-column side by side |
| Building blocks | Single building, swipe | Horizontal scroll | Side by side |
| Pricing matrix | Accordion by floor | Horizontal scroll table | Full table |
| Gallery | 2-col masonry | 3-col grid | 4-col grid |
| Documents | Card layout | Table | Table |

---

## 4. RTL Considerations

### Header

- Thumbnail: `inline-start` (left in LTR, right in RTL)
- Action buttons: `inline-end`
- Address pin icon: `inline-start` of address text
- Badge flow: Natural inline flow (auto-reverses)

### Tabs

- Tab bar: `flex` direction auto-reverses
- Scroll direction: Natural (inline-start to inline-end)
- Active underline: Position follows tab (auto)

### Building Blocks

- Floor labels: Position at `inline-start` of grid
- Units: Read from `inline-start` to `inline-end`
- Building labels: `text-start`
- Tooltip: Align to pointer position (auto)

### Pricing Matrix

- Row headers (floor groups): `inline-start` column, `text-start`
- Values: `text-end` (numbers)
- Column headers: `text-center`

### Gallery

- Grid: Auto-mirrors (CSS Grid)
- Lightbox navigation: Prev at `inline-start`, Next at `inline-end`
- Upload zone: Text centered, no direction dependency

### Property Details

- Key-value pairs: Key at `inline-start`, value at `inline-end`
- Amenity icons: Grid auto-mirrors

---

## 5. Accessibility

### Page Structure

```html
<main>
  <nav aria-label="Breadcrumb">...</nav>
  
  <article aria-label="Al Noor Residential Tower">
    <header>
      <h1>Al Noor Residential Tower</h1>
      <p>Al Olaya District, Riyadh</p>
    </header>
    
    <div role="tablist" aria-label="Property sections">
      <button role="tab" aria-selected="true">Overview</button>
      <button role="tab" aria-selected="false">Units</button>
      ...
    </div>
    
    <div role="tabpanel" aria-label="Overview">
      <section aria-label="Key metrics">...</section>
      <section aria-label="Unit status breakdown">...</section>
      <section aria-label="Property details">...</section>
      <section aria-label="Building layout">...</section>
    </div>
  </article>
</main>
```

### Building Blocks

- `role="grid"` with `role="row"` and `role="gridcell"`
- Each cell: `aria-label="Unit 101, Floor 1, Available, Studio"`
- Arrow key navigation within grid
- Color coding supplemented with pattern fills for colorblind users
- Legend: `role="list"` with `role="listitem"`

### Pricing Matrix

- Standard `<table>` with `<th scope="col">` and `<th scope="row">`
- `<caption>`: "Annual rent pricing matrix in SAR"
- Editable cells: `role="spinbutton"` or `<input type="number">`

### Media Gallery

- Images: `alt` text describing content
- Lightbox: Focus trap, `Escape` to close, arrow keys to navigate
- Upload zone: `role="button"` with `aria-label="Upload media files"`
- Each image: Focusable, `Enter` to view

---

## 6. Data Requirements

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/properties/:id` | GET | Full property details |
| `GET /api/properties/:id/units` | GET | Units list (paginated) |
| `GET /api/properties/:id/pricing` | GET | Pricing matrix |
| `PUT /api/properties/:id/pricing` | PUT | Update pricing matrix |
| `GET /api/properties/:id/media` | GET | Media files list |
| `POST /api/properties/:id/media` | POST | Upload media (multipart) |
| `DELETE /api/properties/:id/media/:mediaId` | DELETE | Remove media |
| `GET /api/properties/:id/documents` | GET | Documents list |
| `GET /api/properties/:id/finance` | GET | Finance summary |
| `GET /api/properties/:id/activity` | GET | Activity log |

### Response Shape (Property Detail)

```typescript
interface PropertyDetail {
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
    postalCode: string;
    coordinates: { lat: number; lng: number; };
  };
  
  details: {
    yearBuilt: string;         // Hijri year
    yearBuiltGregorian: number;
    totalArea: number;         // sqm
    builtUpArea: number;
    numberOfFloors: number;
    numberOfBuildings: number;
    parkingSpots: number;
    developer: string;
    developerAr: string;
  };
  
  amenities: Array<{
    id: string;
    icon: string;       // Lucide icon name
    name: string;
    nameAr: string;
  }>;
  
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  
  stats: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    occupiedUnits: number;
    blockedUnits: number;
    occupancyRate: number;
    revenueMTD: number;
    revenueYTD: number;
    avgRentPerSqm: number;
  };
  
  buildings: Array<{
    id: string;
    name: string;
    nameAr: string;
    floors: number;
    units: Array<{
      id: string;
      number: string;
      floor: number;
      type: string;
      status: 'available' | 'reserved' | 'occupied' | 'blocked' | 'maintenance';
      area: number;
      price?: number;
    }>;
  }>;
  
  coverImage?: { url: string; blurHash: string; };
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    blurHash: string;
    category: string;
    title: string;
    titleAr: string;
    order: number;
  }>;
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Interactive States

### Loading

- Header: Skeleton (image rect + text lines)
- Tabs: Visible but disabled during load
- KPI cards: 4 skeleton cards
- Building blocks: Gray grid placeholder
- Gallery: Skeleton image grid (6-8 rectangles)

### Empty States

| Section | Message | CTA |
|---------|---------|-----|
| Units | "No units configured yet." | "Add Units" button |
| Pricing | "No pricing data. Set up your pricing matrix." | "Configure Pricing" |
| Media | "No media uploaded. Add photos and documents." | "Upload Files" with drag zone |
| Documents | "No documents yet. Upload contracts and permits." | "Upload Documents" |
| Finance | "No financial data available for this property." | "Set Up Billing" |

### Error States

- Tab content error: Error card with retry inside tab panel
- Image load error: Placeholder with broken image icon
- Pricing save error: Toast with "Failed to save" + retry

### Editing States

- Edit mode toggle: "Edit" button in header → page enters edit mode
- Editable fields: Highlighted with subtle border, input icons
- Save/Cancel bar: Sticky at bottom during edit mode
- Unsaved changes: Warning on navigation attempt
- Optimistic pricing updates: Immediate UI update, revert on error
