# Restaurant Management SaaS — Frontend Application

تطبيق الفرونت إند لنظام إدارة المطاعم SaaS، مبني باستخدام React + Vite + JavaScript (ES2022+, ESM) و Tailwind CSS.

## 🚀 التقنيات المعتمدة (Tech Stack)

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript (ES2022+, ESM) — **TypeScript غير مستخدم** (ADR-F001).
- **Styling**: Tailwind CSS v3 (تكوين مخصص بالكامل يعتمد على الـ Design Tokens الرسمية).
- **Data Fetching & Cache**: TanStack Query v5
- **Forms & Validation**: React Hook Form + Zod
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + jsdom
- **Icons**: Lucide React

## 📂 هيكل المشروع (Project Structure)

```text
src/
├── app/                  # App initialization, Providers, Router
├── modules/              # Feature modules (Auth, Health, Menu, Orders, etc.)
├── shared/               # Shared components, Design tokens, Layouts
│   ├── components/       # Primitives (Button, Input, StatusPill, Skeleton, Splash, etc.)
│   ├── design-tokens/    # CSS Variables & JS Tokens
│   └── layout/           # AppShell, Sidebar, Header, MobileNav, ContentContainer
├── lib/                  # Centralized API client & utilities
└── main.jsx              # Entry point
```

## 🛠️ أوامر التشغيل والاستخدام

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev

# بناء النسخة الإنتاجية
npm run build

# تشغيل فحص جودة الكود
npm run lint

# تشغيل اختبارات الوحدة (Unit Tests)
npm run test
```
