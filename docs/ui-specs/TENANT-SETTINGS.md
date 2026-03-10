# Tenant / Company Settings Specification

> Tenant/company settings — profile, subscription, users, roles
> Route: `/settings`

---

## 1. Wireframe Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ "Settings"                                                ││
│ │ "Manage your company profile, team, and billing"          ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────┐ ┌──────────────────────────────────────────┐│
│ │ Settings Nav │ │ Content Area                              ││
│ │ (w-64)       │ │                                          ││
│ │              │ │ ═══ GENERAL TAB ═══                       ││
│ │ ▸ General    │ │                                          ││
│ │   Profile    │ │ Company Profile                           ││
│ │   Branding   │ │ ┌────────────────────────────────────────┐││
│ │              │ │ │ ┌────┐ Company Name                    │││
│ │ ▸ Team       │ │ │ │LOGO│ Al Rajhi Properties             │││
│ │   Users      │ │ │ └────┘ [Change Logo]                   │││
│ │   Roles      │ │ │                                        │││
│ │   Invitations│ │ │ Company Name (EN): [Al Rajhi Prop...]  │││
│ │              │ │ │ Company Name (AR): [عقارات الراجحي...]  │││
│ │ ▸ Billing    │ │ │ Industry: [Real Estate ▾]              │││
│ │   Plan       │ │ │ Tax ID (VAT): [300...]                 │││
│ │   Invoices   │ │ │ CR Number: [101...]                    │││
│ │   Payment    │ │ │                                        │││
│ │              │ │ │ Address                                │││
│ │ ▸ Platform   │ │ │ Street: [King Fahd Road...]            │││
│ │   Localization│ │ │ City: [Riyadh ▾]                      │││
│ │   Notifications│ │ │ District: [Al Olaya ▾]               │││
│ │   Integrations│ │ │ Postal Code: [12211]                  │││
│ │   API Keys   │ │ │                                        │││
│ │              │ │ │ Contact                                │││
│ │ ▸ Security   │ │ │ Phone: [+966 11 ...]                  │││
│ │   2FA        │ │ │ Email: [info@...]                     │││
│ │   Audit Log  │ │ │ Website: [https://...]                │││
│ │   Sessions   │ │ │                                        │││
│ │              │ │ │        [Cancel] [Save Changes]         │││
│ │              │ │ └────────────────────────────────────────┘││
│ └──────────────┘ └──────────────────────────────────────────┘│
│                                                              │
│ ═══ USERS TAB ═══                                            │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Users (12)                    [🔍 Search] [+ Invite User] ││
│ │                                                           ││
│ │ ┌─────────────────────────────────────────────────────┐   ││
│ │ │ 👤 │ Name          │ Email            │ Role  │ ⋯  │   ││
│ │ │────│───────────────│──────────────────│───────│─────│   ││
│ │ │ 👤 │ Ahmed Hassan  │ ahmed@rajhi.sa   │ Admin │  ⋯  │   ││
│ │ │ 👤 │ Sara Ali      │ sara@rajhi.sa    │ Manager│ ⋯  │   ││
│ │ │ 👤 │ Khalid Omar   │ khalid@rajhi.sa  │ Agent │  ⋯  │   ││
│ │ └─────────────────────────────────────────────────────┘   ││
│ │                                                           ││
│ │ Pending Invitations (2)                                   ││
│ │ ┌─────────────────────────────────────────────────────┐   ││
│ │ │ ✉️ │ fatima@rajhi.sa │ Manager │ Sent 2d ago│Resend│   ││
│ │ │ ✉️ │ omar@rajhi.sa   │ Agent   │ Sent 5d ago│Resend│   ││
│ │ └─────────────────────────────────────────────────────┘   ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ PLAN / SUBSCRIPTION TAB ═══                              │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Current Plan: Professional              [Change Plan]     ││
│ │ ──────────────────────                                    ││
│ │ Next billing: 1 Ramadan 1447 │ SAR 2,500/month            ││
│ │                                                           ││
│ │ Usage                                                     ││
│ │ Properties: 24 / 50        ████████████░░░░░░░   48%      ││
│ │ Users:      12 / 25        █████████░░░░░░░░░░   48%      ││
│ │ Storage:    8.2 / 20 GB    ████████░░░░░░░░░░░   41%      ││
│ │                                                           ││
│ │ Plan Comparison                                           ││
│ │ ┌──────────┐ ┌──────────────┐ ┌──────────────┐           ││
│ │ │ Starter  │ │ Professional │ │ Enterprise   │           ││
│ │ │ SAR 500  │ │ SAR 2,500    │ │ Custom       │           ││
│ │ │ /month   │ │ /month  ★    │ │ /month       │           ││
│ │ │          │ │ Current Plan │ │              │           ││
│ │ │ 10 prop  │ │ 50 properties│ │ Unlimited    │           ││
│ │ │ 5 users  │ │ 25 users     │ │ Unlimited    │           ││
│ │ │ 5 GB     │ │ 20 GB        │ │ 100 GB       │           ││
│ │ │          │ │              │ │              │           ││
│ │ │[Downgrade│ │ ✓ Active     │ │ [Contact     │           ││
│ │ │          │ │              │ │  Sales]      │           ││
│ │ └──────────┘ └──────────────┘ └──────────────┘           ││
│ └───────────────────────────────────────────────────────────┘│
│                                                              │
│ ═══ ROLES TAB ═══                                            │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Roles & Permissions              [+ Create Custom Role]   ││
│ │                                                           ││
│ │ ┌─ Admin (System) ───────────────────────────────────┐    ││
│ │ │ Full access to all features. Cannot be modified.   │    ││
│ │ │ Users: Ahmed Hassan                                │    ││
│ │ └────────────────────────────────────────────────────┘    ││
│ │ ┌─ Manager ──────────────────────────────────────────┐    ││
│ │ │ Properties ✓  Leads ✓  Finance ✓  Reports ✓       │    ││
│ │ │ Users: Sara Ali, Fatima                            │    ││
│ │ │ [Edit Permissions]                                 │    ││
│ │ └────────────────────────────────────────────────────┘    ││
│ │ ┌─ Agent ────────────────────────────────────────────┐    ││
│ │ │ Properties (view) ✓  Leads ✓  Finance ✗           │    ││
│ │ │ Users: Khalid Omar, Omar Nasr, +4 more             │    ││
│ │ │ [Edit Permissions]                                 │    ││
│ │ └────────────────────────────────────────────────────┘    ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)

- Settings nav: Collapsible — visible as top horizontal tabs or accordion
- Content: Full-width below nav
- Plan cards: 2 + 1 layout or horizontal scroll
- Users table: Standard with scroll

### Mobile (<768px)

- Settings nav: Full-width list at top (like iOS Settings)
- Each section: Drill-down navigation (→ opens full-screen page)
- Back button to return to settings root
- Forms: Full-width inputs, single-column
- Plan cards: Stacked vertically
- Users: Card layout

---

## 2. Component Breakdown

### 2.1 Settings Navigation

**Components**: Custom `SettingsNav` using `nav` + active link styling

- Vertical sidebar navigation (desktop)
- Groups: General, Team, Billing, Platform, Security
- Each group: Expandable/collapsible section
- Active item: `bg-muted` with `border-inline-start: 2px solid var(--brand-primary)`
- Icons: Each group has an icon (Building, Users, CreditCard, Globe, Shield)

#### Mobile Navigation

- List of cards/rows, each linking to a sub-page
- Chevron at `inline-end` indicating drill-down
- Back navigation via breadcrumb or back button

### 2.2 Company Profile Form

**Components**: shadcn `Form`, `Input`, `Select`, `Textarea`, `Avatar`, `Button`

#### Logo Upload

- Current logo display: 80×80px rounded square
- "Change Logo" button → file picker
- Accepted: jpg, png, svg, max 2MB
- Preview before save
- Crop dialog (optional)

#### Form Fields

| Field | Type | Validation | Bilingual |
|-------|------|-----------|-----------|
| Company Name (EN) | Text input | Required, 2-100 chars | No |
| Company Name (AR) | Text input | Required, Arabic text | No |
| Industry | Select | Required | Options translated |
| Tax ID (VAT) | Text input | Pattern: 3XXXXXXXXX00003 | No |
| CR Number | Text input | Required, numeric | No |
| Street Address | Text input | Required | Separate AR/EN |
| City | Select | Required | Options translated |
| District | Dependent select | Optional | Options translated |
| Postal Code | Text input | 5-digit | No |
| Phone | Phone input | +966 format | No |
| Email | Email input | Valid email | No |
| Website | URL input | Valid URL | No |

#### Save Behavior

- "Save Changes" button: Disabled until form is dirty
- "Cancel": Resets form to saved values
- Save: Shows success toast
- Error: Shows inline field errors
- Unsaved changes: Warning on navigation

### 2.3 Branding Settings

**Components**: `Form`, `Input` (color picker), `Select`, `Switch`

- Primary color picker (default: #1E3A5F)
- Accent color picker (default: #D4A843)
- Default language: Arabic / English
- Date format: Hijri primary / Gregorian primary / Both
- Currency display format
- Custom email template header/footer
- Preview panel showing how branding appears

### 2.4 Users Management

**Components**: shadcn `Table`, `Avatar`, `Badge`, `Dialog`, `Form`

#### Users Table

| Column | Content |
|--------|---------|
| Avatar | User photo or initials |
| Name | Full name |
| Email | Email address |
| Role | Role badge (Admin, Manager, Agent, Viewer) |
| Status | Active / Inactive badge |
| Last Active | Relative timestamp |
| Actions | Edit, Deactivate/Activate, Remove |

#### Invite User Dialog

```
Fields:
├── Email Address *
├── Role (Select) *
├── Properties Access (Multi-select or "All")
└── Send Welcome Email (Toggle, default on)
```

#### Edit User Dialog

- Change role
- Assign/remove property access
- Deactivate/reactivate account
- Transfer ownership (admin only)

### 2.5 Roles & Permissions

**Components**: Custom `RoleCard`, `PermissionMatrix`, `Dialog`

#### Permission Matrix

| Module | View | Create | Edit | Delete | Export |
|--------|------|--------|------|--------|--------|
| Dashboard | ✓ | — | — | — | ✓ |
| Properties | ✓ | ✓ | ✓ | ✗ | ✓ |
| Inventory | ✓ | ✓ | ✓ | ✗ | ✓ |
| Leads | ✓ | ✓ | ✓ | ✗ | ✓ |
| Finance | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reports | ✓ | — | — | — | ✓ |
| Settings | ✗ | ✗ | ✗ | ✗ | — |
| Users | ✗ | ✗ | ✗ | ✗ | — |

- Checkboxes for each permission
- Toggle row/column (select all in row or column)
- System roles (Admin): Non-editable, shown as reference
- Custom roles: Create, edit, clone, delete
- Changes auto-save or explicit save button

### 2.6 Subscription / Plan Management

**Components**: Custom `PlanCard`, `Progress`, `Badge`, `Dialog`

#### Current Plan Display

- Plan name with badge (if active)
- Billing cycle: Monthly / Annual
- Next billing date (Hijri + Gregorian)
- Amount: SAR X/month or SAR X/year
- Auto-renew toggle

#### Usage Meters

- Properties: X / limit (progress bar)
- Users: X / limit (progress bar)
- Storage: X GB / limit (progress bar)
- Color: Green (<50%), Amber (50-80%), Red (>80%)

#### Plan Comparison

- 3 plan cards side by side (or table on mobile)
- Current plan highlighted with checkmark
- Feature comparison list below cards
- "Upgrade" / "Downgrade" / "Contact Sales" CTAs
- Upgrade: Confirmation dialog with prorated pricing
- Downgrade: Warning about feature loss

### 2.7 Billing & Payment

**Components**: shadcn `Table`, `Card`, `Dialog`

#### Payment Methods

- Saved cards: Visa/Mastercard icons, last 4 digits, expiry
- Default card indicator (star icon)
- Add new card: Stripe Elements or equivalent
- Bank transfer option

#### Invoice History

| Column | Content |
|--------|---------|
| Invoice # | INV-2026-001 |
| Date | 1 Sha'ban 1447 / Mar 1, 2026 |
| Amount | SAR 2,500.00 |
| Status | Paid / Pending / Overdue |
| Actions | Download PDF, View |

### 2.8 Localization Settings

**Components**: `Select`, `Switch`, `RadioGroup`

- Default language: Arabic / English
- Date format: Hijri / Gregorian / Both (with primary)
- Time format: 12h / 24h
- Number format: Arabic-Indic / Western Arabic
- Currency position: Before / After amount
- First day of week: Saturday / Sunday / Monday
- Timezone: Asia/Riyadh (auto-detected)

### 2.9 Notification Preferences

**Components**: `Switch`, `Checkbox`

| Notification Type | In-App | Email | SMS |
|------------------|--------|-------|-----|
| New Lead | ✓ | ✓ | ✗ |
| Lead Assigned | ✓ | ✓ | ✗ |
| Lease Expiring | ✓ | ✓ | ✓ |
| Payment Received | ✓ | ✓ | ✗ |
| Maintenance Request | ✓ | ✓ | ✗ |
| System Updates | ✓ | ✗ | ✗ |
| Weekly Report | ✗ | ✓ | ✗ |

### 2.10 Security Settings

**Components**: `Switch`, `Table`, `Dialog`

- Two-factor authentication: Enable/disable, QR code setup
- Active sessions: List of devices/browsers with "Revoke" action
- Audit log: Table of admin actions with filters (user, action, date)
- Password policy: Minimum length, complexity requirements
- IP whitelist (enterprise)

---

## 3. Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Settings nav | Full-width list, drill-down | Top tabs or accordion | Sidebar (w-64) |
| Forms | Single column, full-width | Single column, max-w-lg | Two column where appropriate |
| Plan cards | Stacked vertically | 2+1 grid | 3-column row |
| Users table | Card layout | Scroll table | Full table |
| Permission matrix | Accordion by module | Scroll table | Full table |
| Invoice table | Card layout | Scroll table | Full table |
| Active sessions | Card layout | Table | Table |
| Color pickers | Full-width | Standard | Standard |

---

## 4. RTL Considerations

### Settings Navigation

- Sidebar at `inline-start`
- Active indicator: `border-inline-start`
- Chevron (mobile drill-down): Points toward `inline-end`
- Back button (mobile): At `inline-start` of header

### Forms

- Labels: Above inputs (works for both directions)
- Help text: Below inputs, `text-start`
- Error messages: Below inputs, `text-start`
- Icon inputs: Icon at `inline-start`, clear at `inline-end`
- Phone input: Number portion always LTR, country code at `inline-start`
- Bilingual fields: EN field first in English mode, AR field first in Arabic mode

### Permission Matrix

- Module names: `text-start` (row headers)
- Checkboxes: Centered in columns
- Column headers: Centered

### Plan Cards

- Card order: Same visual order in both directions (CSS Grid)
- Price: Currency symbol positioning per locale
- Feature list: Checkmarks at `inline-start`

### Invoice Table

- Standard table RTL patterns
- Invoice numbers: Remain LTR (alphanumeric)
- Dates: Formatted per locale

### User Avatars

- Avatar at `inline-start` of row
- Actions at `inline-end`

---

## 5. Accessibility

### Navigation

```html
<nav aria-label="Settings navigation">
  <ul role="list">
    <li>
      <button aria-expanded="true" aria-controls="general-section">
        General
      </button>
      <ul id="general-section" role="list">
        <li><a href="/settings" aria-current="page">Profile</a></li>
        <li><a href="/settings/branding">Branding</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Forms

- All inputs: `<label>` with `htmlFor`
- Required fields: `aria-required="true"` + visual asterisk
- Error state: `aria-invalid="true"` + `aria-describedby="error-message-id"`
- Help text: `aria-describedby="help-text-id"`
- Form groups: `<fieldset>` + `<legend>` for related fields
- Submit feedback: `aria-live="polite"` for success/error messages

### Permission Matrix

```html
<table aria-label="Role permissions for Manager">
  <caption>Permissions for Manager role</caption>
  <thead>
    <tr>
      <th scope="col">Module</th>
      <th scope="col">View</th>
      <th scope="col">Create</th>
      <!-- ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Properties</th>
      <td><input type="checkbox" aria-label="Properties: View permission" checked /></td>
      <!-- ... -->
    </tr>
  </tbody>
</table>
```

### Plan Cards

- Each card: `role="article"` or section with heading
- Current plan: `aria-current="true"`
- CTA buttons: Descriptive labels ("Upgrade to Enterprise plan")
- Usage meters: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### Color Pickers

- Text input alternative alongside visual picker
- Preview swatch with `aria-label="Selected color: #1E3A5F"`

### Switches/Toggles

- `role="switch"` with `aria-checked`
- Label clearly describes what the switch controls
- State change announced

---

## 6. Data Requirements

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/tenants/:id` | GET | Tenant/company profile |
| `PUT /api/tenants/:id` | PUT | Update profile |
| `POST /api/tenants/:id/logo` | POST | Upload logo (multipart) |
| `GET /api/tenants/:id/users` | GET | List users |
| `POST /api/tenants/:id/users/invite` | POST | Send invitation |
| `PATCH /api/users/:id` | PATCH | Update user (role, status) |
| `DELETE /api/users/:id` | DELETE | Remove user |
| `GET /api/tenants/:id/roles` | GET | List roles |
| `POST /api/tenants/:id/roles` | POST | Create custom role |
| `PUT /api/tenants/:id/roles/:roleId` | PUT | Update role permissions |
| `GET /api/tenants/:id/subscription` | GET | Current plan + usage |
| `POST /api/tenants/:id/subscription/change` | POST | Change plan |
| `GET /api/tenants/:id/invoices` | GET | Invoice history |
| `GET /api/tenants/:id/invoices/:id/pdf` | GET | Download invoice PDF |
| `GET /api/tenants/:id/payment-methods` | GET | Saved payment methods |
| `POST /api/tenants/:id/payment-methods` | POST | Add payment method |
| `GET /api/tenants/:id/settings` | GET | Platform settings (locale, notifications) |
| `PUT /api/tenants/:id/settings` | PUT | Update platform settings |
| `GET /api/tenants/:id/audit-log` | GET | Audit log entries |
| `GET /api/tenants/:id/sessions` | GET | Active sessions |
| `DELETE /api/tenants/:id/sessions/:sessionId` | DELETE | Revoke session |

### Response Shape (Tenant)

```typescript
interface Tenant {
  id: string;
  
  name: string;
  nameAr: string;
  industry: string;
  vatNumber: string;
  crNumber: string;
  
  logo?: {
    url: string;
    thumbnailUrl: string;
  };
  
  address: {
    street: string;
    streetAr: string;
    city: string;
    cityAr: string;
    district: string;
    districtAr: string;
    postalCode: string;
  };
  
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  
  branding: {
    primaryColor: string;
    accentColor: string;
  };
  
  settings: {
    defaultLocale: 'ar' | 'en';
    dateFormat: 'hijri' | 'gregorian' | 'both';
    primaryCalendar: 'hijri' | 'gregorian';
    timeFormat: '12h' | '24h';
    numberFormat: 'arabic-indic' | 'western';
    currencyPosition: 'before' | 'after';
    firstDayOfWeek: 'saturday' | 'sunday' | 'monday';
    timezone: string;
  };
  
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'cancelled';
    currentPeriodEnd: string;
    currentPeriodEndHijri: string;
    monthlyPrice: number;
    currency: 'SAR';
    usage: {
      properties: { used: number; limit: number; };
      users: { used: number; limit: number; };
      storage: { usedGB: number; limitGB: number; };
    };
  };
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Interactive States

### Loading

- Settings nav: Skeleton items (6-8 lines)
- Profile form: Skeleton inputs (logo rect + text input skeletons)
- Users table: Skeleton rows
- Plan cards: 3 skeleton cards
- All sections: Show nav immediately, content area shows skeleton

### Empty States

| Section | Message | CTA |
|---------|---------|-----|
| Users (only admin) | "You're the only user. Invite team members to get started." | "Invite User" |
| Invitations | "No pending invitations." | "Invite User" |
| Custom roles | "No custom roles. Using default roles (Admin, Manager, Agent, Viewer)." | "Create Custom Role" |
| Invoices | "No invoices yet. Your first invoice will appear after your billing cycle." | None |
| Audit log | "No activity recorded yet." | None |

### Error States

- Profile save error: Inline field errors + toast
- Logo upload error: "Failed to upload. File must be under 2MB." with retry
- User invite error: "Failed to send invitation" + check email format
- Plan change error: "Payment failed. Please update your payment method."
- Session revoke error: Toast with retry

### Confirmation Dialogs

| Action | Dialog |
|--------|--------|
| Remove user | "Remove {name}? They will lose access to this workspace." |
| Change plan (downgrade) | "Downgrade to Starter? You'll lose access to: ..." |
| Deactivate 2FA | "Disable two-factor authentication? This reduces account security." |
| Revoke session | "Sign out {device}? The user will need to sign in again." |
| Delete custom role | "Delete {role}? Users with this role will be set to Viewer." |

### Sensitive Actions

- Plan changes: Require password re-entry
- Remove admin: Require confirmation + cannot remove last admin
- API key creation: Show key only once, with copy button
- 2FA setup: QR code + manual entry code + backup codes
