# Leads & CRM Page Specification

> Lead management with kanban pipeline, lead cards, scoring badges
> Route: `/leads`

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ "Leads & CRM"             │ [+ New Lead] [Import] [⚙️]   ││
│ │ "156 active leads"         │                              ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Toolbar                                                      │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ 🔍 Search │ Score ▾ │ Source ▾ │ Agent ▾ │ Date ▾        ││
│ │           │         │          │         │ [Kanban][Table] ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ Pipeline Summary                                             │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ New(32) → Contacted(28) → Qualified(18) → Viewing(12)    ││
│ │ → Negotiation(8) → Won(42) → Lost(16)                    ││
│ │ Conversion Rate: 27%  │ Avg Time to Close: 14 days        ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ KANBAN VIEW ═══                                          │
│                                                              │
│ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐│
│ │ NEW     │ │CONTACTED │ │QUALIFIED │ │ VIEWING │ │NEGOTI…│ │
│ │ (32)    │ │ (28)     │ │ (18)     │ │ (12)    │ │ (8)   │ │
│ │─────────│ │──────────│ │──────────│ │─────────│ │───────│ │
│ │┌───────┐│ │┌────────┐│ │┌────────┐│ │┌───────┐│ │┌─────┐│ │
│ ││Ahmed  ││ ││Fatima  ││ ││Khalid  ││ ││Sara   ││ ││Omar  ││ │
│ ││Al-Q.  ││ ││Hassan  ││ ││Ibrahim ││ ││Ahmed  ││ ││Nasr ││ │
│ ││       ││ ││        ││ ││        ││ ││       ││ ││     ││ │
│ ││🔴 Hot ││ ││🟡 Warm ││ ││🔴 Hot  ││ ││🟡 Warm││ ││🔴Hot││ │
│ ││📍Riyadh││ ││📍Jeddah││ ││📍Riyadh││ ││📍Damam││ ││📍Riy││ │
│ ││🏢 2BR  ││ ││🏢 3BR  ││ ││🏢 Villa││ ││🏢 1BR ││ ││🏢3BR││ │
│ ││SAR 2M  ││ ││SAR 500K││ ││SAR 3.5M││ ││SAR 80K││ ││SAR1M││ │
│ │└───────┘│ │└────────┘│ │└────────┘│ │└───────┘│ │└─────┘│ │
│ │┌───────┐│ │┌────────┐│ │┌────────┐│ │┌───────┐│ │       │ │
│ ││...    ││ ││...     ││ ││...     ││ ││...    ││ │       │ │
│ │└───────┘│ │└────────┘│ │└────────┘│ │└───────┘│ │       │ │
│ │ +3 more │ │ +5 more  │ │          │ │         │ │       │ │
│ └─────────┘ └──────────┘ └──────────┘ └─────────┘ └───────┘ │
│                                                              │
│ ═══ TABLE VIEW ═══                                           │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ □ │ Name       │Score│ Stage     │Source│Agent │Property  ││
│ │───│────────────│─────│───────────│──────│──────│──────────││
│ │ □ │ Ahmed      │ 🔴85│ New       │Web   │Saad  │ 2BR Olaya││
│ │ □ │ Fatima     │ 🟡62│ Contacted │Ref.  │Huda  │ 3BR Corni││
│ │ □ │ Khalid     │ 🔴91│ Qualified │Walk  │Saad  │ Villa    ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Lead Card Detail (Expanded / Click)

