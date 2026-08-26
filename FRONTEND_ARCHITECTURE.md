# Frontend Architecture & Developer Guide (AI-Ready Documentation)

> **Repository:** `restaurant-management-frontend`  
> **Framework:** React 18 (Vite)  
> **UI Paradigm:** Single Page Application (SPA) with Role-Based Backoffice Dashboard & Public QR Self-Ordering Mobile View.  
> **Styling:** TailwindCSS + Custom Color Tokens & Micro-Animations.  
> **Language:** JavaScript (ESNext / JSX).

---

## 1. Executive Summary & Core Technologies

This repository provides the entire frontend user interface for the multi-tenant SaaS Restaurant Management platform. It supports two primary user journeys:
1. **Backoffice / Restaurant Staff & Admin Portal:** Full management dashboard covering POS, Live Kitchen Display System (KDS), Dine-in Table Sessions, Orders, Phone Orders, Delivery/Takeaway, WhatsApp CRM Inbox & Automation, Menu & Modifiers, Coupons, Multi-Branch Settings, Employee RBAC Roles, and Audit Logs.
2. **Public Dine-in Table Self-Ordering (QR Mobile Web App):** A high-speed, mobile-optimized experience where dine-in customers scan a table QR code, join with a 4-digit PIN & name, collaboratively add items to a shared cart, submit multi-round orders, request the bill (`BILL`), or call the waiter (`HELP`).

### Key Dependencies & Libraries:
- **Build Tool:** Vite 5
- **Routing:** React Router v6 (`createBrowserRouter`, `RouterProvider`, protected route wrappers)
- **Data Fetching & Server State:** TanStack React Query v5 (query caching, background polling, automatic retry with exponential backoff, real-time invalidation)
- **HTTP Client:** Axios with centralized interceptors, single-flight token refresh mutex, and Arabic error mapping
- **Real-Time WebSockets:** Socket.io-client (`SocketProvider`)
- **Icons:** Lucide React
- **Validation:** Zod schemas for all form inputs & query params
- **Testing:** Vitest + React Testing Library + jsdom

---

## 2. Directory Structure & File Map

```
frontend/
├── index.html                  # HTML entry point with RTL Arabic configuration
├── vite.config.js              # Vite build configuration & test setup
├── tailwind.config.js          # Tailwind theme tokens (brand, surface, text, status colors)
├── src/
│   ├── main.jsx                # Application root mounting App into #root
│   ├── index.css               # Global CSS tokens, scrollbar utilities, animations
│   ├── app/
│   │   ├── App.jsx             # Top-level App component with Providers & NetworkStatusBanner
│   │   ├── providers.jsx       # TanStack QueryClient, AuthProvider, BranchProvider, SocketProvider
│   │   └── router.jsx          # Route definitions, guards, and lazy page mappings
│   ├── lib/
│   │   ├── api-client.js       # Central Axios client, auth token injection, error mapping
│   │   ├── asset-url.js        # Static asset & image upload URL resolver
│   │   ├── date.js             # Arabic localized date and time formatting utilities
│   │   ├── print.js            # Thermal receipt printing utility (iframe & raw HTML)
│   │   └── api/                # Low-level API client wrappers (one file per domain)
│   │       ├── auth.api.js
│   │       ├── branches.api.js
│   │       ├── customers.api.js
│   │       ├── dashboard.api.js
│   │       ├── employees.api.js
│   │       ├── inbox.api.js
│   │       ├── kds.api.js
│   │       ├── menu.api.js
│   │       ├── multi-branch.api.js
│   │       ├── notifications.api.js
│   │       ├── orders.api.js
│   │       ├── phone-order.api.js
│   │       ├── pos.api.js
│   │       ├── roles.api.js
│   │       ├── table-sessions.api.js
│   │       ├── tables.api.js
│   │       └── whatsapp.api.js
│   ├── shared/                 # Reusable components, layouts, and real-time utilities
│   │   ├── components/
│   │   │   ├── Button.jsx              # Accessible button with loading states & icons
│   │   │   ├── ConfirmDialog.jsx       # Modal confirmation dialog
│   │   │   ├── DataTable.jsx           # Paginated, sortable data table
│   │   │   ├── EmptyState.jsx          # Illustrated empty state placeholder
│   │   │   ├── ErrorBoundary.jsx       # React Error Boundary for graceful crash handling
│   │   │   ├── ImageUploadInput.jsx    # Drag-and-drop image upload with live preview
│   │   │   ├── Input.jsx               # Form input with validation error labels
│   │   │   ├── LoadingSkeleton.jsx     # Shimmer skeleton loader
│   │   │   ├── Modal.jsx               # Accessible portal modal dialog
│   │   │   ├── NetworkStatusBanner.jsx # Real-time online/offline and retry indicator
│   │   │   ├── PermissionGate.jsx      # RBAC client-side permission renderer
│   │   │   ├── Select.jsx              # Dropdown select input
│   │   │   ├── SplashState.jsx         # App loading splash screen
│   │   │   ├── StatusPill.jsx          # Colored badge indicator (success, warning, danger)
│   │   │   └── Toggle.jsx              # Toggle switch input
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx           # Main admin dashboard layout with Sidebar & Header
│   │   │   └── PublicLayout.jsx        # Clean wrapper for customer QR menus
│   │   └── realtime/
│   │       └── SocketProvider.jsx      # Socket.io connection & TanStack Query invalidator
│   └── modules/                # Feature-based domain modules
│       ├── auth/               # Login, Register, Profile, AuthContext, BranchContext
│       ├── dashboard/          # Analytics metrics, sales charts, channel breakdowns
│       ├── branches/           # Branch settings, working hours, delivery zones
│       ├── employees/          # Staff list, create, edit, branch access assignment
│       ├── roles/              # RBAC role editor and permissions matrix
│       ├── menu/               # Products, categories, modifier groups, availability
│       ├── tables/             # Floor plans, QR codes, Dine-in Sessions, CartDrawer
│       ├── orders/             # Order list, order details, receipt print template, status flow
│       ├── pos/                # Fast cashier interface, cart, modifiers, split payments
│       ├── kds/                # Kitchen Display System with live cards & sound alerts
│       ├── phone-order/        # Caller ID & quick phone order creation flow
│       ├── customers/          # CRM customer profiles, order history, address book
│       ├── inbox/              # Multi-agent live chat inbox for WhatsApp conversations
│       ├── whatsapp/           # Meta Cloud API connection, bot flows, auto-replies
│       ├── coupons/            # Discount codes & promo management
│       ├── notifications/      # Bell notifications panel & preferences
│       └── audit-logs/         # Security audit log timeline & inspector
```

