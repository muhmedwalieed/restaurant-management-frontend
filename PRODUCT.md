# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Restaurant Operators & Managers**: Require high-density scanning, branch switching, real-time KPI overview, multi-channel order control, and menu/pricing governance.
- **Cashiers & Front-of-House Staff**: Need rapid, error-free POS entry, split billing, table status monitoring, and instant order routing under high-stress shift pressure.
- **Waiters & Floor Service**: Need quick mobile/tablet table overview, instant waiter call acknowledgments, order review before kitchen dispatch, and quick bill printing.
- **Kitchen & Fulfillment Staff**: Require high-clarity status cues, ticket sequencing, and modifier visibility on KDS / tickets.
- **End Customers**: Interact via digital QR table menu, WhatsApp automated bot / support chat, and online storefront.

## Product Purpose

A unified, multi-channel restaurant operations platform (Cloud SaaS) that synchronizes POS, dine-in table sessions, QR ordering, WhatsApp commerce & customer tickets, website ordering, kitchen dispatch, and real-time sales reporting into a single calm, high-efficiency operating system.

## Positioning

An enterprise-grade, distraction-free restaurant operations command center designed for sustained 12+ hour daily usage. Unlike consumer-oriented or flashy colorful SaaS dashboards, it eliminates cognitive fatigue by relying exclusively on an architectural Neutral Monochrome aesthetic with fine typographic hierarchy and luminance-based elevation.

## Operating Context

- High-stress, dimly lit or brightly lit restaurant floor and kitchen environments.
- Fast, multi-touch or keyboard-driven repetitive operational workflows.
- Continuous real-time updates (WebSocket / Supabase real-time events) for order states, table statuses, waiter calls, and customer messages.
- Full RTL (Arabic) primary interface with strict typography, high-contrast monospace numeral rendering, and thermal receipt printing (80mm).

## Capabilities and Constraints

- **Multi-Channel Synchronized Orders**: POS, Dine-In Table QR Sessions, WhatsApp ordering & tickets, Online Storefront, Phone/Takeaway.
- **Table Session Lifecycle**: Interactive visual floor grid, PIN sessions, dynamic bill calculation, waiter calls, and table-side order review.
- **WhatsApp Integration**: Bi-directional chat, internal staff notes, automated workflow triggers, and reusable template context resolver.
- **Visual System Constraint**: Strict Neutral Monochrome UI (Charcoal, Graphite, Warm Gray, Stone, Off-White). Zero saturated brand colors (No Blue, Navy, Cyan, Amber, Orange, Purple, or Green as brand colors). Prices, tabs, and icons remain neutral; semantic status colors (Sage Green, Muted Ochre, Brick Red) are strictly reserved for actual state transitions.

## Brand Commitments

- **Tone & Identity**: Calm, authoritative, editorial, high-end hospitality operations.
- **Palette**: Warm Architectural Stone (`#f5f5f3` base, `#ffffff` card, `#eaeae7` elevated) in Light Mode, and Cast-Iron Graphite (`#111110` base, `#181817` card, `#222220` elevated) in Dark Mode.
- **Contrast & Accessibility**: Strict WCAG AAA/AA compliance via luminance contrast and 1px hairline borders without neon glows, glassmorphism, or saturated gradients.

## Evidence on Hand

- Fully structured React frontend codebase with modular architecture (`src/modules/{dashboard, orders, tables, menu, whatsapp, website, templates, auth, settings}`).
- Tailored Tailwind token configuration mapped directly to CSS custom properties in `src/index.css`.
- Live API integration layers for Supabase, thermal printing utilities, and real-time state handlers.

## Product Principles

1. **Clarity Over Clutter**: Visual priority is communicated through typography scale, font weight, and surface brightness—never through decorative color splashes.
2. **Operational Speed & Resilience**: Critical actions (order dispatch, table close, bill request) must be reachable within 1-2 clicks with clear tactile confirmation.
3. **Ergonomic Longevity**: The UI must remain comfortable and non-fatiguing for staff working extended shifts.
4. **Data Integrity**: Monetary values, quantities, and order numbers are formatted with precise tabular monospace figures and unambiguous labels.

## Accessibility & Inclusion

- High contrast text-to-background ratios across all surfaces.
- First-class RTL layout and keyboard focus ring affordances (`*:focus-visible`).
- Standard touch target sizes (minimum 36px/44px for operational buttons).