```
┌───────────────────────────────────────┐
│ Ahmed Al-Qahtani                 [X] │
│ 🔴 Hot Lead (Score: 85)              │
│ ──────────────────                    │
│                                       │
│ Contact                               │
│ 📱 +966 50 123 4567                   │
│ ✉️  ahmed@email.com                   │
│ 💬 WhatsApp preferred                │
│                                       │
│ Interest                              │
│ 🏢 2BR Apartment                     │
│ 📍 Al Olaya, Riyadh                  │
│ 💰 Budget: SAR 1.5M - 2M            │
│ 📅 Timeline: 3 months                │
│                                       │
│ Activity Timeline                     │
│ ● Today: Call scheduled at 2:00 PM   │
│ ● Yesterday: Brochure sent           │
│ ● Mar 8: Initial inquiry (Website)   │
│                                       │
│ Notes                                 │
│ "Looking for family apartment near    │
│  schools. Prefers higher floors."     │
│                                       │
│ Assigned: Saad Al-Harbi              │
│ Source: Website Form                  │
│ Created: 8 March 2026                │
│                                       │
│ [📞 Call] [✉️ Email] [💬 WhatsApp]    │
│ [Move to →] [Edit] [Archive]         │
└───────────────────────────────────────┘
```

### Tablet (768px–1023px)

- Kanban: 3 visible columns + horizontal scroll
- Pipeline summary: 2-row layout
- Table: Full-width with horizontal scroll

### Mobile (<768px)

- Kanban: Single column view, swipe between stages
- Or: Card list with stage badge on each card
- Pipeline: Horizontal scroll pills
- Lead detail: Full-screen sheet
- Quick actions: FAB for "+ New Lead"
- Call/WhatsApp: Native dialer/app integration

---

## 2. Component Breakdown

### 2.1 Page Header

**Components**: `heading-1`, `body-sm`, `Button`, `DropdownMenu`

- Title + active leads count
- Actions:
  - "+ New Lead": `Button variant="primary"` → Opens lead creation form
  - "Import": `Button variant="outline"` → CSV import dialog
  - Settings: Pipeline stage customization

### 2.2 Pipeline Summary

**Components**: Custom `PipelineFunnel`, `Badge`

- Visual funnel showing stage progression with counts
- Flow: Arrows or connected dots showing the pipeline stages
- Conversion rate and avg close time KPIs
- Clickable stages: Filter kanban to that stage
- Color gradient: Light (New) → Dark (Won), with Red for Lost

### 2.3 Kanban Board

**Components**: Custom `PipelineBoard` (see COMPONENTS.md), uses `@dnd-kit/core`

#### Column Structure

```
<Column>
  ├── Header
  │   ├── Stage name + count badge
  │   ├── Total value in this stage
  │   └── Column menu (sort, filter, add lead)
  ├── Card Stack (scrollable)
  │   ├── LeadCard
  │   ├── LeadCard
  │   └── ...
  └── Footer
      └── "+ Add Lead" button (ghost)
```

#### Pipeline Stages (Configurable)

| Stage | Color | Description |
|-------|-------|-------------|
| New | `bg-slate-100` header | Incoming leads, unprocessed |
| Contacted | `bg-blue-100` header | Initial contact made |
| Qualified | `bg-purple-100` header | Needs verified, budget confirmed |
| Viewing | `bg-cyan-100` header | Property viewing scheduled/completed |
| Negotiation | `bg-amber-100` header | Price/terms discussion |
| Won | `bg-green-100` header | Deal closed |
| Lost | `bg-red-100` header | Lead lost/rejected |

#### Drag & Drop

- Drag card between columns to change stage
- Visual feedback: Dragging card has `shadow-xl`, `scale(1.02)`, `opacity(0.9)`
- Drop zone: Column highlights with dashed border
- On drop: Optimistic update + API call
- Drop restrictions: "Won" stage may require confirmation dialog
- Touch: Long-press to start drag on mobile

### 2.4 Lead Card (Kanban)

**Components**: Custom `LeadCard` (see COMPONENTS.md)

```
┌─────────────────────────┐
│ 👤 Ahmed Al-Qahtani      │  Name + avatar
│                          │
│ 🔴 Hot  │ Score: 85      │  Score badge + number
│ 📍 Al Olaya, Riyadh      │  Location
│ 🏢 2BR Apartment         │  Interest type
│ 💰 SAR 1.5M - 2M         │  Budget range
│                          │
│ 📅 Call today 2PM        │  Next action (if any)
│                          │
│ ┌────┐ Saad  │ 2d ago    │  Agent avatar + name + time
│ └────┘                   │
└─────────────────────────┘
```

