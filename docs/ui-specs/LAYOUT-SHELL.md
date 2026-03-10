# Layout Shell Specification

> Main application shell: sidebar navigation, topbar, RTL toggle, tenant switcher
> Used on every authenticated page

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar]        │ [Topbar]                                      │
│ 256px            │ h-16, full-width                               │
│                  │ ┌──────────────────────────────────────────┐   │
│ ┌──────────┐     │ │ Breadcrumb   │ Search │ RTL │ 🔔 │ Avatar│  │
│ │ Logo     │     │ └──────────────────────────────────────────┘   │
│ │ Tenant   │     ├────────────────────────────────────────────────│
│ │ Switcher │     │                                                │
│ ├──────────┤     │  [Page Content Area]                           │
│ │ Nav      │     │  max-w-[1400px] mx-auto px-6 py-6             │
│ │ ────     │     │                                                │
│ │ Dashboard│     │                                                │
│ │ Propert… │     │                                                │
│ │ Inventory│     │                                                │
│ │ Leads    │     │                                                │
│ │ Tenants  │     │                                                │
│ │ Finance  │     │                                                │
│ │ Reports  │     │                                                │
│ │ ────     │     │                                                │
│ │ Settings │     │                                                │
│ │ Help     │     │                                                │
│ └──────────┘     │                                                │
└──────────────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)

```
┌──────────────────────────────────────────────────┐
│ [Collapsed   │ [Topbar]                           │
│  Sidebar]    │ ┌─────────────────────────────────┐│
│  w-16        │ │ ☰ │ Breadcrumb │ 🔍 │ 🔔 │ 👤  ││
│  Icons only  │ └─────────────────────────────────┘│
│              ├────────────────────────────────────│
│  🏠          │                                    │
│  🏢          │  [Page Content]                    │
│  📊          │  px-4 py-4                         │
│  👥          │                                    │
│  💰          │                                    │
│  📋          │                                    │
│  ──          │                                    │
│  ⚙️          │                                    │
└──────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────────────────┐
│ [Topbar]                     │
│ ┌───────────────────────────┐│
│ │ ☰ │ Logo │ 🔍 │ 🔔 │ 👤  ││
│ └───────────────────────────┘│
├──────────────────────────────│
│                              │
│  [Page Content]              │
│  px-4 py-4                   │
│  Full width                  │
│                              │
│                              │
├──────────────────────────────│
│ [Bottom Nav Bar] h-16        │
│ 🏠  🏢  📊  👥  ⋯           │
└──────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Sidebar (`<AppSidebar />`)

**shadcn/ui components**: `Sheet` (mobile), `ScrollArea`, `Tooltip`, `Collapsible`, `Avatar`

#### Structure

```
<aside>
  ├── Logo + Tenant Switcher (top)
  ├── ScrollArea (nav items)
  │   ├── Main Navigation Group
  │   │   ├── Dashboard
  │   │   ├── Properties (expandable)
  │   │   │   ├── All Properties
  │   │   │   ├── Inventory Grid
  │   │   │   └── Add Property
  │   │   ├── Leads & CRM
  │   │   ├── Tenants
  │   │   ├── Finance (expandable)
  │   │   │   ├── Invoices
  │   │   │   ├── Payments
  │   │   │   └── Reports
  │   │   └── Reports
  │   └── Secondary Group (separator above)
  │       ├── Settings
  │       └── Help & Support
  └── User Profile Card (bottom, sticky)
      ├── Avatar + Name + Role
      └── Logout button
