'use client'

import { format, parseISO } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const selected = parseISO(date)

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white focus:outline-none">
        <CalendarIcon className="h-4 w-4 text-orange-500" />
        {format(selected, 'do MMM yyyy')}
      </PopoverTrigger>
      <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-0" align="end">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) router.push(`${pathname}?date=${format(d, 'yyyy-MM-dd')}`)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
