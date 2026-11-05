import { cn } from "@/lib/utils"
import { addDays } from "@/utils/calendar"
import ArchiveHabitDialog from "@/components/ArchiveHabitDialog"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// mali kalendar jedne dnevne navike za tekući mjesec
// habit = navika s backenda (ima dates i streak), weeks = monthGrid(today), onToggle(date, isDone) = klik na dan
function HabitCalendar({ habit, weeks, onToggle, onArchive }) {
    // je li navika odrađena tog dana? (habit.dates je niz datuma 'YYYY-MM-DD')
    const isDone = (date) => habit.dates.includes(date)

    return (
        <div className="w-[266px] space-y-3">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                    <p className="text-[15px] font-semibold">{habit.name}</p>
                    <ArchiveHabitDialog habit={habit} onArchive={onArchive} />
                </div>
                <p className="flex items-baseline gap-1.5">
                    <span className={cn("text-[28px] leading-[1.15] font-bold", habit.streak > 0 ? "text-habit" : "text-neutral-400")}>
                        {habit.streak}
                    </span>
                    <span className="text-[13px] text-subtle">
                        {habit.streak === 1 ? "day in a row" : "days in a row"}
                    </span>
                </p>
            </div>

            <div className="flex flex-col gap-1">
                <div className="grid grid-cols-[repeat(7,38px)] pb-0.5 text-center text-[11px] text-subtle">
                    {WEEKDAYS.map(name => <span key={name}>{name}</span>)}
                </div>

                {weeks.map(week => (
                    <div key={week[0].date} className="grid grid-cols-[repeat(7,38px)]">
                        {week.map(day => {
                            // dan susjednog mjeseca: samo sivi broj, ne moze se kliknuti
                            if (!day.inMonth) {
                                return (
                                    <span key={day.date} className="flex h-8 items-center justify-center text-[13px] font-medium text-neutral-500">
                                        {day.day}
                                    </span>
                                )
                            }
                            const done = isDone(day.date)
                            // traka: zaobljen je samo kraj niza (lijevo ako dan prije nije odrađen, desno ako dan poslije nije)
                            const roundLeft = !isDone(addDays(day.date, -1))
                            const roundRight = !isDone(addDays(day.date, 1))

                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    disabled={day.isFuture}
                                    onClick={() => onToggle(day.date, done)}
                                    aria-pressed={done}
                                    aria-label={`${habit.name}, ${day.date}`}
                                    className={cn(
                                        "h-8 text-[13px] font-semibold",
                                        done ? "bg-habit text-white" : "bg-habit/12",
                                        done && roundLeft && "rounded-l-[8px]",
                                        done && roundRight && "rounded-r-[8px]",
                                        day.isToday && "underline decoration-2 underline-offset-[3px]",
                                        !day.isFuture && "cursor-pointer"
                                    )}
                                >
                                    {day.day}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HabitCalendar