</aside>
```

#### Styling

- **Width**: 256px expanded, 64px collapsed (tablet), 0 (mobile — uses Sheet)
- **Background**: `--brand-primary` (Deep Blue #1E3A5F)
- **Text**: `white/80` default, `white` on hover/active
- **Active item**: `bg-white/10` with `border-inline-start: 3px solid var(--brand-accent)`
- **Hover**: `bg-white/5` transition
- **Dividers**: `border-white/10`
- **Scroll**: Custom thin scrollbar, `white/20`
- **Collapse transition**: 200ms width animation, icons remain centered

#### Tenant Switcher

- Dropdown at the top of sidebar, below logo
- Shows current tenant/company name + logo thumbnail
- Dropdown lists all tenants user has access to
- Each item: avatar + name + role badge
- Uses shadcn `DropdownMenu` inside sidebar
- On mobile: Full-screen select sheet

### 2.2 Topbar (`<AppTopbar />`)

**shadcn/ui components**: `Breadcrumb`, `Input`, `Button`, `DropdownMenu`, `Avatar`, `Badge`, `Popover`

#### Structure

```
<header>
  ├── Start Section (inline-start)
  │   ├── Menu Toggle (mobile/tablet only)
  │   └── Breadcrumb (auto-generated from route)
  ├── End Section (inline-end)
  │   ├── Global Search (CommandK)
  │   ├── Language/RTL Toggle
  │   ├── Theme Toggle (light/dark)
  │   ├── Notifications Bell + Badge
  │   └── User Avatar + Dropdown
  └── (optional) Page-level action bar below
</header>
```

#### Styling

- **Height**: 64px (`h-16`)
- **Background**: `--background` with `border-b`
- **Position**: `sticky top-0 z-20`
- **Blur**: `backdrop-blur-sm bg-background/95` for scroll-over effect

#### Global Search (Command K)

- Trigger: Search icon or `Cmd/Ctrl+K` keyboard shortcut
- Uses shadcn `Command` (cmdk-based)
- Search categories: Properties, Units, Leads, Tenants, Documents
- Recent searches persisted
- Keyboard navigable
- RTL: Input direction auto-detects based on typed characters

#### Language / RTL Toggle

- Toggle button with flag icons or `EN | عر` text
- Switches `dir` and `lang` on `<html>`
- Persisted in user preferences (cookie + DB)
- Triggers re-render with new translation strings
- Smooth transition (no full page reload, use Next.js i18n routing)

#### Notifications Panel

- Bell icon with unread count badge (red dot or number)
- Popover on click showing recent notifications
- Categories: System, Property, Finance, Lead
- Each notification: icon + title + timestamp + read/unread indicator
- "Mark all as read" action
- "View all" link to notifications page
- Uses `Popover` + custom `NotificationList` component

#### User Menu

- Avatar with dropdown
- Items: Profile, Settings, Switch Tenant, Language, Theme, Logout
- Shows user name + email + role below avatar

### 2.3 Bottom Navigation (`<MobileBottomNav />`) — Mobile Only

**shadcn/ui components**: None (custom component)

- Fixed to bottom, `h-16`, `border-t`, `bg-background`
- 5 items max: Dashboard, Properties, Add (center, accent-colored), Leads, More
- Active item: accent color + filled icon
- "More" opens a sheet with remaining nav items
- Safe area padding for iOS (`pb-safe`)

### 2.4 Page Wrapper (`<PageContent />`)

- `max-w-[1400px] mx-auto`
- Responsive padding: `px-4 md:px-6`
- Page header slot: title + description + actions
- Content area below

---

## 3. Responsive Behavior

| Feature | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Sidebar | Hidden; Sheet overlay | Collapsed (icons only, 64px) | Full expanded (256px) |
| Sidebar toggle | Hamburger in topbar | Click to expand/collapse | Click to collapse |
| Bottom nav | Visible | Hidden | Hidden |
| Topbar search | Icon → opens full-width input | Compact input | Full input with shortcut hint |
| Breadcrumb | Current page only | 2 levels | Full path |
| Notifications | Full-screen sheet | Popover | Popover |
| User menu | Full-screen sheet | Dropdown | Dropdown |

---

## 4. RTL Considerations

### Layout Mirroring

- **Sidebar position**: `inline-start` (left in LTR, right in RTL). Use `fixed inset-y-0 start-0`.
- **Content area**: Offset from sidebar on the `inline-start` side. Use `ps-[256px]` (not `pl-`).
- **Active indicator**: `border-inline-start` (appears on left in LTR, right in RTL).
- **Expand/collapse chevron**: Mirrors automatically (points right in LTR for expand, left in RTL).
- **Breadcrumb separator**: Use `/` or `›` (mirrors naturally); avoid directional arrows.
- **Topbar sections**: `justify-between` with `flex` handles LTR/RTL automatically.
- **Sheet slide direction**: From `inline-start` for sidebar sheet (left in LTR, right in RTL).

### Text Direction

- Sidebar nav labels: Inherit `dir` from `<html>`.
- Search input: `dir="auto"` to support mixed Arabic/English queries.
- Breadcrumb: Text order auto-reverses; separator remains visual.

### Animation Direction

- Sidebar expand: Slides from `inline-start` edge.
- Dropdown menus: Align to `start` or `end` using Radix `align` prop (auto-flips).
- Notification popover: Align to `end` (right in LTR, left in RTL).

---

## 5. Accessibility

### Landmarks

```html
<div class="app-layout">
  <a href="#main-content" class="skip-link">Skip to content</a>
  <aside role="navigation" aria-label="Main navigation">...</aside>
  <header role="banner">...</header>
  <main id="main-content" role="main">...</main>
