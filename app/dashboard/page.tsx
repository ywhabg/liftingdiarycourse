import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { and, eq, gte, lt } from 'drizzle-orm'
import { db } from '@/src/db'
import { workoutsTable } from '@/src/db/schema'
import DatePicker from './DatePicker'

type SearchParams = Promise<{ date?: string }>

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const { date } = await searchParams
  const selectedDate = date ?? new Date().toISOString().split('T')[0]

  const start = new Date(`${selectedDate}T00:00:00.000Z`)
  const end = new Date(`${selectedDate}T24:00:00.000Z`)

  const workouts = await db.query.workoutsTable.findMany({
    where: and(
      eq(workoutsTable.userId, userId),
      gte(workoutsTable.startedAt, start),
      lt(workoutsTable.startedAt, end),
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => asc(we.orderIndex),
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => asc(s.setNumber),
          },
        },
      },
    },
  })

  const totalExercises = workouts.reduce((acc, w) => acc + w.workoutExercises.length, 0)
  const totalSets = workouts.reduce(
    (acc, w) => acc + w.workoutExercises.reduce((b, we) => b + we.sets.length, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                LIFT<span className="text-orange-500">LOG</span>
              </h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {new Date(selectedDate).toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <DatePicker key={selectedDate} date={selectedDate} />
          </div>

          {/* Stats strip */}
          {workouts.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Workouts', value: workouts.length },
                { label: 'Exercises', value: totalExercises },
                { label: 'Sets', value: totalSets },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center"
                >
                  <p className="text-2xl font-black text-orange-500">{value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <span className="text-2xl font-black text-zinc-600">—</span>
            </div>
            <p className="text-base font-bold text-zinc-300">No workouts logged</p>
            <p className="mt-1 text-sm text-zinc-600">Rest day or pick another date.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                {/* Workout header */}
                <div className="flex items-baseline justify-between border-b border-zinc-800 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent px-5 py-4">
                  <h2 className="text-base font-bold text-white">{workout.name}</h2>
                  <span className="tabular-nums text-xs font-medium text-zinc-500">
                    {workout.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {workout.completedAt && (
                      <> &ndash; {workout.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </span>
                </div>

                {/* Exercises */}
                <div className="divide-y divide-zinc-800/60 px-5">
                  {workout.workoutExercises.length === 0 ? (
                    <p className="py-4 text-sm text-zinc-500">No exercises recorded.</p>
                  ) : (
                    workout.workoutExercises.map((we) => (
                      <div key={we.id} className="py-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          <p className="text-sm font-semibold text-zinc-100">{we.exercise.name}</p>
                          <span className="ml-auto rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                            {we.sets.length} {we.sets.length === 1 ? 'set' : 'sets'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                          {we.sets.map((set) => (
                            <div
                              key={set.id}
                              className="rounded-xl bg-zinc-800/70 px-3 py-2.5 text-center"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                Set {set.setNumber}
                              </p>
                              <p className="mt-1 text-base font-black text-white leading-none">
                                {set.reps}
                                <span className="ml-0.5 text-[10px] font-normal text-zinc-400">reps</span>
                              </p>
                              <p className="mt-0.5 text-xs font-bold text-orange-400 leading-none">
                                {set.weight}
                                <span className="ml-0.5 text-[10px] font-normal text-zinc-500">{set.unit}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
