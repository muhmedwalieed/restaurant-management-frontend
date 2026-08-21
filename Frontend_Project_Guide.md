# Restaurant Management SaaS — Frontend Master Guide
### Version 1.0 — Final Engineering Master Guide (Single Source of Truth للـFrontend)

> هذه الوثيقة هي **المرجع الوحيد الملزم** للـFrontend في المشروع، وهي الشقيقة المباشرة لـ`Backend_Project_Guide.md`. أي Developer (أو أي AI Agent زي Claude) يبدأ في أي Module أو Feature في الفرونت لازم يقرأها كاملة قبل ما يكتب سطر كود واحد. أي تعارض بين كلام شفهي وبين هذه الوثيقة → **الوثيقة هي الحاكمة**، ولازم تتحدث فورًا لو تم اتخاذ قرار جديد (قسم 25 — Documentation Rules، بنفس منطق قسم 45 في وثيقة الـBackend).

> **قاعدة أساسية غير قابلة للتفاوض:** هذه الوثيقة مبنية فوق أساسين:
> 1. **Design System صارم ضد "شكل التصميم اللي عامله AI"** (قسم 6) — أي واجهة تتعمل في المشروع لازم تعدي منه قبل ما تُعتبر جاهزة.
> 2. **Module-by-Module targeting لنفس ترقيم الـBackend** (قسم 7) — كل Frontend Module بيستهلك API endpoints محددة من Backend Module بنفس الرقم أو المرتبط بيه، وموثقة صراحة هنا.
>
> **مسموح للـAI (أو لأي Developer) إنه يطوّر/يوسّع القواعد الموجودة هنا** (زي إضافة Design Token جديد، أو تحسين قاعدة Component) **بس بشرط**: أي إضافة أو تعديل لازم تتوثق في نفس اللحظة داخل هذا الملف (قسم جديد أو تعديل قسم موجود + سطر في قسم 24 — Audit Log)، مش تتنفذ بصمت في الكود من غير ما الوثيقة تعرف. **الوثيقة لازم تفضل مطابقة للكود دايمًا.**

---

## 🚦 Current Project State (Live Status)

> هذا القسم هو أول حاجة يقرأها أي حد قبل أي حاجة تانية في الملف. لازم يتحدث فورًا كل ما حالة أي Module تتغير (نفس قاعدة قسم 24).

```text
Phase:              FRONTEND PHASE 1 — Foundation
Active Module:      Frontend Module 1 — Foundation & App Shell
Module Status:      CODE COMPLETE — NOT DONE (بانتظار الرفع على Git، وبعدها يتحول لـDONE)
Backend Sync Point: develop @ Module 9 DONE (WhatsApp Integration) — Module 10 (WhatsApp Automation) قيد التنفيذ بالتوازي
Next Module:        Frontend Module 2 — Authentication & Employee Management UI
Tech Stack:         DECIDED (قسم 9) — React + Vite + JavaScript (ES2022+, ESM) + Tailwind CSS + React Router + TanStack Query + React Hook Form + Zod + Lucide React
Language:           JavaScript (ES2022+, ESM) — ADR-F001 (Decided). **ممنوع TypeScript نهائيًا** — نفس قرار الـBackend (ADR-011)، عشان اتساق اللغة عبر الـStack كله، حتى لو الطبقتين منفصلتين تقنيًا.
```

### الخطوة اللي جاية فعليًا

```text
1. الرفع على Git لـFrontend Module 1 (بعد اعتماد المراجعة النهائية — Conventional Commits، قسم 22)
2. تحديث هذه الوثيقة لحالة Module 1 → DONE فور الرفع
3. بناء الـAPI Client Layer (قسم 10) للـEndpoints المطلوبة من Backend Module 2 (Auth/Employees/Roles) — تبدأ مع بدء Frontend Module 2
4. البدء الفعلي في Frontend Module 2 (قسم 7) — بعد تأكيد Backend Module 2 = DONE
```

> **Baseline رسمي معتمد:** كل القرارات في هذا التحديث (Tech Stack، قاعدة Design/Implementation split، Genericity Test، No Silent Design Decisions) هي الـBaseline الرسمي المعتمد قبل أي بدء Coding فعلي — راجع قسم 24 (Audit Log) للتفاصيل.

---

## Table of Contents

