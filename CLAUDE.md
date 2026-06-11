# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # install dependencies (uses npm, not pnpm)
npm run dev           # development with hot reload (http://localhost:3000)
npm run build         # compile & bundle for production
npm run start         # run production build (requires build first)
npm run lint          # ESLint code quality check
```

Run a single test file:
```bash
npx jest --testPathPattern="component-name"
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_API_URL` — backend API base URL (e.g. `http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_APP_NAME` — displayed app name
- `NEXT_PUBLIC_APP_URL` — frontend canonical URL

All three are public (browser-accessible). There are no server-only secrets; auth tokens are managed client-side via localStorage/Zustand.

## Architecture

This is a **Next.js 16 App Router + React Query + Zustand** frontend. Every feature is split across four layers:

```
src/
  app/               ← Next.js App Router pages, layouts, route groups
  components/        ← React components (ui/, admin/, employee/, feature-scoped/)
  services/          ← Axios API client + per-resource service objects
  stores/            ← Zustand stores (auth, locale)
  hooks/             ← Reusable custom hooks
  types/             ← Shared TypeScript interfaces and enums
  lib/               ← Utilities (cn, i18n)
  config/            ← App-wide constants (API base URL, site metadata)
```

### Adding a new feature — the checklist

1. **Types** — add interfaces/enums to `src/types/<name>.ts`
2. **Service** — add service object to `src/services/<name>.ts` using the shared `api` instance
3. **Components** — add feature components under `src/components/<name>/`
4. **Pages** — add route under `src/app/admin/<name>/` or `src/app/employee/<name>/` with appropriate layout
5. **i18n** — add translation keys to both `src/lib/i18n/messages-en.ts` and `src/lib/i18n/messages-lo.ts`

### Route groups & access control

```
app/
  (auth)/            ← Public auth pages (login, force-password)
  admin/             ← ADMIN role only; guarded in admin/layout.tsx
  employee/          ← EMPLOYEE role only; guarded in employee/layout.tsx
```

Layout guards check `token && user && user.role === "ADMIN|EMPLOYEE"` after store hydration. Return `null` while hydrating; redirect with `router.replace()` when unauthorized. Never use `router.push()` for auth redirects — replace prevents back-navigation to protected pages.

### API service pattern

All services share one Axios instance (`src/services/api.ts`):
- Request interceptor injects `Authorization: Bearer {token}` from Zustand store.
- Response interceptor catches 401 → calls `logout()` → redirects to `/`.
- Timeout: 15 seconds.

Service objects follow this shape:

```typescript
export const exampleService = {
  list:     (params) => api.get<BaseApiResponse<PaginatedResponse<T>>>("/resource", { params }),
  getById:  (id)     => api.get<BaseApiResponse<T>>(`/resource/${id}`),
  create:   (data)   => api.post<BaseApiResponse<T>>("/resource", data),
  update:   (id, data) => api.patch<BaseApiResponse<T>>(`/resource/${id}`, data),
  delete:   (id)     => api.delete(`/resource/${id}`),
};
```

File uploads use `multipart/form-data` — append to `FormData` and pass as the request body.

### Response envelope

Every API response is wrapped:
```typescript
interface BaseApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
}
```

Extract error messages as: `error.response?.data?.error?.message ?? fallback`.

### State management

| Store | File | Purpose |
|---|---|---|
| `useAuthStore` | `stores/auth.ts` | `token`, `refreshToken`, `user`, `hydrated` — persisted to localStorage |
| `useLocaleStore` | `lib/i18n/index.ts` | `locale` ("en" \| "lo"), `hydrated` — persisted to localStorage |

Both stores expose a `hydrate()` action. Call it once on app mount via `StoreHydrator` (`components/html-lang-sync.tsx`). Never read token/user from localStorage directly — always use the store.

Server state (lists, detail pages) lives in **React Query** (`useQuery` / `useMutation`). Default config: `retry: 1`, `refetchOnWindowFocus: false`.

### Component conventions

- Add `"use client"` at the top of any component that uses hooks, events, or browser APIs.
- UI primitives live in `components/ui/` — these are **shadcn/ui** components; do not modify them manually. Re-generate with `npx shadcn add <component>`.
- **Always use the `components/ui/` primitives** — `<Button>`, `<Input>`, `<Table>`, `<Badge>`, `<Card>`, etc. Never write a raw `<button>`, `<table>`, or hand-rolled input for anything that *looks like* a standard control. Raw `<button type="button">` is acceptable only for bespoke interactive elements the primitives don't cover (tab triggers, password-visibility eye toggles, sortable table headers, avatar-upload overlays).
- Feature dialogs follow the pattern: open state in parent → pass `open` + `onOpenChange` + `onSuccess` props.
- Skeletons live alongside the feature components (`page-skeletons.tsx`) — add one for every new list/detail page.

### Canonical page anatomy

**`src/app/admin/departments/page.tsx` is the reference implementation** for list pages. Every new admin/employee page must follow its structure:

```tsx
<div className="flex flex-1 flex-col bg-muted/40">
  <div className="p-6">
    {/* 1. Heading: title + subtitle left, primary action right */}
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t.feature.heading}</h2>
        <p className="text-sm text-muted-foreground">{t.feature.subheading}</p>
      </div>
      <Button size="sm"><Plus className="size-4" />{t.feature.add}</Button>
    </div>

    {/* 2. Stat cards: rounded-xl border bg-background p-4 shadow-sm */}
    {/* 3. Toolbar (search/filters): rounded-xl border bg-background p-3 shadow-sm */}
    {/* 4. Data table: <Table> from components/ui/table inside the same card style */}
  </div>