- **Compact mode**: Name, score badge, budget, agent — for dense boards
- **Standard mode**: Full card as above
- **Hover**: Slight lift (`shadow-sm` → `shadow-md`)
- **Click**: Opens lead detail sheet/modal

### 2.5 Lead Score Badge

**Components**: Custom `ScoreBadge`

| Score Range | Label | Color | Icon |
|-------------|-------|-------|------|
| 80-100 | Hot | `bg-red-100 text-red-700` | `Flame` |
| 50-79 | Warm | `bg-amber-100 text-amber-700` | `Sun` |
| 0-49 | Cold | `bg-gray-100 text-gray-600` | `Snowflake` |

- Circular badge with score number
- Optional: Ring/arc indicator showing score visually
- Tooltip: "Lead score: 85/100. Based on: engagement (high), budget match (yes), timeline (short)"

### 2.6 Lead Table

**Components**: shadcn `Table`, `Checkbox`, `Badge`, `Avatar`, `DropdownMenu`

| Column | Type | Sortable | Width |
|--------|------|----------|-------|
| Checkbox | Selection | No | 40px |
| Name | Text + avatar | Yes | 200px |
| Score | Score badge | Yes | 80px |
| Stage | Badge | Yes | 120px |
| Source | Text | Yes | 100px |
| Agent | Avatar + name | Yes | 160px |
| Property Interest | Text | Yes | 180px |
| Budget | Currency range | Yes | 160px |
| Last Activity | Relative time | Yes | 120px |
| Next Action | Text + date | Yes | 160px |
| Actions | Dropdown | No | 60px |

- Row click → open lead detail
- Bulk actions: Assign agent, change stage, export, delete
- Quick filters: Toggle Won/Lost visibility
- Sortable by score (default: highest first)

### 2.7 Lead Detail Panel

**Components**: shadcn `Sheet`, `Tabs`, `Timeline`, `Form`, `Select`

- Side sheet, 480px wide (desktop), full-screen (mobile)
- Tabs: Overview, Activity, Notes, Tasks, Documents

#### Overview Tab

- Contact info: Name, phone (click-to-call), email, WhatsApp
- Interest: Property type, location, budget, timeline, specific unit (if identified)
- Score breakdown: Visual bars showing scoring factors
- Assigned agent: Avatar + name + reassign dropdown

#### Activity Timeline

- Chronological list of interactions
- Types: Call, Email, Meeting, Note, Status Change, System Event
- Each item: Icon + title + description + timestamp + actor
- Add activity: Button at top to log new interaction
- Auto-generated: Stage changes, assignments

#### Notes Tab

- Rich text editor for notes
- Each note: Content + author + timestamp
- Markdown support
- @mention other team members

#### Tasks Tab

- Task list with checkbox completion
- Due date, assigned to, priority
- Types: Call, Email, Meeting, Follow-up, Send Docs

### 2.8 New Lead Form

**Components**: shadcn `Dialog`, `Form`, `Input`, `Select`, `Textarea`

```
Fields:
├── Contact Information
│   ├── Full Name (ar/en) *
│   ├── Phone Number * (with country code +966)
│   ├── Email
│   ├── Preferred Contact Method (Phone/Email/WhatsApp)
│   └── Preferred Language (Arabic/English)
├── Interest
│   ├── Looking to (Buy/Rent) *
│   ├── Property Type (dropdown)
│   ├── City (dropdown)
│   ├── District (optional)
│   ├── Budget Range (min/max SAR)
│   ├── Bedrooms (select)
│   └── Timeline (select: Immediately, 1-3 months, 3-6 months, 6+ months)
├── Assignment
│   ├── Assign to Agent (dropdown)
│   └── Source (Website, Walk-in, Referral, Social Media, Phone, Other)
└── Notes
    └── Initial Notes (textarea)
```

- Multi-step on mobile (wizard)
- Single page on desktop
- Validation: Phone format, required fields
- Auto-score: Initial score calculated on save based on completeness + criteria

