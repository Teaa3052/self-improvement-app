import { Check, Flame, Plus } from "lucide-react"
import AddHabitDialog from "@/components/AddHabitDialog"
import ArchiveHabitDialog from "@/components/ArchiveHabitDialog"
import MobileHeader from "@/components/MobileHeader"
import { cn } from "@/lib/utils"
import { longDate, periodStart, recentPeriods } from "@/utils/calendar"

const SECTIONS = [
    { title: "Daily", frequency: "daily", periodWord: "today" },
    { title: "Weekly", frequency: "weekly", periodWord: "this week" },
    { title: "Monthly", frequency: "monthly", periodWord: "this month" },
]

const RING_LENGTH = 2 * Math.PI * 16 // opseg kruga polumjera 16

// krug koji pokazuje koliki je dio navika odrađen u tekućem periodu
function ProgressRing({ done, total }) {
    const filled = total === 0 ? 0 : (done / total) * RING_LENGTH

    return (
        <svg role="img" aria-label={`${done} of ${total} habits done`} width="40" height="40" viewBox="0 0 40 40" className="flex-none">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#E2E2DF" strokeWidth="5" />
            <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                strokeWidth="5"
                className="stroke-habit"
                strokeLinecap={done === 0 ? "butt" : "round"}
                strokeDasharray={`${filled} ${RING_LENGTH}`}
                transform="rotate(-90 20 20)"
            />
        </svg>
    )
}

// red jedne navike: ime i streak (klik otvara arhiviranje) + kvadratić za svaki od zadnjih 5 perioda
function MobileHabitRow({ habit, periods, today, onToggle, onArchive }) {
    // streak prikazujemo samo za dnevne navike, kao i na računalu
    const showStreak = habit.frequency === "daily" && habit.streak > 0
    const streakText = `${habit.streak} ${habit.streak === 1 ? "day" : "days"}`

    return (
        <div className="flex min-h-[60px] items-stretch border-t border-[#EFEFED]">
            <ArchiveHabitDialog habit={habit} onArchive={onArchive}>
                <button
                    type="button"
                    aria-label={`${habit.name}${showStreak ? `, ${streakText} in a row` : ""}, more options`}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-[3px] pr-2 text-left"
                >
                    <span className="truncate text-[15px] font-semibold">{habit.name}</span>
                    {showStreak && (
                        <span className="flex items-center gap-[3px] text-xs font-semibold text-orange-700">
                            <Flame aria-hidden="true" className="size-3" strokeWidth={2.25} />
                            {streakText}
                        </span>
                    )}
                </button>
            </ArchiveHabitDialog>

            <div className="flex flex-none items-center">
                {periods.map(period => {
                    // zapis koji pada u ovaj period (isto pravilo kao PeriodRow)
                    const logDate = habit.dates.find(date => periodStart(date, habit.frequency) === period.start)
                    const done = logDate !== undefined
                    const date = done ? logDate : (period.isCurrent ? today : period.start)

                    return (
                        <button
                            key={period.start}
                            type="button"
                            aria-pressed={done}
                            aria-label={`${habit.name}, ${period.label}`}
                            onClick={() => onToggle(date, done)}
                            className="flex h-[52px] w-11 cursor-pointer items-center justify-center"
                        >
                            {/* odrađeno = zeleno; propušteno = sivo; tekući period koji je još otvoren = crtkani rub */}
                            <span className={cn(
                                "flex size-8 items-center justify-center rounded-[9px]",
                                done && "bg-habit",
                                !done && !period.isCurrent && "bg-[#EDEDEB]",
                                !done && period.isCurrent && "border-2 border-dashed border-[#858585] bg-white"
                            )}>
                                {done && <Check aria-hidden="true" className="size-4 text-white" strokeWidth={3} />}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// Dashboard na mobitelu: umjesto kalendara tablica sa zadnjih 5 dana, tjedana i mjeseci.
// Podatke i funkcije dobiva od stranice Dashboard, kao i računalni prikaz.
function MobileDashboard({ habits, today, onAddHabit, onToggle, onArchive }) {
    const doneCount = habits.filter(habit => habit.doneInPeriod).length

    return (
        <div className="flex min-h-svh flex-col bg-phone">
            <MobileHeader title="Dashboard">
                <AddHabitDialog onAddHabit={onAddHabit}>
                    <button type="button" aria-label="Add habit" className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-[10px]">
                        <Plus aria-hidden="true" className="size-[22px]" />
                    </button>
                </AddHabitDialog>
            </MobileHeader>

            <div className="flex flex-1 flex-col gap-2 px-2 pt-3 pb-6">
                <section aria-label="Progress" className="flex items-center gap-3 pt-1 pr-2 pb-2 pl-2.5">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="text-[13px] text-[#5E5E5E]">{longDate(today)}</p>
                        <p className="text-[17px] font-bold">{doneCount} of {habits.length} done</p>
                    </div>
                    <ProgressRing done={doneCount} total={habits.length} />
                </section>

                {habits.length === 0 && (
                    <p className="px-2.5 text-sm text-subtle">No habits yet. Add your first one!</p>
                )}

                {SECTIONS.map(({ title, frequency, periodWord }) => {
                    const sectionHabits = habits.filter(habit => habit.frequency === frequency)
                    if (sectionHabits.length === 0) return null

                    const periods = recentPeriods(frequency, today)
                    const sectionDone = sectionHabits.filter(habit => habit.doneInPeriod).length

                    return (
                        <section key={frequency} aria-labelledby={`heading-${frequency}`} className="flex flex-col rounded-2xl bg-white pt-0.5 pr-1 pb-1 pl-3.5">
                            <div className="flex min-h-[54px] items-center">
                                <div className="flex min-w-0 flex-1 flex-col gap-px">
                                    <h2 id={`heading-${frequency}`} className="text-[15px] font-bold">{title}</h2>
                                    <span className="truncate text-xs text-[#636363]">{sectionDone} of {sectionHabits.length} done {periodWord}</span>
                                </div>
                                <div aria-hidden="true" className="flex flex-none">
                                    {periods.map(period => (
                                        <div key={period.start} className="flex w-11 justify-center">
                                            <div className={cn(
                                                "flex w-[38px] flex-col items-center gap-px rounded-[10px] py-[5px]",
                                                period.isCurrent && "bg-habit/12"
                                            )}>
                                                {period.top && (
                                                    <span className={cn("text-[10px] leading-3 font-semibold tracking-[0.05em]", period.isCurrent ? "text-habit" : "text-subtle")}>
                                                        {period.top}
                                                    </span>
                                                )}
                                                <span className={cn("text-sm leading-[18px] font-bold", period.isCurrent && "text-habit")}>{period.main}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {sectionHabits.map(habit => (
                                <MobileHabitRow
                                    key={habit.id}
                                    habit={habit}
                                    periods={periods}
                                    today={today}
                                    onToggle={(date, isDone) => onToggle(habit.id, date, isDone)}
                                    onArchive={() => onArchive(habit.id)}
                                />
                            ))}
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

export default MobileDashboard