</div>
```

### Keyboard Navigation

- `Tab` moves between topbar items → sidebar items → main content
- `Escape` closes any open dropdown/sheet/popover
- Sidebar items: `ArrowUp`/`ArrowDown` to navigate, `Enter` to activate, `ArrowRight` to expand submenu (flipped in RTL)
- `Cmd/Ctrl+K` opens search from anywhere
- `Cmd/Ctrl+B` toggles sidebar

### Screen Reader

- Sidebar: `aria-label="Main navigation"`, `aria-current="page"` on active item
- Notifications bell: `aria-label="Notifications, 3 unread"` (dynamic count)
- Tenant switcher: `aria-label="Switch tenant, current: Al Rajhi Properties"`
- Theme toggle: `aria-label="Switch to dark mode"` / `"Switch to light mode"`
- Language toggle: `aria-label="Switch to Arabic"` / `"التبديل إلى الإنجليزية"`
- Sidebar collapse: `aria-label="Collapse sidebar"` / `"Expand sidebar"`

### Focus Management

- After sidebar toggle: Focus stays on toggle button
- After opening search: Focus moves to search input
- After closing modal/sheet: Focus returns to trigger element

---

## 6. Data Requirements

### API Endpoints

| Data | Endpoint | Update Frequency |
|------|----------|-----------------|
| Current user | `GET /api/auth/me` | On auth, cached |
| User tenants | `GET /api/tenants` | On auth, cached |
| Active tenant | `GET /api/tenants/:id` | On switch |
| Notifications | `GET /api/notifications?unread=true` | Polling 30s / WebSocket |
| Navigation permissions | Part of user session | On auth |

### Session State

```typescript
interface AppSession {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'manager' | 'agent' | 'viewer';
  };
  tenant: {
    id: string;
    name: string;
    nameAr: string;
    logo?: string;
    plan: 'starter' | 'professional' | 'enterprise';
  };
  preferences: {
    locale: 'en' | 'ar';
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
  };
  unreadNotifications: number;
}
```

---

## 7. Interactive States

### Loading

- Sidebar: Skeleton nav items (6 skeleton bars)
- Topbar: Logo visible, rest shows skeleton
- Content: Full-page skeleton with content placeholders
- Tenant switcher: Skeleton avatar + text

### Error

- Auth error: Redirect to login
- Tenant load error: Show error banner in sidebar with retry button
- Notification error: Bell icon with orange warning indicator

### Empty States

- No tenants: "No properties assigned. Contact your administrator."
- No notifications: "All caught up!" with checkmark illustration