---

## 3. Responsive Behavior

| Element | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Header | Title + FAB for new lead | Inline | Full inline |
| Pipeline summary | Scrollable pills | 2-row | Single row |
| Kanban columns | 1 visible, swipe | 3 visible, scroll | All visible (5-7) |
| Lead cards | Full-width | Standard width | Standard width |
| Card density | Standard only | Toggle compact/standard | Toggle compact/standard |
| Drag & drop | Long-press to drag | Drag | Drag |
| Lead detail | Full-screen sheet | Side sheet 480px | Side sheet 480px |
| Table view | Card layout | Scroll table | Full table |
| New lead form | Multi-step wizard | Single page dialog | Single page dialog |
| Quick actions | Bottom sheet | Context menu | Context menu |

---

## 4. RTL Considerations

### Kanban Board

- **Column order**: Pipeline flows `inline-start` → `inline-end`
  - LTR: New → Contacted → ... → Won (left to right)
  - RTL: New → Contacted → ... → Won (right to left)
- Use `flex` with natural direction (no explicit `flex-direction`)
- Horizontal scroll: Starts from `inline-start`
- Drag & drop: Works with direction-aware coordinates (`@dnd-kit` supports RTL)

### Lead Cards

- Avatar/icon: `inline-start`
- Score badge: `inline-end` of name row
- Contact icons: `inline-start`
- Timestamp: `inline-end`
- Budget: Numbers maintain LTR for readability in both languages (optional, configurable)

### Pipeline Funnel

- Flow direction: `inline-start` → `inline-end`
- Arrow/connector direction: Mirrors automatically

### Table

- Checkbox: `inline-start`
- Text columns: `text-start`
- Number/currency: `text-end`
- Actions: `inline-end`

### Lead Detail Sheet

- Slide from `inline-end`
- Close button: `inline-end`
- Timeline: Marker at `inline-start`, content flowing toward `inline-end`
- Form labels: `text-start` (above input in both directions)
- Phone input: Always LTR for number entry, label in current language

### Names

- Arabic names: Natural RTL rendering
- Mixed names: `dir="auto"` on name fields

---

## 5. Accessibility

### Kanban Board

```html
<section aria-label="Lead pipeline">
  <div role="listbox" aria-label="Pipeline stages" aria-orientation="horizontal">
    <div role="option" aria-selected="false" aria-label="New stage, 32 leads">
      <h3 id="stage-new">New (32)</h3>
      <div role="list" aria-labelledby="stage-new">
        <div role="listitem" aria-label="Ahmed Al-Qahtani, Hot lead, score 85">
          <!-- Lead card -->
        </div>
      </div>
    </div>
  </div>
</section>
```

### Drag & Drop

- Keyboard alternative: Select card → press `M` to enter move mode → arrow keys to choose column → `Enter` to drop
- Screen reader: "Moving Ahmed Al-Qahtani from New to Contacted. Press Enter to confirm, Escape to cancel."
- `aria-live="assertive"` for drag state announcements
- Alternative: "Move to" dropdown menu on each card (always available)

### Lead Cards

- Each card: `role="listitem"` with descriptive `aria-label`
- Score badge: `aria-label="Lead score: 85 out of 100, Hot"`
- Clickable: `role="button"` or wrapped in `<a>`
- Quick actions: Accessible via keyboard context menu

### Score Badge

- Not color-only: Includes text label (Hot/Warm/Cold) + icon
- Adequate contrast in both light and dark modes

### Table

- Standard table accessibility (same patterns as PROPERTIES.md)
- Row actions via keyboard-accessible dropdown

### Forms

- All inputs labeled
- Error messages linked with `aria-describedby`
- Required fields: `aria-required="true"` + visual asterisk
- Phone input: `type="tel"` with `inputMode="tel"`
- Focus management: Auto-focus first field on dialog open

---

## 6. Data Requirements

### API Endpoints