---

## 3. State Management & Data Architecture

The application separates state into three distinct layers:

### A. Global Client Contexts (`React Context`)
1. **`AuthContext` (`src/modules/auth/context/AuthContext.jsx`):**
   - Manages authenticated employee state (`user`, `token`, `role`, `permissions`).
   - Handles login, logout, and token rotation.
   - Restores session on load via `/auth/me`.
2. **`BranchContext` (`src/modules/auth/context/BranchContext.jsx`):**
   - Stores currently active branch (`activeBranchId`, `branch`).
   - Automatically scopes staff queries (KDS, Tables, Orders) to the active branch.

### B. Server Cache State (`TanStack React Query`)
- All server data is fetched and cached using React Query hooks (e.g. `useOrdersQuery`, `useMenuQuery`, `useTableSessionQuery`).
- **Resilience Policy:**
  - Queries automatically retry on network/server errors up to 3 times with exponential backoff.
  - Client errors (400, 401, 403, 404, 422) fail immediately to show validation messages without unnecessary retries.
  - Automatically refetches when the browser comes back online (`refetchOnReconnect: true`).

### C. Real-Time Mappings (`SocketProvider`)
When backend domain events fire over Socket.io, `SocketProvider` automatically invalidates the corresponding query caches:
- `order.created` / `order.statusChanged` $\rightarrow$ invalidates `['orders']`, `['kds']`, `['dashboard-summary']`, `['tables']`
- `order.paid` $\rightarrow$ invalidates `['orders']`, `['dashboard-summary']`
- `tableSession.updated` $\rightarrow$ invalidates `['table-session']`, `['table-session-active']`, `['tables']`
- `notification.created` $\rightarrow$ invalidates `['notifications']`, `['notifications-unread']`
- `conversation.updated` $\rightarrow$ invalidates `['whatsapp-conversations']`, `['inbox']`

---

## 4. API Client & Error Resilience Pattern

### Centralized Axios Client (`api-client.js`)
- Base URL: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'`
- Sends HttpOnly cookies (`withCredentials: true`) for refresh tokens.
- Single-flight refresh mutex (`performRefresh`): prevents parallel 401 calls from triggering multiple refresh requests.
- Automatic Response Unwrapping: returns `res.data` directly while preserving pagination metadata.

### Arabic Error Localization (`ERROR_MESSAGE_MAP`)
Errors returned from the API or network are normalized into `{ status, code, message, requestId, isConnectionIssue }`:
- **Network / Server Down:** `تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت أو المحاولة بعد قليل`
- **401 Unauthorized:** `انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى`
- **403 Forbidden:** `معندكش صلاحية تعمل الإجراء ده`
- **404 Not Found:** `العنصر ده مش موجود أو اتشال`
- **409 Conflict:** `حصل تعارض، بنحدّث البيانات الحالية`
- **429 Rate Limit:** `طلبات كتير، حاول تاني بعد شوية`
- **422 Business Rules:** Passes the exact business validation message (e.g. `هذه الطاولة مشغولة بالفعل`).

---

## 5. UI & UX Design System

- **Color Tokens:**
  - `bg-base` (`#0b0f19` dark base) / `bg-surface` (`#111827`) / `bg-surface-elevated` (`#1f2937`)
  - `brand-primary` (`#eab308` amber / gold palette for modern culinary aesthetic)
  - `border-default` (`#374151` / subtle transparent borders)
  - `txt-primary` (`#f9fafb`), `txt-muted` (`#9ca3af`)
  - Status tokens: `status-success` (emerald), `status-warning` (amber), `status-danger` (rose), `status-info` (sky)
- **RTL & Arabic Typography:** Full right-to-left layout with Cairo / Inter typography.
- **Micro-animations:** Subtle hover transforms, skeleton loading shimmer, animated slide-up drawers, pulse badges for live statuses.

---

## 6. How AI Models Should Work With This Frontend

When implementing new features or fixing issues in this frontend:
1. **Find the Module:** Locate the domain in `src/modules/<feature-name>/`.
2. **Follow Component-Hook-API Separation:**
   - Put raw Axios calls in `src/lib/api/<feature>.api.js`.
   - Put React Query hooks in `src/modules/<feature>/hooks/use<Feature>.js`.
   - Put Zod schemas in `src/modules/<feature>/schemas/<feature>.schema.js`.
   - Put UI pages and modals in `src/modules/<feature>/pages/` and `src/modules/<feature>/components/`.
3. **Respect Permissions:** Always wrap privileged actions or buttons in `<PermissionGate permission="orders.create">`.
4. **Never Break Test Coverage:** Run `npm test` after any modifications to ensure all 203+ Vitest unit tests pass.
