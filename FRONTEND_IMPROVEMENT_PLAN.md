# خطة تحسين الواجهة الأمامية (Frontend Improvement Plan)

هذه الخطة تنفذ قواعد `DESIGN_RULES.md` على تطبيق `frontend`. كل صفحة/مكوّن لازم يعدّي
على قائمة التحقق في آخر الملف قبل ما نعتبره "خلص".

## حالة التنفيذ

| المرحلة | الحالة |
| --- | --- |
| 0: الأساس (Design Foundation) | مكتمل |
| 1: المكوّنات المشتركة والـ Layout | مكتمل |
| 2: الصفحات العامة | مكتمل |
| 3: الواجهات التشغيلية | مكتمل |
| 4: صفحات الإعدادات | مكتمل |
| 5: تنظيف الكوبي + التحقق النهائي | مكتمل |

التحقق النهائي: `npm run lint` (0 warnings) + `npm run build` + `npm run test` (184/184).

## الهدف

الوصول لنهاية المشروع بحيث كل صفحات الموقع محسّنة ومطابقة للرولز: هوية بصرية موحّدة،
لا علامات "AI slop"، وضوح في الواجهات التشغيلية، وجودة code craft.

---

## المرحلة 0: الأساس (Design Foundation)

أي شغل في الواجهات بعد كده يعتمد على الأساس ده. نبدأ هنا الأول ونثبّت التوكينز.

### الملفات
- `tailwind.config.js`
- `src/index.css`
- `src/shared/design-tokens/tokens.js`

### القرارات المطلوب تنفيذها
1. **لون أساسي واحد فقط**: نختار لون Accent واحد (الـ amber الحالي `#f59e0b` مرشّح
   لأنه لون دافي ويخدم مطاعم).
   - نلغي `--color-accent` (sky blue) أو نستخدمه كـ semantic فقط وليس زينة.
   - الأزرق الـ info النقي يتحوّل للون ضمن عائلة الرمادي.
2. **عائلة رمادي واحدة بدرجة حرارة واحدة**: الحالي slate بارد (`#0f172a`, `#1e293b`, `#334155`).
   - إما نثبّت slate كعائلة واحدة باردة (كل المحايد منه) أو نتحول لعائلة neutral دافية.
   - ممنوع خلط رمادي دافي مع رمادي بارد في نفس التطبيق.
3. **radius واحد**: `--radius-sm/md/lg` تبقى كلها قيمة واحدة (نقترح `8px`).
4. **border لون واحد**: `--border-default` و `--border-subtle` يتوحدوا في لون واحد.
5. **Spacing scale**: كل قيمة spacing من مضاعفات 4. نزيل أي قيم مكسورة.
6. **max-width**: `maxWidth.content-max` من `1600px` لـ `1280px`.
7. **توكينز الكود**: نحذف أي درجات ألوان أو قيمة `text-[10px]` عشوائية مبعثرة.

---

## المرحلة 1: المكوّنات المشتركة والـ Layout (Shared Components & Layout)

دي بتأثر على كل الصفحات، فأي تعديل هنا بيصلّح الصفحات كلها مرة واحدة.

### الملفات
- `src/shared/components/Button.jsx`, `Input.jsx`, `Select.jsx`, `Modal.jsx`
- `DataTable.jsx`, `EmptyState.jsx`, `StatusPill.jsx`, `Toggle.jsx`
- `LoadingSkeleton.jsx`, `SplashState.jsx`, `ErrorBoundary.jsx`
- `src/shared/layout/AppShell.jsx`, `Sidebar.jsx`, `Header.jsx`
- `MobileNav.jsx`, `ContentContainer.jsx`

### الشغل المطلوب
1. **الأزرار** (`Button.jsx`):
   - مقاسات: `sm 32px / md 40px / lg 44px`. ممنوع `min-h` فوق 44px.
   - ممنوع `w-full` افتراضي للـ desktop (لو محتاج full-width في صفحة معينة نستثنيه بوعي).
   - الـ hover يتغير فيه لون الخلفية أو الحدود فقط، بمدة 120-160ms ease-out.
   - لا أسهُم متحركة، لا glow، لا lift، لا scale فوق 1.02.
2. **الشادوز**: نمسح كل الشادوز من غير عناصر عائمة فعلياً:
   - `DataTable` (shadow-sm على جدول غير عائم) → نستبدله بـ border.
   - أي shadow على `LoginPage` card، `Modal` content، `ErrorBoundary`،
     `TableDetailPage`، `PublicTableMenuPage`، `WebsiteOrderingPage`.
   - الشادوز المسموحة فقط: `dropdown / popover / modal overlay / toast`،
     بقيم ضيقة `0 1px 2px rgba(0,0,0,.06)`.