</div>
```

Fixed type scale — do not invent new sizes:
- Page title: `text-xl font-semibold tracking-tight`
- Stat-card value: `text-2xl font-semibold tracking-tight`
- Subtitles / helper text: `text-sm text-muted-foreground`

### Status badges

Status → color mappings must come from **one shared component per domain**, not a per-page `switch`. The reference is `components/business-trips/trip-status-badge.tsx` (`<TripStatusBadge status={...} />`) — use it for trip statuses and follow the same shape for any new status-bearing domain. Palette: `bg-emerald-50 text-emerald-700` (verified), `bg-red-50 text-red-700` (rejected), `bg-amber-50 text-amber-700` (pending), `bg-muted text-muted-foreground` (draft).

### User feedback (toasts vs alerts)

- Mutation success/failure → **sonner toast** (`toast.success(...)` / `toast.error(...)`). This is the default everywhere.
- Inline `<Alert>` is reserved for form-level validation errors on auth pages only.

### Loading states

- Server-routable pages get a `loading.tsx` that renders the matching skeleton from `page-skeletons.tsx` (the employee/business-trips routes are the reference).
- Client-side fetch states inside a mounted page use `<Skeleton>` blocks that mirror the final layout — never a spinner or bare "Loading..." text.

### Forms

Use **react-hook-form** + **Zod** + `zodResolver`:

```typescript
const schema = z.object({ field: z.string().min(1) });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

Use `<Controller>` for non-native inputs (Select, DatePicker, etc.). Read `form.formState.isSubmitting` to disable the submit button during submission.

### Styling

- Use **Tailwind CSS** utility classes exclusively — no custom CSS except in `globals.css`.
- **No inline `style={{...}}` and no hard-coded hex colors** (`#0ea5e9` etc.). Use Tailwind theme tokens (`bg-primary`, `text-muted-foreground`, `bg-sky-500`, ...). If a color isn't in the theme, add it to the theme — don't inline it.
- Use the `cn()` helper (`lib/utils.ts`) for conditional class merging.
- Use `cva` (class-variance-authority) when a component needs multiple visual variants.
- Icons are always from **lucide-react** — sized via the `size` prop.

### Known UI debt — migrate as you touch

These predate the conventions above. **Do not copy patterns from them.** When you edit one of them for any reason, also bring the parts you touch up to the canonical pattern:

- `app/(auth)/login/page.tsx` — bespoke design built with an embedded CSS string and hex colors. Converting it to Tailwind is a deliberate design pass, not a drive-by fix; until then it is exempt from the styling rules but must not be used as a reference. (The landing page `app/page.tsx` has already been converted — its keyframes live at the bottom of `globals.css`.)
- All `business-trips` pages hard-code English strings instead of `useT()` — the whole feature needs i18n keys added to both message files.

Inline `style={{ width: \`${pct}%\` }}` for computed values (progress bars, chart widths) is fine — the no-inline-style rule applies to static styling only.

### i18n

All user-visible strings go through the `useT()` hook:

```typescript
const t = useT(); // returns the full translation object for the current locale
```

Add new keys to **both** `src/lib/i18n/messages-en.ts` and `src/lib/i18n/messages-lo.ts` before using them. Never hard-code English strings in components.

### API base path

The backend API is prefixed `api/v1/` — configured in `src/config/api.ts` via `NEXT_PUBLIC_API_URL`.

Swagger for the backend is available at `http://localhost:<BACKEND_PORT>/docs`.