| Endpoint | Method | Params |
|----------|--------|--------|
| `GET /api/leads` | GET | `stage[]`, `score`, `source`, `agentId`, `search`, `sortBy`, `sortOrder`, `page`, `perPage`, `view` (kanban/table) |
| `GET /api/leads/pipeline` | GET | — (returns stage counts and pipeline metrics) |
| `GET /api/leads/:id` | GET | — (full lead detail) |
| `POST /api/leads` | POST | Lead creation payload |
| `PATCH /api/leads/:id` | PATCH | Update fields |
| `PATCH /api/leads/:id/stage` | PATCH | `stage`, `note` (for pipeline move) |
| `POST /api/leads/:id/activity` | POST | Log activity (call, email, note) |
| `GET /api/leads/:id/activity` | GET | Activity timeline |
| `POST /api/leads/:id/tasks` | POST | Create task |
| `PATCH /api/leads/bulk` | PATCH | `ids[]`, `action`, `value` |
| `POST /api/leads/import` | POST | CSV file upload |
| `GET /api/leads/export` | GET | Export filtered leads as CSV |

### Response Shape

```typescript
interface Lead {
  id: string;
  
  contact: {
    name: string;
    nameAr: string;
    phone: string;
    email?: string;
    preferredContact: 'phone' | 'email' | 'whatsapp';
    preferredLanguage: 'ar' | 'en';
  };
  
  score: number;           // 0-100
  scoreLabel: 'hot' | 'warm' | 'cold';
  scoreFactors: Array<{
    factor: string;
    factorAr: string;
    value: number;          // -10 to +10
    weight: number;
  }>;
  
  stage: 'new' | 'contacted' | 'qualified' | 'viewing' | 'negotiation' | 'won' | 'lost';
  stageChangedAt: string;
  
  interest: {
    type: 'buy' | 'rent';
    propertyType: string;
    propertyTypeAr: string;
    city: string;
    cityAr: string;
    district?: string;
    districtAr?: string;
    budgetMin: number;
    budgetMax: number;
    bedrooms?: number;
    timeline: 'immediate' | '1-3months' | '3-6months' | '6plus';
    specificPropertyId?: string;
    specificUnitId?: string;
  };
  
  source: 'website' | 'walk_in' | 'referral' | 'social_media' | 'phone' | 'partner' | 'other';
  
  agent: {
    id: string;
    name: string;
    nameAr: string;
    avatar?: string;
  };
  
  nextAction?: {
    type: string;
    typeAr: string;
    date: string;
    dateHijri: string;
    description: string;
    descriptionAr: string;
  };
  
  notes: string;
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
  lostReason?: string;
  wonPropertyId?: string;
  wonUnitId?: string;
}

interface PipelineSummary {
  stages: Array<{
    stage: string;
    count: number;
    totalValue: number;
  }>;
  conversionRate: number;
  avgDaysToClose: number;
  totalLeads: number;
  activeLeads: number;
}
```

---

## 7. Interactive States

### Loading

- Kanban: Skeleton columns (5) with skeleton cards (2-3 per column)
- Table: 10 skeleton rows
- Pipeline summary: Skeleton bar + text
- Lead detail: Skeleton content in sheet

### Empty States

| Context | Message | CTA |
|---------|---------|-----|
| No leads at all | "No leads yet. Start capturing leads to build your pipeline." | "+ New Lead" + "Import Leads" |
| Empty pipeline stage | "No leads in this stage." | "+ Add Lead" (ghost button in column) |
| No results (filters) | "No leads match your filters." | "Clear Filters" |
| No activity (lead detail) | "No activity recorded. Log your first interaction." | "Log Activity" button |

### Error States

- Board load error: Full-page error with retry
- Drag & drop error: Card snaps back to original position, error toast
- Lead save error: Form stays open with error message
- Activity log error: "Failed to load activity" with retry link

### Real-time

- New lead: Card appears at top of "New" column with slide-in animation
- Stage change (by another user): Card moves with animation, toast notification
- Score update: Badge animates color transition
- Concurrent drag: If two users drag same card, last write wins with notification