3. **الأيقونات**:
   - ممنوع أي container تلوين خلفه: `bg-brand-primary/10`, `border-brand-primary/20`
     في صناديق أيقونات الـ login/البراند/المودال (راجع القاعدة 3).
   - أيقونة اللوجو (Store) توضع مباشرة على الخلفية بحجم النص.
   - حجم أيقونات inline 16-20px، standalone 24px.
4. **الـ Modal**: نزيل `rounded-lg` كبير ومتعدد + نثبّت radius واحد + نزيل shadow-2xl
   من الـ panel (الـ overlay هو اللي بيستخدم backdrop).
5. **الـ Toggle**: `shadow-sm` على الـ knob يتحذف (ليس عائماً).
6. **الـ Header / Sidebar / MobileNav**:
   - شادو الـ drawer `shadow-2xl` يتحول لـ `shadow` ضيقة (عائم فعلاً) أو border.
   - `shadow-xl` على الـ dropdown → قيمة ضيقة.
   - الـ "badge POS" جنب أيقونة الناڤ مش "eyebrow badge" بس نحافظ على الحد الأدنى.
   - نزيل الـ backdrop-blur الزائد غير الضروري (يُحفظ فقط للـ overlays).

---

## المرحلة 2: الصفحات العامة (Public-Facing Pages)

دي "وش" الموقع: أي زائر بيشوفها، فالرولز الصارمة أهم فيها.

### الملفات
- `src/modules/auth/pages/LoginPage.jsx`
- `src/modules/tables/pages/PublicTableMenuPage.jsx`
- `src/modules/tables/pages/TableDetailPage.jsx`
- `src/modules/website/pages/WebsiteOrderingPage.jsx`
- `src/modules/menu/components/PublicMenuPreviewModal.jsx`

### الشغل المطلوب
1. **LoginPage**:
   - إزالة `shadow-2xl` من الـ card، نعتمد على border.
   - إزالة صندوق الأيقونة الملوّن، الأيقونة على الخلفية مباشرة.
   - زر الدخول `w-full` على desktop ممنوع، يحوّل لحجم محتواه.
   - حجم `lg` ينزل لـ `md` (40px) ما لم تكن هناك حاجة واضحة.
   - شيل الـ em dash من "SaaS — الإصدار 1.0" (نكتب جملتين أو نستخدم فاصلة).
2. **PublicTableMenuPage / WebsiteOrderingPage**:
   - حذف الـ gradient `bg-gradient-to-b from-brand-primary/15 to-transparent`
     (راجع القاعدة 1) → نستخدم border أو خلفية موحدة.
   - حذف `shadow-lg` من صور اللوجو والأيقونات.
   - إزالة صناديق الأيقونات الملوّنة (`bg-brand-primary/10`).
   - ضبط نص الـ hero بحيث ما يكونش oversized.
3. **TableDetailPage / PublicMenuPreviewModal**:
   - إزالة `shadow-lg` من بطاقات غير عائمة.
   - إزالة `rounded-2xl` / `rounded-[32px]` المتفرقة → radius واحد موحد.
   - نصوص الـ QR/menu بأحجام ضمن المقياس (12/14/16/20/24/32/48).

---

## المرحلة 3: الواجهات التشغيلية (Operational Pages)

نحسّن الوضوح والقابلية للقراءة من غير تغيير الوظيفة.

### الملفات (وحدة وحدة)
- `src/modules/dashboard/pages/DashboardPage.jsx`
- `src/modules/orders/pages/` (`OrdersListPage`, `OrderDetailPage`, `PosPage`, `KdsPage`)
- `src/modules/tables/pages/TablesListPage.jsx`
- `src/modules/menu/pages/` (`MenuManagementPage`, `ProductDetailPage`)
- `src/modules/customers/pages/` (`CustomersListPage`, `CustomerDetailPage`)
- `src/modules/whatsapp/pages/` (`WhatsAppPage`, `ConversationsListPage`, `ConversationDetailPage`)
- `src/modules/coupons/pages/CouponsListPage.jsx`
- `src/modules/notifications/pages/NotificationsPage.jsx`
- `src/modules/phone-order/pages/PhoneOrderPage.jsx`