0. [🚦 Current Project State](#-current-project-state-live-status)
1. [Project Overview](#1-project-overview)
2. [Product Vision](#2-product-vision)
3. [Scope](#3-scope)
4. [Out of Scope](#4-out-of-scope)
5. [Design Philosophy — لماذا هذا القسم أهم قسم في الملف](#5-design-philosophy)
6. [Design System — Anti-Vibe-Coding Rules (إلزامي، لا يُكسر)](#6-design-system--anti-vibe-coding-rules)
   - [6.28 صلاحية التوسعة](#628-صلاحية-التوسعة-extension-rule)
   - [6.29 No Silent Design Decisions](#629-no-silent-design-decisions-قاعدة-صريحة-ملزمة)
7. [Frontend Modules (Mapped 1-to-1 مع Backend Modules)](#7-frontend-modules)
   - [7.1 Design Exploration vs. Implementation — الفرق الحاكم](#71-design-exploration-vs-implementation--الفرق-الحاكم)
8. [Module Dependencies](#8-module-dependencies)
9. [Tech Stack](#9-tech-stack)
10. [API Integration Layer](#10-api-integration-layer)
11. [Project Structure](#11-project-structure)
12. [State Management Strategy](#12-state-management-strategy)
13. [Routing & Navigation Architecture](#13-routing--navigation-architecture)
14. [Component System](#14-component-system)
15. [Forms & Validation](#15-forms--validation)
16. [Authentication & Session Handling (Frontend)](#16-authentication--session-handling-frontend)
17. [Error Handling](#17-error-handling)
18. [Loading & Empty States](#18-loading--empty-states)
19. [Real-Time Integration](#19-real-time-integration)
20. [Responsive Design Strategy & Accessibility](#20-responsive-design-strategy--accessibility)
21. [Testing Strategy](#21-testing-strategy)
22. [Git Strategy & Conventional Commits](#22-git-strategy--conventional-commits)
23. [Module Definition of Done](#23-module-definition-of-done)
24. [Documentation Rules & Audit Log](#24-documentation-rules--audit-log)
25. [Self-Review Checklist (Solo Developer Mode)](#25-self-review-checklist-solo-developer-mode)
26. [Architecture Decision Records (Frontend)](#26-architecture-decision-records-frontend)
27. [Non-Negotiable Engineering Rules](#27-non-negotiable-engineering-rules)
28. [Final Developer Checklist](#28-final-developer-checklist)

---

## 1. Project Overview

الفرونت ده هو الواجهة الإدارية والتشغيلية لنفس الـRestaurant Management SaaS الموصوف في `Backend_Project_Guide.md`. هدفه إنه يقدّم لمالك/مدير/كاشير/طباخ/موظف دعم المطعم واجهة واحدة يقدر يدير بيها كل حاجة: الأوردرات، الكيتشن، الترابيزات، المنيو، العملاء، الموظفين، الواتساب، التقارير — من غير ما يحس إنه بيستخدم "قالب SaaS جاهز"، لأن المنتج ده هيتستخدم فعليًا وسط ضغط شغل حقيقي (busy service)، مش Demo.

**القاعدة الحاكمة للفرونت كله:** كل Screen بيتبنى لازم يخدم Workflow حقيقي موصوف في وثيقة الـBackend، مش يتبنى لمجرد إن فيه Endpoint جاهز. لو مفيش Business reason واضح للشاشة أو للـComponent، متتبنيش.

---

## 2. Product Vision

نفس رؤية الـBackend بالضبط، بس من عدسة الواجهة:

> **"مدير المطعم يفتح شاشة واحدة، ويعرف بالظبط هو محتاج يعمل إيه دلوقتي."**

مش "لوحة تحكم فيها كل حاجة" — لوحة تحكم فيها **الحاجة الصح في الوقت الصح** (قسم 6.7 من وثيقة التصميم الأصلية، مدموج هنا في قسم 6).

---

## 3. Scope

الـScope الحالي للفرونت = تغطية كل الـEndpoints الموجودة فعليًا في Backend Module 1 → 10 (كلهم DONE فيما عدا Module 10 قيد الإنجاز)، مقسّمة على Frontend Modules بنفس الترقيم (قسم 7). أي Backend Module بعد كده (11 → 20) بيتبنى له Frontend Module موازي **بس بعد ما الـBackend الخاص بيه يكون DONE فعليًا** — مفيش شغل فرونت على Endpoint لسه Draft أو TBD في الـBackend.

---

## 4. Out of Scope

- ❌ **Inventory** و ❌ **AI** — بنفس القاعدة تمامًا من وثيقة الـBackend (قسم 4 هناك). أي شاشة أو Component يفترض وجودهم يُرفض تلقائيًا.
- ❌ أي Endpoint مش موثق في `Backend_Project_Guide.md` كـDONE — الفرونت ميسبقش الباك اند أبدًا، بيمشي بالتوازي أو بعده، مش قبله.
- ❌ Design Systems أو UI Kits جاهزة بالكامل (زي استخدام Template SaaS كامل) — مسموح الاستعانة بمكتبات Primitives غير مصممة بصريًا (زي Radix Primitives) لكن مش بمظهرها الجاهز.

---

## 5. Design Philosophy

> السبب اللي الملف ده اتعمل بالتفصيل ده عشانه: أي Frontend مبني بمساعدة AI عنده ميل طبيعي إنه يطلع "شكل SaaS عام" — Gradient بنفسجي، Hero كبير في النص، 3 Cards، Bento Grid، Glassmorphism. النتيجة بتبقى شكل تقدر تحطه على أي منتج (CRM, HR, Crypto) من غير ما حد يحس بفرق.

**القاعدة الحاكمة:** أي قرار بصري لازم يكون له سبب مرتبط بـ Workflow المطعم الفعلي، مش لأنه "بيبان حلو" أو "شائع". قبل أي إضافة بصرية، اسأل:

> "المشكلة دي بتحل إيه لموظف بيشتغل تحت ضغط وقت أثناء الخدمة؟"

لو مفيش إجابة قوية → متضيفهاش.

**الأولويات (بالترتيب عند التعارض):**

```text
usability > novelty
clarity > decoration
hierarchy > visual noise
product identity > trends
information density with structure > empty marketing space
```

---

## 6. Design System — Anti-Vibe-Coding Rules

> هذا القسم **إلزامي وملزم لكل شاشة/Component يتبني في المشروع**، ومأخوذ ومُدمَج من الـMaster Design Prompt الأصلي (Restaurant SaaS Design System)، مع صلاحية موثقة للـAI/Developer إنه **يوسّع** فيه (مش يكسره) طالما وثّق التوسعة في قسم 24.

### 6.1 المبدأ الأساسي

كل قرار بصري لازم يكون له سبب. ممنوع تضيف Element لأنه:
- بيبان "مودرن"
- بيملى فراغ في الشاشة
- شائع في قوالب SaaS اللي الـAI بيعملها
- شائع على Dribbble
- Tailwind أو أي مكتبة بتسهّله
- "الصفحة عادة بتحتوي عليه" في منتجات تانية

### 6.2 أنماط ممنوعة إلا لو فيه سبب قوي مرتبط بالمنتج

```text
- Gradients بنفسجي/أزرق عام أو Gradients ملونة عشوائية
- Glassmorphism مبالغ فيه / Blur مبالغ فيه / Shadows مبالغ فيها
- rounded-2xl / rounded-3xl في كل حتة
- Bento grids افتراضية
- Hero Section كبير نص الصفحة بشكل افتراضي
- كلمات بـGradient جوه العناوين
- Glow خلفيات بدون معنى / Floating blobs / Neon accents
- إيموجي كـIcons في الواجهة
- استخدام مبالغ فيه للأيقونات، أو أيقونات ضخمة ديكوريشن فوق كل Heading
- Illustrations عامة بشكل AI-generated
- Dashboards وهمية (Fake data) لمجرد الشكل
- KPI Cards زيادة عن اللزوم أو مكررة
- Badges/Pills/Tooltips بدون داعي فعلي
- Animations على كل Element (fade-up على كل Section، hover transform على كل Card)
- Dark mode "Premium" افتراضي بدون سبب Product
- Testimonials/"Trusted by thousands"/"10x your business" — كوبي عام
- كل معلومة تتحول لـCard ("Card soup")
- Sidebar بيعكس أسماء الـBackend Modules حرفيًا بدل الـWorkflow
```

### 6.3 الشخصية البصرية للمنتج

المنتج لازم يحس بيه المستخدم إنه: professional, operational, confident, calm, precise, trustworthy, mature, efficient — **premium من غير luxurious**، **modern من غير trendy**. يعني ثقة أثناء ضغط الخدمة، مش واجهة AI-startup أو Developer tool أو Crypto dashboard.

### 6.4 Product-First — كل Concept بيتترجم لمعنى مطعم حقيقي

ممنوع "Analytics Card" عامة — لازم تبقى: sales trends, order volume, average order value, peak hours, preparation time, cancellation rate, branch performance, menu item performance... إلخ. كل Screen بيتصمم حوالين الـWorkflow الفعلي الموصوف في Backend Module اللي بيغذّيه (قسم 7).

### 6.5 Navigation

الـSidebar بيعكس الطريقة اللي المستخدم بيفكر بيها فعليًا (Orders → Kitchen → Tables → Customers → Menu → Reports)، **مش** ترقيم الـBackend Modules. كل Nav item لازم يبرر وجوده. الـNavigation الكامل المقترح (قابل للتعديل كـADR):

```text
Dashboard
Orders          (يشمل POS quick-create)
Kitchen (KDS)
Tables
Menu
Customers
WhatsApp / Inbox   (بعد إتمام Module 9/10/11 Backend)
Reports
Settings           (Restaurant/Branches/Employees/Roles)
```

### 6.6 Information Hierarchy

الأولوية دايمًا: (1) إيه اللي محتاج تدخل فوري، (2) إيه اللي بيساعد في قرار، (3) إيه اللي بيساعد في إنهاء شغل النهارده، (4) Context مفيد، (5) حاجات ممكن تتخبى لحد ما تُطلب. المعلومة المهمة تبقى واضحة بصريًا، والثانوية تبقى هادية — مش كل حاجة "مهمة بصريًا" في نفس الوقت.

### 6.7 Dashboard Rules

مبتبدأش ببناء KPI Cards. حدد الأول: "مدير المطعم لما يفتح الـDashboard محتاج يعرف إيه؟" بالترتيب:

```text
1. مشاكل تشغيلية عاجلة (orders متأخرة، مطبخ متكدس، اتصال WhatsApp واقع...)
2. حالة اليوم التجارية (orders count, revenue today, active tables)
3. اتجاهات (trend مقارنة بالأسبوع اللي فات)
4. Insights قابلة للتنفيذ
5. معلومات ثانوية
```

ممنوع KPI مكرر، وكل Metric لازم يجاوب سؤال Business حقيقي.

### 6.8 Tables vs Cards

البيانات التشغيلية (Orders list, Customers list, Employees list) تُعرض في **Tables** حقيقية (readability, alignment, scanability, status visibility, filter, sort, search, pagination, row actions) — مش تتحول كل واحدة منها لـCard. الـCards تُستخدم فقط للـGrouped concepts (مثال: ملخص فرع، بطاقة عميل مفصّلة).

### 6.9 Status Design

الألوان Semantic بس، مش ديكوريشن:

```text
Success  → completed / paid / active
Warning  → pending / delayed / attention required
Error    → failed / cancelled / critical
Neutral  → draft / inactive / archived
```

الحالة لازم تتفهم من النص أولًا، والأيقونة لو لزم، واللون تعزيز ثانوي — أبدًا مش اعتماد على اللون وحده.

### 6.10 Typography

Hierarchy واضحة بعدد محدود من: font families, weights, sizes, line-heights. ممنوع عناوين ضخمة (72px) بشكل افتراضي في كل مكان. الخط لازم يخلي المنتج يحس بيه "ناضج وهادي" مش "صارخ".

### 6.11 Design Tokens (Semantic Color System — إلزامي قبل أي Component)

قبل أي Component يتبني، لازم يكون فيه Token system معرّف صراحة (CSS variables أو Tailwind theme extension):

```text
--bg-base
--bg-surface
--bg-surface-elevated
--color-primary
--color-accent
--text-primary
--text-muted
--border-default
--status-success
--status-warning
--status-danger
--status-info
```

ممنوع تُضاف ألوان عشوائية خارج الـTokens دي. ممنوع يتغير الـPrimary color بين الصفحات. لو استُخدم Gradient لازم يكون subtle وله سبب واضح موثق.

### 6.12 Border Radius Scale

```text
small  : 6px   (badges, inputs صغيرة)
medium : 8–10px (buttons, inputs, أغلب الـComponents)
large  : 12–16px (Cards/Modals الكبيرة)
pill   : فقط لما يكون فيه معنى Semantic (زي Status pill)
```

ممنوع rounded-2xl/rounded-3xl افتراضي على كل حاجة.

### 6.13 Shadows & Elevation

الافتراضي: الاعتماد على Borders + Spacing + Surface contrast، مش Shadows. الـElevation تُستخدم فقط لما تنقل Hierarchy فعلية (مثال: Modal فوق المحتوى، Dropdown). ممنوع Shadow على كل Card.

### 6.14 Cards

الـCard مش الـContainer الافتراضي لكل حاجة. تُستخدم فقط لما تعمل Grouping له معنى. ممنوع Card جوه Card جوه Card ("Card soup"). استخدم بدلًا منها: whitespace, dividers, sections, tables, typography, alignment.

### 6.15 Iconography

نظام أيقونات واحد محترف بس في المشروع كله (Lucide مقترح — ADR قابل للتغيير). ممنوع إيموجي كأيقونات واجهة. الأيقونة بتوصل وظيفة، مش ديكور.

### 6.16 Modals / Drawers / Full Pages

```text
Modal   → فعل واحد محدد ومكتفي بذاته (إنشاء عميل، تعديل ترابيزة، إضافة صنف منيو، تأكيد فعل هدام)
Drawer  → فقط لما الحفاظ على الـContext الحالي بيحسّن الـWorkflow
Full Page → Workflows معقدة (Order details, Analytics, Settings, Customer profile)
```

### 6.17 Forms

الفورم تُبنى حوالين مهمة المستخدم مش حوالين شكل الـDatabase. ممنوع تعرض كل حقل موجود في الـPrisma schema. استخدم Grouping منطقي + Progressive disclosure عند الحاجة، والحقول المطلوبة واضحة بصريًا، مع Validation واضح (مرتبط بنفس الـZod schemas اللي الباك اند بيستخدمها كمرجع منطقي — قسم 15).

### 6.18 Analytics

كل Chart لازم يجاوب سؤال حقيقي ("هل المبيعات بتزيد؟"، "إمتى الزحمة؟"، "إيه أكتر فرع أداء؟"). ممنوع Charts ديكوريشن بدون تفسير أو بدون بيانات حقيقية من الـBackend.

### 6.19 Empty States

```text
❌ "Nothing here yet."
✅ "لسه معندكش أصناف في المنيو." + "ضيف أول صنف عشان تقدر تبدأ تستقبل أوردرات." + [زرار: إضافة صنف]
```

### 6.20 Loading States

Skeletons للمناطق كثيفة المحتوى، مش Spinner ضخم دايمًا. الـLayout ميتزحزحش أثناء التحميل (Layout stability).

### 6.21 Error States

ممنوع "Something went wrong" لوحدها. لازم: إيه اللي حصل؟ ليه؟ إيه اللي المستخدم يقدر يعمله دلوقتي؟ + فعل واضح للتعافي (Retry, Contact support...).

### 6.22 Animation

Motion وظيفي بس (state transitions, فتح/قفل Dialogs, انتقالات Navigation, Feedback, Drag/drop, تغيير Status). ممنوع نفس الـFade-up على كل Section. Motion يحترم `prefers-reduced-motion`.

### 6.23 Responsive Design — Design Constraint أساسي مش خطوة لاحقة

> **مبدأ حاكم:** Responsive behavior is part of the design, not a post-processing step. كل Screen في المشروع بيتصمم من أول لحظة عشان يشتغل بصريًا ووظيفيًا على كل الأجهزة — مش "Desktop الأول وبعدين نعمله mobile version". التفاصيل الكاملة والقواعد الملزمة موثقة في **قسم 20 (Responsive Design Strategy)** — القسم ده جزء أساسي من الـDesign System بنفس وزن أي قاعدة تانية هنا، مش قسم إضافي منفصل.

الهدف مش "Nothing overflows on mobile" — الهدف إن كل Viewport يكون له **UX Strategy مقصودة**: إيه اللي يفضل ظاهر، إيه اللي يختفي، إيه اللي يتكثّف، إيه اللي يبقى Drawer/Bottom Sheet، وإيه هي الـPrimary actions على الجهاز ده تحديدًا.

### 6.24 Accessibility

Keyboard navigation, Visible focus states, Contrast كافي, Semantic HTML, Accessible labels, Touch targets مناسبة, رسائل خطأ مفهومة لقارئ الشاشة — الـAccessibility جزء من التصميم مش إضافة لاحقة.

### 6.25 Copywriting

ممنوع لغة تسويقية عامة ("Empower your business", "Take it to the next level", "Unlock your potential"). الكوبي لازم يوصف فعل/حالة/نتيجة حقيقية بلغة مطعم.

### 6.26 Variety Without Chaos

الاتساق مش تكرار. كل Module بيعكس طبيعة شغله (Orders بتولّي أهمية للـTable/Status، KDS بيولّي أهمية لأعمدة الحالة الكبيرة، Tables بتولّي أهمية للتنظيم المكاني، Menu بتولّي أهمية للتصنيف الهرمي، Analytics بتولّي أهمية للـCharts، Settings بتولّي أهمية للفورمز).

### 6.27 Self-Critique قبل اعتماد أي شاشة (إلزامي لكل Screen)

قبل ما تعتبر أي Screen خلصت، اسأل:

```text
1. ده شكله عام زي أي AI-generated SaaS dashboard؟
2. ضفت أي Gradient بدون سبب قوي؟
3. استخدمت Cards زيادة عن اللزوم؟
4. عملت KPI Cards مش لازمة؟
5. كررت نفس الـLayout كتير أوي؟
6. استخدمت أيقونات كديكور؟
7. عملت Animations مش لازمة؟
8. الـSidebar بيعكس Workflow المستخدم فعلًا؟
9. كل Component له سبب وجود؟
10. ده بيبان أنه اتعمل لمطعم تحديدًا، ولا أي منتج تاني ممكن ياخده زي ما هو؟
11. **Genericity Test:** ممكن الشاشة دي تتستخدم تقريبًا زي ما هي في منتج SaaS تاني (CRM, HR, Project Management, Fintech, AI tooling) من غير تعديل يُذكر؟
```

> **السؤال الحاسم (Genericity Test):** لو الإجابة على السؤال 11 = **YES** → الشاشة على الأغلب Generic أوي، وده Signal واضح إنك لازم تعيد التقييم. الواجهة لازم توصل بوضوح إنها **Restaurant Management SaaS تحديدًا**، مش Dashboard SaaS عام. لو الشاشة دي ممكن تتحط في CRM أو HR أو Crypto app من غير أي تعديل → **ارفضها وأعد تصميمها.**

### 6.28 صلاحية التوسعة (Extension Rule)

الـAI/Developer مسموح له يضيف قواعد تصميم جديدة (Component pattern جديد، Token إضافي، Layout pattern جديد لـModule معين) **بشرط**:
1. القاعدة الجديدة ماتتعارضش مع أي قاعدة موجودة في قسم 6.
2. يتم توثيقها فورًا كـsub-section جديد هنا أو تعديل صريح، + سطر في قسم 24 (Audit Log) يوضح: إيه اتضاف، وليه.
3. القاعدة الجديدة تتبع نفس المنطق: "لازم يكون له سبب Product مرتبط بالمطعم، مش سبب بصري بحت."

### 6.29 No Silent Design Decisions (قاعدة صريحة ملزمة)

> **أي Design token، Visual pattern، Component behavior، Navigation pattern، Animation pattern، Breakpoint، أو UX convention مش معرّف أصلًا في قسم 6 — ممنوع يتم إدخاله بصمت.**

هذا ينطبق على كل قرار تصميمي بدون استثناء: لون جديد، Typography scale جديد، Spacing value جديد، Radius جديد، Shadow جديد، Animation pattern جديد، شكل Icon جديد، Gradient عشوائي، أو أي Component variant مش موصوف في الـDesign System. **الـAI ممنوع يخترع أي حاجة من دي من نفسه** — أي قرار تصميمي جديد لازم يمر بالـWorkflow التالي **قبل** التنفيذ:

```text
New decision
    ↓
Justification    (ليه محتاجينه؟ إيه المشكلة اللي بيحلها لمستخدم المطعم تحديدًا؟)
    ↓
Documentation    (يُضاف كـsub-section في قسم 6 أو يُعدَّل قسم موجود صراحة)
    ↓
Audit Log / ADR when appropriate   (سطر في قسم 24، أو ADR جديد في قسم 26 لو القرار معماري)
    ↓
Implementation   (الكود بيتكتب بعد كده بس، مش قبل)
```

**القاعدة الحاسمة:** الـAI بيُنفّذ Product design متعمَّد ومحدد سلفًا في هذا الملف — **الـAI مش هو اللي بيخترع الـProduct design.** لو محتاج قرار جديد ومش موجود، بيوثقه ويبرره الأول، مش ينفذه ويشرحه بعدين.

---

## 7. Frontend Modules

### 7.1 Design Exploration vs. Implementation — الفرق الحاكم

القاعدة الأساسية في قسم 8 (Module Dependencies) بتمنع بدء أي **Implementation/Integration** لـFrontend Module قبل ما الـBackend Module المقابل يبقى DONE. لكن ده لازم يتفرّق بوضوح عن نوعين تانيين من الشغل مسموح يبدأوا بدري:

```text
مسموح يبدأ فورًا (حتى لو الـBackend لسه شغال):
  - Design/UX Exploration (Wireframes, User flows, Layout thinking)
  - UI Architecture (هيكلة الـComponents، تقسيم الشاشات)
  - Component Planning (إيه هي الـShared components المطلوبة، إزاي هتتبنى)

ممنوع يبدأ قبل ما الـBackend Module المقابل يبقى DONE فعليًا:
  - API Integration (ربط أي Endpoint فعلي)
  - Real Data Integration (استهلاك بيانات حقيقية من الـDatabase)
  - Production Implementation (الكود النهائي اللي هيتنشر)
```

**بمعنى:** تقدر تفكر وترسم وتخطط لـFrontend Module 6 (Orders) وانت لسه في نص Module 4، لكن متكتبش `useOrders()` hook أو `orders.api.js` فعلي إلا لما Backend Module 6 يبقى `DONE` رسميًا في `Backend_Project_Guide.md`.

### 7.2 توضيح الـMapping — Backend Modules ≠ Frontend Screens

الترقيم 1:1 بين Backend Modules وFrontend Modules (قسم 7 بالكامل تحت) هو **Traceability mapping** بس — مش افتراض إن عدد الشاشات أو الـComponents في الفرونت لازم يطابق هيكلة الـBackend:

- **Backend Modules** بتمثل **Business/API boundaries** (إيه الـData والـLogic الموجودة).
- **Frontend Modules** بتمثل **User workflows/Screens/Features** (إزاي المستخدم بيتفاعل مع الداتا دي فعليًا).

مثال: Backend Module 6 (Core Order Management) عنده Endpoint واحد لكل حاجة، لكن Frontend Module 6 المقابل له ممكن يحتاج شاشتين مختلفتين تمامًا في التصميم (Orders list العادية + KDS بتصميم مختلف كليًا) لأن الـWorkflow مختلف حتى لو الـAPI مصدره واحد — وده بالظبط الموصوف فعلًا في قسم 6.26 (Variety without Chaos).

> **مبدأ الترقيم:** كل Frontend Module بياخد نفس رقم الـBackend Module اللي بيغذّيه، عشان التتبع يبقى مباشر بين الوثيقتين. الترتيب هنا **ملزم** — ممنوع نبدأ Module فرونت قبل ما الـBackend Module المقابل يبقى `DONE` رسميًا في `Backend_Project_Guide.md`.

### Frontend Module 1 — Foundation & App Shell
**الحالة:** CODE COMPLETE — NOT DONE (بانتظار الرفع على Git) — التحديث النهائي لـDONE بعد الرفع
**بيغطي:** App shell responsive بالكامل من أول لحظة (مش Desktop الأول وبعدين mobile version — راجع قسم 20 كامل، الملزم لهذا الـModule تحديدًا)، Design tokens setup (قسم 6.11)، API client + interceptors (قسم 10)، Tenant/Auth context provider، Routing skeleton، Error boundary عام، Health check indicator.

**ترتيب البناء الإلزامي (لا يجوز تغيير الترتيب — قسم 20.12):**
```text
Design Tokens → App Shell → Desktop Navigation → Tablet Navigation → Mobile Navigation
→ Header → Branch Context → User Context → Content Container → Responsive Layout Rules
```

**الشاشات:** Login page، Loading/Splash state، Layout container (بدون محتوى Business بعد) — وكل واحدة منهم لازم تتفحص عبر كل الـViewport Classes (قسم 20.11) قبل ما الـModule يُعتبر DONE، لأن باقي الـModules هتورث نفس الـApp Shell ده.

**API Target (من Backend Module 1):** `GET /health`, `GET /ready` — **ملاحظة مهمة:** الـHealth endpoints معمولين Mount على الجذر `/` (مش تحت `/api` ولا `/api/v1` — بيشتغلوا بره الـAuth كمان) وبيتستدعوا عبر `apiHealthClient` مستقل بيشاور على الـOrigin بس، مع نفس الـSuccess unwrapping (قسم 10 — Module 1).

### Frontend Module 2 — Authentication & Employee Management UI
**الحالة:** NOT STARTED
**بيغطي:** Login/Logout flow, Session handling (Access/Refresh)، Force logout UX ("this account is already active on another device")، Employees management (List/Create/Edit/Change role/Change password/Soft-delete)، Roles management (List/Create/Edit/Delete)، Permission-aware UI (إخفاء/تعطيل الأزرار حسب صلاحية المستخدم).
**الشاشات:** `/login`, `/settings/employees`, `/settings/employees/:id`, `/settings/roles`.
**API Target (من Backend Module 2):**
```text
POST /auth/login · POST /auth/logout · POST /auth/refresh
GET/POST /employees · GET/PATCH /employees/:id
POST /employees/:id/change-password · POST /employees/:id/change-role
DELETE /employees/:id (soft-delete)
GET/POST /roles · GET/PATCH/DELETE /roles/:id
```

### Frontend Module 3 — Restaurant & Branch Management UI
**الحالة:** NOT STARTED
**بيغطي:** Restaurant profile settings, Branches list/create/edit/deactivate, Working hours editor (7-day schedule), Branch settings.
**الشاشات:** `/settings/restaurant`, `/settings/branches`, `/settings/branches/:id`.
**API Target (من Backend Module 3):**
```text
GET/PATCH /restaurant · PATCH /restaurant/status
GET/POST /branches · GET/PATCH/DELETE /branches/:id
GET/PUT /branches/:id/working-hours · GET/PUT /branches/:id/settings
```

### Frontend Module 4 — Menu Management UI
**الحالة:** NOT STARTED
**بيغطي:** Categories CRUD, Products CRUD (بما فيها الصور والتوافر/Availability), Modifiers CRUD, Public menu preview (نفس الـEndpoint العام اللي بيستخدمه الـQR/WhatsApp).
**الشاشات:** `/menu/categories`, `/menu/products`, `/menu/products/:id`, `/menu/modifiers`.
**API Target (من Backend Module 4):**
```text
Categories: GET/POST /categories · GET/PATCH/DELETE /categories/:id
Products:   GET/POST /products · GET/PATCH/DELETE /products/:id
Modifiers:  GET/POST /modifiers · GET/PATCH/DELETE /modifiers/:id
GET /menu/public (preview فقط)
```

### Frontend Module 5 — Tables & QR UI
**الحالة:** NOT STARTED
**بيغطي:** Tables layout view (بالفرع)، Create/Edit/Delete table، Regenerate QR + عرض/تحميل صورة QR، Table status indicator حي.
**الشاشات:** `/branches/:branchId/tables`.
**API Target (من Backend Module 5):**
```text
GET/POST /branches/:branchId/tables
GET/PATCH/DELETE /branches/:branchId/tables/:id
POST /branches/:branchId/tables/:id/regenerate-qr
```

### Frontend Module 6 — Core Order Management UI + KDS
**الحالة:** NOT STARTED
**بيغطي:** Orders list (فلترة/بحث/Sort)، Order detail view + Status timeline (statusHistory)، تغيير الحالة حسب الـState Machine (قسم 25 في الـBackend guide)، Cancel flow (مع سبب إلزامي)، **Kitchen Display System (KDS)** كشاشة منفصلة بتصميم مختلف (FIFO columns حسب الحالة + elapsedMinutes بارز).
**الشاشات:** `/orders`, `/orders/:id`, `/kds`.
**API Target (من Backend Module 6):**
```text
GET/POST /branches/:branchId/orders · GET /branches/:branchId/orders/:id
PATCH /branches/:branchId/orders/:id/status · POST /branches/:branchId/orders/:id/cancel
GET /branches/:branchId/orders/:id/history
GET/PATCH /branches/:branchId/kds/orders
```

### Frontend Module 7 — Customer Management / CRM UI
**الحالة:** NOT STARTED
**بيغطي:** Customers list + search (اسم/تليفون)، Customer profile (بيانات + عناوين متعددة + Order history عبر كل الفروع)، إدارة العناوين (Default address logic).
**الشاشات:** `/customers`, `/customers/:id`.
**API Target (من Backend Module 7):**
```text
GET/POST /customers · GET/PATCH/DELETE /customers/:id · GET /customers/:id/orders
GET/POST /customers/:id/addresses · PATCH/DELETE /customers/:id/addresses/:addressId
```

### Frontend Module 8 — Staff / POS Ordering UI
**الحالة:** NOT STARTED
**بيغطي:** واجهة POS سريعة للكاشير (اختيار منتجات → عربة → عميل/ترابيزة → إنشاء أوردر بأقل احتكاك)، Payment flow، Refund flow (بصلاحية منفصلة)، ربط حالة الترابيزة اللحظية.
**الشاشات:** `/pos`, داخل `/orders/:id` أزرار Payment/Refund.
**API Target (من Backend Module 8):**
```text
POST /branches/:branchId/pos/orders
POST /branches/:branchId/orders/:id/payment
POST /branches/:branchId/orders/:id/refund
```

### Frontend Module 9 — WhatsApp Integration UI (Admin)
**الحالة:** NOT STARTED
**بيغطي:** إدارة اتصال الواتساب (Connect/Status/Disconnect)، عرض سجل الرسائل (Messages log) للمراقبة الفنية، إعادة محاولة الـWebhook events الفاشلة.
**الشاشات:** `/settings/whatsapp`.
**API Target (من Backend Module 9):**
```text
POST/GET/PATCH/DELETE /v1/whatsapp/connection
POST/GET /v1/whatsapp/messages · GET /v1/whatsapp/messages/:id
POST /v1/whatsapp/webhooks/retry
```

### Frontend Module 10 — WhatsApp Automation Monitoring UI
**الحالة:** NOT STARTED (يبدأ بعد ما Backend Module 10 يبقى DONE)
**بيغطي:** شاشة مراقبة فقط لتدفقات الأتمتة (مش Flow builder — الـFlow logic كله Backend). عرض حالة كل محادثة أتمتة (Welcome/Menu/Cart/Address/Order/FAQ/Handoff)، ومؤشر "Human handoff مطلوب" اللي بيوصل لـUnified Inbox (Module 11 لاحقًا).
**الشاشات:** جزء من `/inbox` مستقبلًا — الشاشة النهائية تُحدد بدقة أول ما الـBackend API الخاص بيها يتوثق كـDONE.
**API Target:** يُستكمل فور توثيق Endpoints الـModule 10 كـDONE في وثيقة الـBackend.

### Frontend Modules 11 → 20 (Roadmap — تُفصَّل لاحقًا)

بنفس منطق Backend Modules 11 → 20 (Unified Inbox, Manager Takeover, Website Ordering, Phone Ordering, Dashboard & Analytics, Coupons, Notifications, Audit Logs, Multi-Branch, Manager Mobile). كل واحد منهم هيتوصف بنفس التفصيل بمجرد ما نوصله في الـRoadmap — مفيش تصميم مسبق لشاشات مش قريبة عشان نتجنب الافتراضات الغلط.

---

## 8. Module Dependencies

```text
Frontend Module 1 (Foundation)
    ↓ Hard
Frontend Module 2 (Auth & Employees)
    ↓ Hard
Frontend Module 3 (Restaurant/Branch)
    ↓ Hard
Frontend Module 4 (Menu)     Frontend Module 5 (Tables/QR)     Frontend Module 7 (Customers)
    ↓ Hard                        ↓ Hard                              ↓ Soft
                    Frontend Module 6 (Orders + KDS)
    ↓ Hard                                              ↓ Hard
Frontend Module 8 (POS)                          (Website Ordering لاحقًا)
    ↓ Integration
Frontend Module 9 (WhatsApp Admin)
    ↓ Hard
Frontend Module 10 (WhatsApp Automation Monitoring)
```

نفس تصنيف Hard/Soft/Integration المستخدم في وثيقة الـBackend (قسم 41 هناك) — الفرونت بيورّث نفس منطق الاعتماديات لأنه بيعكس نفس الـBusiness domain.

---

## 9. Tech Stack

> **الحالة: DECIDED.** الـStack ده هو الـBaseline الرسمي المعتمد — مش اقتراح قابل للنقاش من دلوقتي. أي تغيير عليه بعد كده لازم ADR جديد صريح يوضح السبب (قسم 26)، مش تعديل ارتجالي.

| الطبقة | القرار | الحالة | السبب |
|---|---|---|---|
| Framework | React | **Decided** | أكبر Ecosystem، توافق مع Component patterns المطلوبة |
| Build Tool | Vite | **Decided** | سرعة Dev server + بساطة الإعداد لمشروع Modular-style frontend |
| Language | **JavaScript (ES2022+, ESM)** | **Decided** | **ممنوع TypeScript نهائيًا في المشروع كله** — اتساق مباشر مع ADR-011 في الـBackend (JavaScript خالص). التوثيق الاختياري لشكل الـAPI responses/Props يكون عبر JSDoc عند الحاجة، بدون أي `.ts`/`tsconfig.json` في الـRepo — راجع ADR-F001 (قسم 26) |
| Styling | Tailwind CSS (Config مخصص بالكامل — بدون أي Theme جاهز) | **Decided** | يسمح بتطبيق الـDesign Tokens (قسم 6.11) مباشرة بدون قوالب افتراضية |
| Data Fetching / Cache | TanStack Query | **Decided** | يطابق شكل الـAPI (REST + Pagination + Unified response format من Backend قسم 19) |
| Forms | React Hook Form + Zod | **Decided** | نفس أداة الـValidation المستخدمة في الباك اند (Zod) — اتساق منطقي بين الطبقتين |
| Routing | React Router | **Decided** | يدعم Nested routes مطابقة لهيكل الـModules |
| Icons | Lucide React | **Decided** | مطابق لقسم 6.15 |
| Global/Client State | **بدون مكتبة افتراضية** — `useState`/React Context كافيين للـUI state البسيط | **Decided** | **ممنوع Redux أو أي Global state library تُضاف افتراضيًا.** تُضاف فقط لو ظهر Use case حقيقي أثناء التنفيذ الفعلي بيبرر الحاجة (مثال: UI state معقد جدًا ومشترك بين Modules بعيدة) — وحتى وقتها لازم ADR جديد يوثق السبب قبل الإضافة (قسم 26)، مش تُضاف احتياطيًا من الأول |
| Component Primitives | Radix UI (Unstyled) | Proposed — يُحسم عند أول استخدام فعلي | Accessibility جاهزة (قسم 6.24) بدون فرض شكل بصري؛ لو ظهر بديل أنسب وقت التنفيذ، يتغير عبر ADR |
| Real-time | Socket.IO Client | Proposed — يُحسم عند الوصول لـModule فيه Real-time فعلي | يطابق قرار الباك اند (Socket.IO — ADR في وثيقة الباك اند قسم 29) |
| Testing | Vitest + React Testing Library + jsdom | **Decided** (أُحسم عند أول استخدام فعلي في Module 1) + Playwright (E2E) | يطابق فلسفة الباك اند (Unit + Integration + E2E للـFlows الحرجة) — Playwright يفضل Proposed لحد ما قسم 21 يبدأ فعليًا |
| Lint/Format | ESLint + Prettier | **Decided** | خط دفاع أساسي زي الباك اند (بدون أي TypeScript-only tooling) |
| API Integration | طبقة API Client مركزية وموحّدة (قسم 10) | **Decided** | مفروضة كقاعدة معمارية غير قابلة للتفاوض — راجع قسم 10 و27 |

> أي تقنية غير مذكورة هنا ومطلوب إضافتها لازم تتوثق كـADR جديد في قسم 26 قبل الاستخدام (نفس قاعدة الـBackend). البنود المُعلَّمة **Decided** لا تُناقَش من جديد إلا بـADR صريح يوضح سبب التغيير.

---

## 10. API Integration Layer

### 10.1 المبدأ

كل تواصل مع الـBackend بيمر من طبقة واحدة (`src/lib/api-client`) — ممنوع أي Component يعمل `fetch`/`axios` مباشر. نفس فلسفة الـBackend في عزل الطبقات (قسم 11 هناك)، مطبّقة هنا بشكل معكوس (الفرونت بيستهلك مش بيقدّم).

```text
Component
   ↓
Hook (useOrders, useCreateOrder, ...) — TanStack Query
   ↓
API Service function (orders.api.js) — واحد لكل Backend Module
   ↓
API Client (axios instance واحد) — auth header, tenant context, error normalization
   ↓
Backend REST API
```

### 10.2 هيكلة الـServices — Module-per-Module (مطابق للترقيم في قسم 7)

```text
src/lib/api/
  auth.api.js          → Frontend Module 2
  employees.api.js      → Frontend Module 2
  roles.api.js           → Frontend Module 2
  restaurant.api.js     → Frontend Module 3
  branches.api.js        → Frontend Module 3
  menu.api.js             → Frontend Module 4
  tables.api.js           → Frontend Module 5
  orders.api.js           → Frontend Module 6
  kds.api.js              → Frontend Module 6
  customers.api.js        → Frontend Module 7
  pos.api.js               → Frontend Module 8
  whatsapp.api.js          → Frontend Module 9
```

### 10.3 قاعدة الاستجابة الموحّدة (مرآة قسم 19.4 في الـBackend)

كل Response من الباك اند بييجي بالشكل:

```json
{ "success": true, "data": {}, "message": "..." }
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 20, "total": 143, "totalPages": 8 } }
{ "success": false, "error": { "code": "...", "message": "...", "requestId": "..." } }
```

الـAPI Client لازم:
- يستخرج `data` تلقائيًا للـSuccess cases.
- يحوّل الـ`error.code` لرسالة UI مفهومة (Error mapping table — قسم 17).
- يمرر `requestId` لأي Error UI/Log تشخيصي.
- يتعامل مع 401 (Access token منتهي) عبر محاولة Refresh تلقائي مرة واحدة، وبعدين Redirect لـLogin لو فشل.
- يتعامل مع 409 (Optimistic Locking conflict على الأوردرات) بعرض رسالة "الأوردر اتغير من حد تاني، بنحدّث الشاشة" + Refetch تلقائي.

### 10.4 قاعدة التتبع (Traceability Rule)

أي Endpoint جديد بيتضاف في الفرونت لازم يتربط صراحة بالـModule بتاعه في قسم 7 (تحديث الـAPI Target list). ممنوع Endpoint "يتيه" من غير ما يبقى معروف هو بيخدم أي Frontend Module.

---

## 11. Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers.jsx        # QueryClient, Auth, Theme...
│   │
│   ├── modules/                  # نفس ترقيم الـBackend (قسم 7) — Traceability بس، راجع 7.2
│   │   ├── auth/
│   │   ├── employees/
│   │   ├── roles/
│   │   ├── restaurant/
│   │   ├── branches/
│   │   ├── menu/
│   │   ├── tables/
│   │   ├── orders/
│   │   ├── kds/
│   │   ├── customers/
│   │   ├── pos/
│   │   └── whatsapp/
│   │       ├── components/       # UI خاص بالـModule ده بس
│   │       ├── hooks/            # useX hooks (React Query)
│   │       ├── pages/            # الشاشات الفعلية (Routes)
│   │       └── types.js          # JSDoc typedefs المطابقة لشكل الـAPI response (توثيق اختياري، مش Enforcement)
│   │
│   ├── shared/
│   │   ├── components/           # Design system primitives (Button, Input, Table, Modal...)
│   │   ├── design-tokens/        # قسم 6.11 — CSS variables / Tailwind theme
│   │   ├── hooks/
│   │   ├── layout/                # Sidebar, Topbar, PageContainer
│   │   └── utils/
│   │
│   ├── lib/
│   │   ├── api/                   # قسم 10.2
│   │   ├── api-client.js
│   │   └── socket.js               # Real-time client (قسم 19)
│   │
│   └── main.jsx
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── package.json                   # "type": "module" إلزامي — نفس منطق الـBackend (قسم 10.1 هناك)
├── tailwind.config.js
├── .eslintrc.json
└── README.md
```

> **ملاحظة إلزامية:** مفيش `tsconfig.json` ولا أي ملف `.ts`/`.tsx` في المشروع إطلاقًا (راجع ADR-F001 وقسم 9). أي كود اتكتب بالغلط بصيغة TypeScript لازم يتحول لـJavaScript قبل أي Commit — نفس تحذير الـBackend (Round 3 في Audit Summary بتاعه).

> **كل Module بيتبع نفس البنية الداخلية دايمًا** (`components / hooks / pages / types`) — الاتساق هنا إلزامي زي الباك اند بالظبط (قسم 10.1 هناك).

---

## 12. State Management Strategy

| نوع الـState | الأداة | مثال |
|---|---|---|
| **Server State** (أي حاجة جايه من الـAPI) | TanStack Query | Orders list, Customer profile, Menu items |
| **UI/Client State** (مش من الـServer، محلي لـComponent أو Module واحد) | `useState`/`useReducer` محلي | Sidebar collapsed?, Selected filter tab, Modal open/close |
| **Auth/Tenant Context** | React Context (Provider واحد فوق الـApp) | Current employee, restaurantId, permissions |
| **Form State** | React Hook Form (معزول تمامًا عن أي State تاني) | أي فورم في المشروع |

> **قاعدة صارمة:** ممنوع تخزين Server data (زي Orders) في Context أو أي مكان تاني — ده مسؤولية React Query لوحدها (Cache invalidation, Refetch, Stale time بيبقى مُدار مركزيًا).
>
> **ممنوع إضافة Global State library (Redux, Zustand, Jotai, ...) بشكل افتراضي.** `useState`/`useReducer` + Context كافيين لحد دلوقتي. لو ظهر Use case حقيقي أثناء التنفيذ الفعلي (UI state معقد ومشترك بين Modules بعيدة عن بعض) يبرر إضافة مكتبة، لازم يتوثق كـADR جديد في قسم 26 يوضح الـUse case بالتحديد قبل الإضافة — مش تُضاف احتياطيًا "علشان ممكن تلزم".

---

## 13. Routing & Navigation Architecture

- الـRouting بيعكس هيكلة الـModules (قسم 11) — كل Module ليه Route group منفصل.
- الـNavigation الفعلي (Sidebar items) بيتبع قسم 6.5 — Workflow-based مش Module-based حرفيًا.
- Route guards: أي Route محتاج Permission معينة (مطابقة لـPermission keys من الباك اند — قسم 18.2 هناك) بيتحقق منها الـRoute Guard قبل الـRender، مش بس إخفاء الزرار.
- الـTenant/Branch context جزء من الـURL لما يكون منطقي (`/branches/:branchId/tables`) مطابقةً لشكل الـBackend Endpoints (Branch-scoped resources).

---

## 14. Component System

- كل Component جديد لازم يتبني فوق الـDesign Tokens (قسم 6.11) — ممنوع Hard-coded colors/spacing.
- الـComponents الأساسية (Button, Input, Select, Table, Modal, Drawer, StatusBadge, EmptyState, Skeleton) بتتبني **مرة واحدة** في `shared/components` وتتستخدم في كل الـModules — ممنوع كل Module يعيد اختراع نفس الـComponent بشكل مختلف.
- أي Component بيتكرر استخدامه 3 مرات أو أكتر بنفس الشكل تقريبًا → يتحول لـShared component فورًا.
- الـProps تتصمم حوالين الاستخدام الفعلي، مش "كل الاحتمالات الممكنة" (Over-engineering ممنوع بنفس منطق قسم 6.17 في الفورمز).

---

## 15. Forms & Validation

- كل Form validation schema في الفرونت (Zod) لازم تكون **مرآة منطقية** لنفس الـValidation schema في الباك اند (قسم 20 هناك) — مش نفس الملف، لكن نفس القواعد (required fields, min/max, format) عشان المستخدم ياخد Feedback فوري بدل ما ينتظر رد السيرفر.
- Business validation (زي "هل الكوبون منتهي؟") ميتكررش في الفرونت كمصدر حقيقة — الفرونت بس بيعرض نتيجة السيرفر، السيرفر هو الحاكم النهائي دايمًا.
- الحقول المطلوبة واضحة بصريًا (قسم 6.17)، ورسائل الخطأ Inline جنب الحقل مباشرة، مش في أعلى الفورم بس.

---

## 16. Authentication & Session Handling (Frontend)

- الـAccess Token يتخزن في Memory (مش localStorage) لتقليل XSS risk؛ الـRefresh Token flow بيتم عبر HttpOnly cookie لو الباك اند بيدعمها، وإلا فـSecure storage مع Rotation، مطابقةً لقسم 16 في الباك اند.
- عند 401 → محاولة Refresh مرة واحدة تلقائيًا → لو فشل → Logout كامل + Redirect لـ`/login` + رسالة واضحة.
- عند رسالة "already active on another device" (قسم 17.2 في الباك اند) → الفرونت بيعرض Modal واضح فيه خيار "Force logout الجهاز التاني" مع Confirmation إضافي — مش زرار عادي.
- الـPermissions بتوصل مع الـUser context بعد الـLogin وتتخزن في Auth Context، وتُستخدم لإخفاء/تعطيل أي فعل في الواجهة مش مسموح بيه (لكن الـBackend يفضل هو خط الدفاع الحقيقي — الفرونت بس UX layer).

---

## 17. Error Handling

جدول تحويل Error codes من الباك اند (قسم 21.1 هناك) لرسائل UI مفهومة — يتوسّع أول ما نواجه Error codes جديدة فعليًا:

| Backend Error Code | HTTP | رسالة UI |
|---|---|---|
| `VALIDATION_ERROR` | 400 | تعرض جنب الحقل المتأثر مباشرة |
| `AUTHENTICATION_ERROR` | 401 | Redirect لـLogin |
| `AUTHORIZATION_ERROR` | 403 | "معندكش صلاحية تعمل الإجراء ده" + إخفاء الزرار مستقبلًا |
| `NOT_FOUND_ERROR` | 404 | "العنصر ده مش موجود أو اتشال" |
| `CONFLICT_ERROR` | 409 | "حصل تعارض، بنحدّث البيانات الحالية" + Refetch |
| `BUSINESS_RULE_ERROR` | 422 | الرسالة القادمة من الباك اند تُعرض حرفيًا (مصممة تكون مفهومة أصلًا) |
| `RATE_LIMIT_ERROR` | 429 | "طلبات كتير، حاول تاني بعد شوية" |
| default/500 | 500 | "حصل خطأ غير متوقع، جرب تاني" + زرار Retry + requestId مخفي للـSupport |

ممنوع عرض Stack trace أو أي تفاصيل تقنية خام للمستخدم النهائي، بنفس قاعدة قسم 21.3 في الباك اند.

---

## 18. Loading & Empty States

مطابق تمامًا لقسم 6.19 و6.20 — كل Screen جديدة لازم تصمم لها 3 حالات إلزامية قبل ما تُعتبر خلصت: **Loading (Skeleton)**، **Empty (رسالة + فعل واضح)**، **Error (Retry واضح)** — مش بس الـHappy path.

---

## 19. Real-Time Integration

مطابق لقسم 29 في الباك اند (Socket.IO + Rooms بـ`restaurantId`/`branchId`). الأحداث اللي الفرونت بيسمعها ويحدّث بيها الـUI مباشرة (بدل Polling):

```text
order.created / order.updated / order.statusChanged   → تحديث Orders list + KDS لحظيًا
chat.messageReceived / chat.assigned / chat.takeover    → تحديث Inbox (Module 11 لاحقًا)
employee.online / employee.offline                        → مؤشر "🟢 Online" في شاشة الموظفين
notification.created                                        → Toast/Notification bell
```

**قاعدة صارمة:** أي Event بييجي من Socket لازم يتفلتر بالـ`restaurantId`/`branchId` الحالي قبل ما يُطبّق على الـUI (Defense in depth، حتى لو السيرفر أصلًا بيبعت للـRoom الصح فقط).

---

## 20. Responsive Design Strategy & Accessibility

> **قاعدة حاكمة (غير قابلة للتفاوض):** *Responsive behavior is part of the design, not a post-processing step.* و: *Every screen must have an intentional UX strategy across viewport sizes.* مش كفاية إن الشاشة "technically responsive" (يعني مفيش Overflow) — لازم تكون **visually coherent, functionally usable, and intentionally designed** عبر كل الأجهزة.

### 20.1 المبدأ الأساسي

الموقع/التطبيق لازم يكون مناسب بصريًا ووظيفيًا على: الهواتف الصغيرة، الهواتف الكبيرة، Tablets، Laptops، Desktop monitors، الشاشات الكبيرة جدًا، شاشات الـhigh-DPI، وPortrait/Landscape حيثما يكون مناسبًا. **الهدف النهائي:**

> **One product, one visual identity, multiple intelligently adapted experiences — not one desktop UI squeezed into smaller screens.**

### 20.2 الأنماط الممنوعة كقاعدة عامة

```text
❌ Desktop layout ← stack everything vertically → Mobile
```

هذا النمط **ممنوع كقاعدة افتراضية عامة**. مش كل Screen بيتحول لـ"عمود واحد" على الموبايل تلقائيًا — القرار لكل Component ولكل Section لازم يكون مقصود، مش نتيجة جانبية لـCSS بيعمل Stack تلقائي.

### 20.3 لكل Breakpoint — أسئلة إلزامية قبل أي تنفيذ

لكل Screen وكل Breakpoint، لازم يتم التفكير صراحة في:

```text
- ماذا يبقى ظاهر؟
- ماذا يختفي؟
- ماذا يتغير حجمه؟
- ماذا يتحول إلى Drawer؟
- ماذا يتحول إلى Bottom Sheet؟
- ماذا يصبح horizontally scrollable (وهل ده فعلًا أفضل UX هنا)؟
- ماذا ينتقل إلى Secondary actions (خلف "..." أو قائمة إضافية)؟
- ماذا يصبح Fixed/Sticky؟
- ماذا يحتاج ترتيبًا مختلفًا (مش بس تصغير)؟
- إيه هي الـPrimary actions على الجهاز ده تحديدًا؟
```

هذه الأسئلة جزء إلزامي من تصميم أي Screen — مش Checklist اختيارية.

### 20.4 Component-Level Responsiveness

كل Component لازم يكون Responsive بذاته، مش بس الصفحة ككل. **مثال — Data Table:**

```text
Desktop:
  - Full table، أعمدة متعددة
  - Inline actions
  - Filters ظاهرة
  - Pagination كاملة

Mobile:
  - أعمدة ذات أولوية بس (Prioritized columns)
  - Rows مكثّفة (Condensed)
  - معلومات ثانوية مخفية أو Expandable
  - Actions متاحة من غير ما تكسر الـLayout
  - Horizontal scroll بس لو فعلًا هو أفضل UX ممكن، مش كحل افتراضي كسول
```

**ممنوع** إن الجدول يفضل بنفس عرض الـDesktop ويتم ضغطه لحد ما يبقى غير قابل للاستخدام. هذا المبدأ ينطبق على أي Component تاني كثيف بيانات (Forms طويلة، Filters bar، Cards grids...).

### 20.5 Navigation عبر الأجهزة

الـSidebar **مش لازم يفضل Sidebar ثابت على كل الأجهزة**. مثال افتراضي (قابل للتعديل حسب الـWorkflow الفعلي وقت التنفيذ):

```text
Desktop  → Persistent Sidebar
Tablet   → Collapsible Sidebar
Mobile   → Drawer / نمط Navigation مناسب للموبايل (زي Bottom nav لو الـWorkflow يبرره)
```

**القرار النهائي لازم يعتمد على طبيعة الـWorkflow نفسه (قسم 6.5)، مش على الـBreakpoint وحده** — يعني ممكن شاشة معينة (POS مثلًا) تحتاج نمط Navigation مختلف عن باقي الشاشات حتى على نفس الجهاز، لو طبيعة الاستخدام بتبرر ده.

### 20.6 Touch & Interaction

على الأجهزة اللي بتعتمد على Touch:

```text
- Touch targets لازم تكون بحجم مناسب (لا صغيرة ولا متقاربة بشكل يسبب أخطاء ضغط)
- ممنوع الاعتماد على Hover كطريقة وحيدة لاكتشاف أي Action
- Menus/Dropdowns/Dialogs لازم تكون سهلة الاستخدام باللمس (مش مصممة لـMouse بس)
- Actions المهمة (زي Cancel Order، Confirm Payment) لازم تاخد مساحة كافية وميكونوش قريبين من بعض بشكل يسبب ضغط غلط
```

### 20.7 Typography عبر الـViewports

Typography لازم تتكيف مع الـViewport، مش تفضل نفس الحجم بالظبط من Desktop لـMobile لمجرد إن CSS سمح بكده:

```text
❌ Desktop H1 = 64px  &  Mobile H1 = 64px  (لمجرد إن الكود مسمحش يمنع)
```

استخدم Responsive typography (Fluid scales أو Breakpoint-based scales مبنية على الـToken system في قسم 6.11) بحيث تفضل: واضحة، متوازنة، قابلة للقراءة، ومحافظة على الـHierarchy — من غير ما تملى الشاشة على الموبايل.

### 20.8 Spacing عبر الـViewports

نفس المنطق للـSpacing — ممنوع استخدام نفس المسافات الضخمة بتاعة الـDesktop على الموبايل حرفيًا، لكن كمان ممنوع إن الموبايل يبقى مزدحم. الهدف: الحفاظ على **Visual rhythm** ثابت (نفس الإحساس بالتوازن) عبر كل Viewport، حتى لو القيم الفعلية اختلفت.

### 20.9 Forms عبر الـViewports

الفورمز لازم تكون Responsive من البداية:

```text
Desktop → ممكن تستخدم 2-column layout لحقول مترابطة
Mobile  → ممكن تتحول لـ1-column layout
```

لكن **مش كل فورم بيتحول تلقائيًا لعمود واحد** — القرار يعتمد على العلاقة المنطقية بين الحقول (مثال: "من" و"إلى" لتاريخ، أو "المدينة" و"الرمز البريدي" منطقي يفضلوا جنب بعض حتى على موبايل لو المساحة سمحت، بينما حقول مستقلة تمامًا تتفرق بسهولة أكتر).

### 20.10 شاشات التشغيل الحرجة — POS / KDS / Orders / Tables

> نقطة مهمة جدًا لأن المنتج **Restaurant Management SaaS** تحديدًا — الشاشات دي مش مجرد صفحات Dashboard عادية، ولازم تتصمم حسب طريقة الاستخدام الفعلية داخل المطعم، مش نفس الـLayout يتصغّر بس.

```text
KDS على شاشة كبيرة (شاشة مطبخ ثابتة)  → Information density عالية، أعمدة حالة كبيرة، مسافة قراءة من بعيد
KDS على Tablet                          → Hierarchy مختلفة، Touch targets أكبر، تركيز على أوردر واحد/قليل في المرة
POS على Tablet                          → سرعة + تفاعل مباشر + أقل عدد خطوات لإتمام الأوردر
Orders/Tables على Desktop (مكتب المدير) → Density أعلى + Filtering/Sorting متقدم
```

كل شاشة من دول بتاخد قرار Responsive مستقل ومقصود، مش وريث تلقائي من نسخة Desktop واحدة.

### 20.11 Responsive Validation — إلزامي لكل Screen قبل DONE

أي Screen **لا تُعتبر DONE** إلا بعد اختبارها فعليًا على مجموعة Viewport Classes التالية (الأرقام دي **Validation targets**، مش Breakpoints مفروضة Hard-coded في الكود — التصميم ميبقاش معتمد على جهاز بعينه):

```text
Mobile    : ~320px · ~375px · ~390px · ~430px
Tablet    : ~768px · ~820px · ~1024px
Laptop/Desktop : ~1280px · ~1440px · ~1920px
Large screens   : أوسع من 1920px
```

على الشاشات الأوسع من 1920px، لازم يتفحص تحديدًا عدم وجود:

```text
- Excessive whitespace
- Stretched content
- Unreadably long lines (Max-width غير محكوم)
- Broken max-width behavior
- Awkward dashboard proportions
```

### 20.12 App Shell First — ترتيب البناء الإلزامي (قسم 7 — Frontend Module 1)

الـResponsive Strategy مش حاجة بتتضاف في الآخر — بتتبني كـFoundation قبل أي Module تاني. الترتيب الإلزامي لبداية Frontend Module 1 (قسم 7):

```text
Design Tokens
      ↓
App Shell
      ↓
Desktop Navigation
      ↓
Tablet Navigation
      ↓
Mobile Navigation
      ↓
Header
      ↓
Branch Context
      ↓
User Context
      ↓
Content Container
      ↓
Responsive Layout Rules
```

**ممنوع نبدأ Implementation نهائي لأي Module قبل ما الـResponsive Strategy + App Shell + Design System يتثبّتوا.** راجع قسم 7 — Frontend Module 1 للتفاصيل الكاملة.

### 20.13 Accessibility (تفصيل تطبيقي لقسم 6.24)

Keyboard navigation كاملة، Visible focus states واضحة على كل عنصر تفاعلي، Contrast كافي حسب الـDesign Tokens، Semantic HTML، Accessible labels لكل Input/Icon-only button، Touch targets مناسبة (قسم 20.6)، ورسائل خطأ مفهومة لقارئ الشاشة. الـAccessibility بتتفحص كجزء من الـResponsive Validation (قسم 20.11)، مش كخطوة منفصلة بعدها.

---

## 21. Testing Strategy

| النوع | يغطي |
|---|---|
| **Unit Tests** | Utility functions, Custom hooks المعزولة, Validation schemas |
| **Component Tests** | كل Shared component (قسم 14) — بما فيها حالات Loading/Empty/Error |
| **Integration Tests** | Module hooks + API service functions (مع Mock server — MSW) |
| **E2E Tests (Playwright)** | Critical flows فقط: Login, Create Order (POS), Change Order Status, Add Menu Item, Create Employee |

نفس فلسفة الباك اند: **Testing جزء من Definition of Done**، مش مرحلة منفصلة بعد الانتهاء (قسم 23).

---

## 22. Git Strategy & Conventional Commits

نفس القواعد **بالحرف** من وثيقة الـBackend (أقسام 35-37 هناك) — نفس أسماء الـBranches، نفس أنواع الـCommits، نفس Workflow الـRebase → Push → PR → Self-Review → Squash Merge → Delete Branch. الفرق الوحيد: الـRepo منفصل (`frontend/`) عن الـBackend، لكن نفس الانضباط بالظبط.

### 22.1 Solo Developer Mode — Self-Review

نفس فكرة قسم 37.1 في الباك اند حرفيًا — راجع قسم 25 هنا للـCheck-list المخصصة للفرونت.

---

## 23. Module Definition of Done

نفس الـLifecycle Stages من الباك اند (قسم 42.1 هناك)، معدّلة لطبيعة الفرونت:

```text
1. Design Ready       → الشاشة اتراجعت ضد قسم 6 (Self-Critique قسم 6.27) قبل أي كود
2. API Contract Ready → الـEndpoints المطلوبة موثقة DONE في Backend guide + متربطة في قسم 7/10 هنا
3. Implementation     → Components + Hooks + Pages + API services اتكتبوا كاملين
4. States Covered     → Loading + Empty + Error + Success (قسم 18) — الأربعة، مش بس الـHappy path
5. Tests              → Unit + Component + (E2E لو Flow حرج) — قسم 21
6. Accessibility Pass → قسم 6.24 و20 اتراجعوا فعليًا (Keyboard nav, contrast, labels)
7. PR                 → CI عدّى بالكامل
8. Merged             → Self-Review (قسم 25) + Squash Merge
9. Module DONE        → هذا الملف اتحدّث ليعكس الحالة الجديدة (قسم 24)
```

**تصنيف الحالة:** `NOT STARTED` → `DESIGN READY` → `IN PROGRESS` → `CODE COMPLETE — NOT DONE` → `DONE` (نفس تعريفات الباك اند بالحرف).

**ممنوع الانتقال لـModule تالي قبل استيفاء كل المراحل دي على الـModule الحالي** — نفس قاعدة الباك اند بالحرف.

### 23.1 Screen-level Definition of Done (Checklist إلزامي لكل شاشة)

أي Screen منفردة (مش الـModule ككل) **لا تُعتبر DONE** إلا بعد اجتياز كل البنود دي فعليًا، مش نظريًا:

```text
[ ] Design System compliance      → عدّت على قسم 6 بالكامل (Tokens, Radius, Cards, Status colors...)
[ ] Anti-Vibe-Coding self-review  → عدّت على Self-Critique الكامل (قسم 6.27) بما فيه Genericity Test
[ ] UX review                      → الـWorkflow منطقي فعليًا لمستخدم حقيقي تحت ضغط شغل، مش بس "شكله تمام"
[ ] Responsive strategy review      → كل الأسئلة الإلزامية في قسم 20.3 اتجاوبت صراحة لكل Breakpoint (مش افتراض Stack تلقائي)
[ ] Responsive viewport validation   → اتجربت فعليًا على كل الـViewport Classes في قسم 20.11 (Mobile/Tablet/Laptop/Desktop/Large)، وعلى Tablet تحديدًا لو شاشة تشغيلية (POS/KDS)
[ ] Component-level responsiveness   → أي Component كثيف بيانات (Table, Form, Filters) اتصمم بشكل مستقل لكل Viewport (قسم 20.4)، مش نفس الشكل مُصغّر
[ ] Accessibility review            → Keyboard nav + Focus states + Contrast + Labels + Touch targets (قسم 20.13) اتجربوا فعليًا
[ ] Loading state                    → Skeleton حقيقي، مش Spinner عام، بدون Layout shift
[ ] Empty state                      → رسالة مخصصة + فعل واضح (قسم 6.19)، مش "Nothing here yet"
[ ] Error state                      → رسالة قابلة للفهم + Retry واضح (قسم 6.21/17)
[ ] Permission state (لو ينطبق)      → عناصر الواجهة اتخفت/اتعطلت حسب الـPermission الفعلية من الباك اند
[ ] API-layer compliance             → مفيش fetch/axios مباشر، كل شيء عبر الطبقة الموحّدة (قسم 10)
[ ] Realistic data review            → اتجربت الشاشة ببيانات واقعية (نصوص طويلة، أرقام كبيرة، حالات حافة) مش بس بيانات Demo مرتبة
```

> **ملاحظة:** الـChecklist ده جزء لا يتجزأ من قسم 25 (Self-Review) — أي PR فيه شاشة جديدة أو معدّلة لازم يُراجَع ضده قبل الـMerge، مش بعده.

---

## 24. Documentation Rules & Audit Log

أي تغيير في أي من التالي **ملزم** يتحدث في نفس الـPR:

- Design token/rule جديدة أو معدّلة (قسم 6)
- API contract جديد اتضاف من الباك اند
- Module جديد اتبنى أو اتغيّر Scope بتاعه
- قرار Tech stack (يتحول من Proposed لـDecided، أو يتغير)
- Component pattern جديد بيتكرر استخدامه

### Audit Log (يُضاف له سطر جديد مع كل توسعة معتمدة لقسم 6 أو أي قرار معماري)

```text
[Baseline v1.1] Tech Stack اتحسم رسميًا كـDecided: React + Vite + JavaScript (ES2022+, ESM) +
Tailwind + React Router + TanStack Query + React Hook Form + Zod + Lucide React.
TypeScript اتمنع نهائيًا (اتساق مع ADR-011 في الـBackend). ممنوع Redux/Zustand/أي Global state
library افتراضيًا. اتضافت قاعدة "No Silent Design Decisions" (قسم 6.29) وWorkflow صريح لأي
قرار تصميمي جديد. اتضاف "Genericity Test" كسؤال 11 في Self-Critique (قسم 6.27). اتوضح الفرق
بين Design/UX Exploration (مسموح يبدأ بدري) وAPI Integration/Implementation (لازم ينتظر
Backend Module = DONE) في قسم 7.1. اتوضح إن الـMapping بين Backend وFrontend Modules هو
Traceability بس، مش افتراض تطابق هيكلي (قسم 7.2). اتوسّع الـDefinition of Done بـChecklist
على مستوى الشاشة المفردة (قسم 23.1). — لا يُبدأ Coding فعلي إلا بعد اعتماد هذا الـBaseline،
وهو معتمد من دلوقتي.
```

```text
[Baseline v1.2] Responsive Design اتثبّت كـDesign Constraint أساسي من أول لحظة، مش خطوة لاحقة —
قسم 20 اتوسّع بالكامل لـ"Responsive Design Strategy" (13 sub-section): مبدأ عام، منع نمط
"Desktop → Stack vertically → Mobile" كقاعدة افتراضية، أسئلة إلزامية لكل Breakpoint (20.3)،
Component-level responsiveness بمثال Data Table (20.4)، Navigation adaptation حسب الجهاز
(20.5)، Touch & Interaction (20.6)، Responsive Typography/Spacing (20.7-20.8)، Forms (20.9)،
معاملة خاصة لشاشات POS/KDS/Orders/Tables التشغيلية (20.10)، Responsive Validation عبر
Viewport Classes محددة (20.11)، وترتيب App Shell First الإلزامي (20.12). Frontend Module 1
اتحدّث ليعكس إن الـApp Shell هو أول حاجة تتبنى بالترتيب ده تحديدًا قبل أي Module تاني. اتضاف
ADR-F010 وبندين جدد في Non-Negotiable Rules (17-18)، واتوسّع Screen-level DoD (قسم 23.1)
بفحص Responsive Strategy وViewport Validation صريح لكل شاشة.
```

```text
[Module 1 — CODE COMPLETE — Baseline v1.3] Frontend Module 1 (Foundation & App Shell) اتكمل
ونفّذت عليه مراجعة كاملة (Architecture + Security + Design System):
- الـApp Shell اتبنى بالترتيب الإلزامي (قسم 20.12) مع Responsive Validation عبر Viewport Classes
  (قسم 20.11) — Mobile (320/375/390/430) / Tablet (768/820/1024) / Desktop (1280/1440/1920/+1920).
- طبقة API موحّدة (قسم 10): `apiClient` للمسارات المحمية بـ/api/v1 + `apiHealthClient` للـHealth
  (بره البادئة). Error-code mapping لقسم 17 بأكواد الـBackend الفعلية
  (AUTHENTICATION_ERROR/AUTHORIZATION_ERROR/NOT_FOUND/CONFLICT_ERROR/RATE_LIMIT_EXCEEDED/...)،
  معالجة 401 (Refresh مرة واحدة + Logout) و409 (Confict + Refetch callback)، وتمرير requestId.
- Health endpoints اتصحّحوا للمسار الفعلي على الجذر: GET /health و GET /ready (مش /api/v1/health ولا /api/health) —
  عبر `apiHealthClient` على الـOrigin + نفس الـSuccess unwrapping. /ready بيرجع 503 بنفس الـwrapper (success:false) لو أي service DOWN.
- Security: Session tokens في Memory فقط — مفيش localStorage إطلاقًا (قسم 16) → ADR-F006 اتحسم Decided.
- ErrorBoundary مبقتش تعرض الـError message الخام للمستخدم (قسم 17/21.3).
- الـTesting اتحسم: Vitest + RTL + jsdom (ADR-F011) — 19 اختبار وحدة شغّالة (api-client + login-schema + shared-components).
- قرارات تصميم جديدة اتوثقت: خطوط Cairo/Inter (ADR-F012)، clsx + tailwind-merge (ADR-F013).
- مفيش TypeScript، مفيش fetch/axios مباشر خارج طبقة الـAPI (قاعدة 1/14)، والـLogin UI-only (ADR-F009).
- الحالة هتتحول لـDONE فور الرفع على Git (قسم 22/23).
```

---

## 25. Self-Review Checklist (Solo Developer Mode)

قبل أي Squash Merge، نفّذ الـCheck-list ده (Mental gate، زي قسم 37.1 في الباك اند بالظبط لكن للفرونت):

```text
[ ] الشاشة عدّت من Self-Critique قسم 6.27 (كل الـ10 أسئلة) قبل الاعتماد
[ ] مفيش Hard-coded color/spacing خارج الـDesign Tokens (قسم 6.11)
[ ] مفيش Component بيتكرر نفسه بدل ما يتحول لـShared component (قسم 14)
[ ] الـ4 حالات (Loading/Empty/Error/Success) مغطاة فعليًا مش بس الـHappy path
[ ] كل API call بيمر من الطبقة الموحّدة (قسم 10) — مفيش fetch/axios مباشر في Component
[ ] الـPermissions اتفحصت في الـUI (إخفاء/تعطيل) للأفعال الحساسة
[ ] Accessibility: Keyboard nav + Focus states + Labels اتجربوا فعليًا بعيني مش افتراض
[ ] الـTests الجديدة شغالة فعليًا (مش مجرد "المفروض تشتغل")
[ ] مفيش console.log/debugger متسرب
[ ] الـDiff اتقرا سطر بسطر ضد الـDoD (قسم 23) قبل الـMerge
[ ] الملف ده (Frontend_Project_Guide.md) اتحدث لو فيه أي تغيير معماري أو تصميمي (قسم 24)
```

---

## 26. Architecture Decision Records (Frontend)

```text
ADR-F001: React + Vite + JavaScript (ES2022+, ESM) كـFoundation — Decided. TypeScript ممنوع نهائيًا في المشروع (اتساق مع ADR-011 في الـBackend). التوثيق الاختياري لشكل الـData بيكون عبر JSDoc، بدون أي Compilation step.
ADR-F002: Tailwind CSS بـConfig مخصص بالكامل (بدون Theme جاهز) — Decided.
ADR-F003: TanStack Query كطبقة Server State الوحيدة؛ ممنوع إضافة Global state library (Redux/Zustand/Jotai) بشكل افتراضي — تُضاف فقط بـADR جديد لو ظهر Use case حقيقي أثناء التنفيذ — Decided.
ADR-F004: Radix UI كـUnstyled primitives تحت الـDesign System الخاص (قسم 6) — Proposed، يُحسم عند أول استخدام فعلي.
ADR-F005: React Hook Form + Zod، متسقة منطقيًا مع Zod في الباك اند — Decided.
ADR-F006: Access Token في Memory فقط، مفيش localStorage نهائيًا — Decided (اتنفذت فعليًا في Module 1 — تقليل XSS risk، قسم 16). الـRefresh token flow عبر HttpOnly cookie بيتحدد بالتفصيل مع Backend Module 2.
ADR-F007: Socket.IO Client كطبقة Real-time، Rooms بـrestaurantId/branchId — Proposed (مرآة لـADR في الباك اند قسم 29)، يُحسم عند الوصول لأول Module محتاج Real-time فعلي.
ADR-F008: طبقة API Client مركزية موحّدة (قسم 10) — ممنوع أي fetch/axios مباشر داخل Components تحت أي ظرف — Decided، غير قابل للتفاوض (قسم 27).
ADR-F009: Design/UX Exploration (Wireframes, UI architecture, Component planning) مسموح يبدأ قبل ما الـBackend Module المقابل يخلص، لكن API Integration/Real Data/Production Implementation ممنوعين قبل Backend Module = DONE — Decided (قسم 7.1).
ADR-F010: Responsive Design هو Design Constraint أساسي من أول Module (مش post-processing step) — App Shell بيتبنى بترتيب إلزامي (Design Tokens → App Shell → Desktop/Tablet/Mobile Navigation → Header → Branch/User Context → Content Container → Responsive Layout Rules) قبل أي Module تاني، وكل Screen لازم Responsive Validation عبر Viewport Classes محددة (قسم 20.11) قبل ما تُعتبر DONE — Decided (قسم 20).
ADR-F011: Vitest + React Testing Library + jsdom كطبقة الـUnit/Component Testing الرسمية — Decided (اتستخدمت فعليًا في Module 1). Playwright (E2E) يفضل Proposed لحد ما قسم 21 يبدأ — راجع قسم 9.
ADR-F012: خطوط الواجهة الرسمية: **Cairo** (عربي) + **Inter** (لاتيني) عبر Google Fonts مع `font-display: swap` — Decided. اختيار مطابق لقسم 6.10 (Typography ناضجة وهادي ومناسبة لمطعم عربي) — اتبنّى في Module 1.
ADR-F013: `clsx` + `tailwind-merge` كمكتبات Class-composition utilities فوق Tailwind — Decided. مبرر: دمج شرطي نظيف للكلاسات بدون تعارضات، مش مكتبات UI. استُخدمت في الـShared Components (Button/Input/StatusPill/LoadingSkeleton/ContentContainer) — راجع قسم 9 (أي تقنية خارج الـStack لازم ADR).
```

> كل ADR مُعلَّم **Decided** هنا هو Baseline رسمي ملزم من دلوقتي — تغييره لاحقًا محتاج ADR جديد يوضح سبب التغيير صراحة، مش تعديل ارتجالي. الـADRs المُعلَّمة **Proposed** لازم تتحول لـDecided بشكل صريح أول ما تُحسم فعليًا أثناء التنفيذ. أي ADR جديد يظهر أثناء التنفيذ يُضاف هنا فورًا، نفس قاعدة قسم 46 في الباك اند.

---

## 27. Non-Negotiable Engineering Rules

```text
1.  No direct fetch/axios calls inside Components — كل حاجة تمر من طبقة الـAPI (قسم 10).
2.  No hard-coded colors/spacing/radius خارج الـDesign Tokens (قسم 6.11).
3.  No generic "AI SaaS look" — كل شاشة لازم تعدي Self-Critique قسم 6.27 (بما فيه Genericity Test) قبل الاعتماد.
4.  No Frontend Module implementation/integration يبدأ قبل ما الـBackend Module المقابل ليه يبقى DONE فعليًا — Design/UX exploration بس مسموح قبل كده (قسم 7.1).
5.  No secrets in Git (API keys, env values حقيقية).
6.  No feature work مباشر على main/develop — دايمًا Branch منفصل.
7.  No merge without PR + CI + Self-Review (قسم 25).
8.  No Module/Screen completion بدون تغطية الحالات الأربعة (قسم 18) + Tests (قسم 21) + Screen-level DoD (قسم 23.1).
9.  No duplicate Shared Components — لو اتكرر الشكل 3 مرات، يتحول لـShared فورًا.
10. No Inventory. No AI. (نفس قسم 4 و47 في الباك اند).
11. No undocumented architectural or design-system changes — أي قرار جديد (Token, Component behavior, Navigation pattern, Animation, Breakpoint, UX convention) لازم يتوثق هنا فورًا قبل التنفيذ، مش بعده (قسم 6.29، 24).
12. No permission-gated UI بدون فحص فعلي للـPermission key المطابقة من الباك اند.
13. No silent divergence بين شكل الـValidation في الفرونت وشكلها في الباك اند — أي فرق لازم يكون مقصود وموثق.
14. **No TypeScript.** المشروع كله JavaScript (ES2022+, ESM) — أي `.ts`/`.tsx`/`tsconfig.json` ممنوع تمامًا (قسم 9، ADR-F001).
15. **No default Global State library** (Redux/Zustand/Jotai/...) — `useState`/`useReducer`/Context كافيين إلا لو ADR جديد وثّق Use case حقيقي (قسم 12، ADR-F003).
16. **The AI implements the product design; it does not invent it.** أي قرار تصميمي جديد لازم يمر بـWorkflow قسم 6.29 قبل ما يتنفذ.
17. **No Desktop-first shrink-to-mobile.** ممنوع نمط "صمم Desktop وبعدين اعمل نسخة Mobile" كقاعدة عامة — كل Screen بيتصمم Responsive من أول لحظة (قسم 20)، وأي Component كثيف بيانات (Table, Form) لازم قرار Responsive مستقل بيه، مش تصغير للنسخة الكبيرة.
18. **No Screen is DONE بدون Responsive Validation فعلي** عبر الـViewport Classes في قسم 20.11 — "مفيش Overflow" وحدها مش كافية.
```

---

## 28. Final Developer Checklist

قبل ما تبدأ أي Feature فرونت:

```text
[ ] قرأت الـFrontend Module ده وDependencies بتاعته (قسم 7-8)
[ ] اتأكدت إن الـBackend Module المقابل DONE فعليًا في Backend_Project_Guide.md
[ ] عملت git checkout -b بالصيغة الصحيحة (قسم 22)
[ ] راجعت Design System (قسم 6) قبل أي كود UI
[ ] هستخدم الـDesign Tokens مش قيم Hard-coded
[ ] هبني الشاشة عبر طبقة API الموحّدة (قسم 10) مش استدعاء مباشر
[ ] هغطي الحالات الأربعة (Loading/Empty/Error/Success)
[ ] هكتب الـTests أثناء الشغل مش بعده
[ ] الـCommits بتاعتي كلها Conventional Commits
[ ] راجعت Definition of Done كامل قبل فتح PR (قسم 23)
[ ] عديت على Self-Critique (قسم 6.27) قبل ما اعتبر الشاشة خلصت
[ ] حدّثت هذا الملف لو غيّرت أي حاجة معمارية أو تصميمية (قسم 24)
```

---

*آخر تحديث: أي تعديل على الـScope، الـDesign System، الـModules، أو الـTech Stack لازم يُسجَّل في نفس الملف مع توضيح سبب التغيير — لا يُعدَّل بصمت. هذا الملف Living document وشقيق مباشر لـ`Backend_Project_Guide.md`، ولازم الاتنين يفضلوا متزامنين طول الوقت.*
