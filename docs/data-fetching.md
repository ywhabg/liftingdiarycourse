# Data Fetching Standards

## The Only Permitted Pattern

**All data fetching MUST be done exclusively via React Server Components.**

This is a hard rule with no exceptions:

- **Route handlers** (`app/foo/route.ts`) — NEVER use for data fetching
- **Client components** (`'use client'`) — NEVER fetch data directly
- **`useEffect` + `fetch`** — NEVER
- **SWR, React Query, or any client-side fetching library** — NEVER
- **`fetch()` inside Server Actions** — NEVER (Server Actions are for mutations only)

If you find yourself reaching for any of the above to load data, stop. Move the data requirement up to the nearest Server Component ancestor and pass the result down as props.

## Database Access

**All database queries MUST go through helper functions in the `data/` directory.**

- Do **not** write Drizzle queries inline in components, layouts, or pages.
- Do **not** use raw SQL (`db.execute`, template literals, `sql` tagged queries).
- Every query must be a named, exported function in `data/`.
- All `data/` helpers must use the Drizzle ORM query API (`db.select().from()`, `db.query.*`, etc.).

### Example structure

```
data/
  workouts.ts    ← query helpers for the workouts table
  exercises.ts   ← query helpers for the exercises table
  sets.ts        ← query helpers for the sets table
```

### Example helper

```ts
// data/workouts.ts
import { db } from '@/lib/db';
import { workouts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example Server Component consuming a helper

```tsx
// app/dashboard/page.tsx  (Server Component — no 'use client')
import { getWorkoutsForUser } from '@/data/workouts';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## Data Ownership — Critical Security Requirement

**A logged-in user must ONLY ever be able to access their own data.**

Every helper function that returns user-owned data MUST scope its query to the authenticated user's ID. This is not optional and must never be skipped — even for internal helpers that "won't be called with the wrong ID."

Rules:

1. **Always resolve the session inside the Server Component** (not inside the helper) using your auth library, then pass `userId` into the helper explicitly.
2. **Every helper that touches user-owned rows MUST include a `userId` filter** in the Drizzle `where` clause. A helper that accepts an arbitrary record ID (e.g. `workoutId`) must also filter by `userId` in the same query — never fetch by ID alone.
3. **Never accept a `userId` from the client** (URL params, request body, query string). Always derive it server-side from the verified session.
4. **Never return all rows** from a user-owned table without a `userId` filter, even in admin or debug paths.

### Correct — scoped by userId AND recordId

```ts
// data/workouts.ts
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

### Wrong — fetches by ID alone, any user's data is accessible

```ts
// NEVER do this
export async function getWorkoutById(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId)); // ← missing userId filter
  return workout;
}
```