### الشغل المطلوب
1. **الألوان الدلالية**: `status-info` (أزرق نقي) يتحوّل للون محايد/رمادي لأنه غير
   دلالي حقيقي؛ نحتفظ بـ success/warning/danger فقط بألوانها المخصصة.
2. **حجم الخطوط**: أي `text-[10px]` أو `text-[11px]` يتحوّل لـ `12px` كحد أدنى.
   الـ secondary text 13-14px، الـ body 15-16px.
3. **الشادوز**: أي shadow على card/list غير عائمة يتحذف.
4. **الـ empty states / error states / loading states**: نتأكد إنها موجودة ومكتوبة
   بشكل واقعي بدون كلمات ممنوعة وبدون em dash.
5. **الـ focus-visible**: نتأكد إن الترتيب المنطقي والكلافيست يطابق الترتيب البصري
   (خصوصاً في الـ DataTable والأزرار).

---

## المرحلة 4: صفحات الإعدادات (Settings Pages)

### الملفات
- `src/modules/restaurant/pages/RestaurantSettingsPage.jsx`
- `src/modules/branches/pages/` (`BranchesListPage`, `BranchDetailPage`)
- `src/modules/employees/pages/` (`EmployeesListPage`, `EmployeeDetailPage`)
- `src/modules/roles/pages/RolesListPage.jsx`
- `src/modules/audit-logs/pages/AuditLogsPage.jsx`
- `src/modules/multi-branch/components/BranchUsersPanel.jsx`

### الشغل المطلوب
1. تطبيق نفس معايير المرحلة 3 على الفورمز والجداول والمودالات.
2. فحص كل `FormModal` (`BranchFormModal`, `EmployeeFormModal`, `ProductFormModal`,
   `CouponFormModal`, `RoleFormModal`, `TableFormModal`, `CategoryFormModal`,
   `ModifierFormModal`, `CustomerFormModal`, `AddressFormModal`, `ChangePasswordModal`,
   `ChangeRoleModal`) على نفس القواعد: مقاسات الأزرار، الشادوز، الأيقونات، الراديوس.

---

## المرحلة 5: تنظيف المحتوى (Copy Sweep) + التحقق النهائي

### الشغل المطلوب
1. **كلمات ممنوعة**: مسح كل القايمة من الـ copy والـ headings.
2. **Em dash (—)**: مسح كل الـ em dash من واجهات الـ UI (headings, body, tooltips,
   empty states). نكتب جملتين أو نستخدم فاصلة.
3. **Emoji**: ممنوع كواجهة (مفيش حالياً، نأكد إنها تفضل كده).
4. **Semantic HTML**: نتأكد من `header/nav/main/section/button/a`، أي `div` قابل
   للضغط يتحول لعنصر صحيح.
5. **Alt للنصوص**: كل صورة لها alt ذو معنى، والزخرفية `alt=""`.
6. **Contrast**: body >= 4.5:1، النص الكبير >= 3:1.
7. **Dead code**: نزيل imports غير مستخدمة، كود معلّق، TODOs.
8. **prefers-reduced-motion**: نضيف media query تعطّل الحركة غير الضرورية.

---

## قائمة التحقق النهائية (لكل صفحة)

قبل اعتبار أي صفحة "خلصت"، نمر على النقاط دي:

1. أي gradient أزرق-بنفسجي أو indigo-violet متبقي؟ (ممنوع)
2. أي gradient text؟ (ممنوع)
3. أي عنصر غير عائم لسه شايل shadow؟ (ممنوع)
4. أي sparkle glyph أو emoji كواجهة؟ (ممنوع)
5. أي icon داخل صندوق ملوّن/دائرة/مربع؟ (ممنوع)
6. أي em dash في الكوبي؟ (ممنوع)
7. أي كلمة من القايمة الممنوعة؟
8. هل كل feature/category ليها لون مختلف؟ (ممنوع)
9. أي button فيه سهم متحرك أو glow/lift/scale على hover؟ (ممنوع)
10. هل الـ hero فوق 56px أو أي section فوق 96px padding رأسي؟ (ممنوع)
11. أي عنصر شكله oversized جنب النص بتاعه؟ (يصلح)
12. هل max-width داخل 1100-1280px وكل spacing من مضاعفات 4؟
13. هل focus-visible واضح و alt صحيحة و contrast مطابق؟
14. هل empty/error/loading states موجودة وواقعية؟

> القاعدة الذهبية: لو مراجع يقدر يقول إن الصفحة مولّدة خلال 5 ثواني، نحلل إيه اللي
> فضحها ونصلحه بالذات.