'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <input
      type="date"
      defaultValue={date}
      onChange={(e) => router.push(`${pathname}?date=${e.target.value}`)}
      className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
    />
  )
}
