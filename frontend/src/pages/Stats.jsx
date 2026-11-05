import { useState, useEffect } from "react"
import { api } from "@/api/client"
import MobileHeader from "@/components/MobileHeader"
import { todayString } from "@/utils/dates"
import { dateRange, dayLabel } from "@/utils/calendar"
import { cn } from "@/lib/utils"

// jedinica perioda po frekvenciji: [jednina, množina]
const UNITS = {
    daily: ["day", "days"],
    weekly: ["week", "weeks"],
    monthly: ["month", "months"],
}

// unit('weekly', 1) -> 'week', unit('weekly', 5) -> 'weeks'
function unit(frequency, count) {
    return UNITS[frequency][count === 1 ? 0 : 1]
}

// niz datuma podijeljen na skupine od 7, da se dani čitaju po tjednima
function inWeeks(days) {
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }
    return weeks
}

// jedan broj na vrhu stranice, s opisom ispod
function SummaryTile({ value, label, highlight }) {
    return (
        <div className="flex flex-col gap-1">
            <p className={cn("text-[30px] font-bold tracking-[-0.01em]", highlight && "text-habit")}>{value}</p>
            <p className="text-[13px] text-subtle">{label}</p>
        </div>
    )
}

// red u "By habit": ime, traka koliko je posto odrađeno, postotak i "12 of 20 days"
function HabitBar({ habit }) {
    const hasData = habit.percent !== null // null = jedini period je tekući i još nije gotov

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="min-w-0 flex-[0_0_130px] truncate text-sm font-semibold">{habit.name}</span>
            <div aria-hidden="true" className="h-2 flex-[999_1_200px] overflow-hidden rounded-full bg-hairline">
                {/* širina ovisi o podacima, pa ide kroz style: Tailwind poznaje samo klase napisane unaprijed u kodu */}
                <div className="h-full rounded-full bg-habit" style={{ width: `${habit.percent ?? 0}%` }} />
            </div>
            <div className="ml-auto flex w-[150px] flex-none items-baseline justify-end gap-2">
                <span className="text-sm font-bold">{hasData ? `${habit.percent}%` : "–"}</span>
                <span className="text-xs text-subtle">
                    {hasData
                        ? `${habit.done} of ${habit.total} ${unit(habit.frequency, habit.total)}`
                        : `this ${unit(habit.frequency, 1)} isn't over yet`}
                </span>
            </div>
        </div>
    )
}

// kvadratići za jednu dnevnu naviku, jedan za svaki od 30 dana: zelen = odrađeno
function DayStrip({ habit, days }) {
    const summary = `${habit.dates.length} of ${days.length} days`

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex min-w-0 flex-[0_0_130px] flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{habit.name}</span>
                <span className="text-xs text-subtle">{summary}</span>
            </div>
            {/* tjedni se na užem ekranu prelamaju u nove redove */}
            <div role="img" aria-label={`${habit.name}: done on ${summary}`} className="flex flex-wrap gap-x-2.5 gap-y-1">
                {inWeeks(days).map(week => (
                    <div key={week[0]} className="flex gap-1">
                        {week.map(day => (
                            <div
                                key={day}
                                title={dayLabel(day)}
                                className={cn("size-5 rounded-[5px]", habit.dates.includes(day) ? "bg-habit" : "bg-zinc-200")}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// brojevi dana iznad kvadratića; samo na širokom ekranu, gdje su svi tjedni u jednom redu
function DayLabels({ days }) {
    return (
        <div aria-hidden="true" className="-mb-2 hidden gap-x-4 xl:flex">
            <div className="flex-[0_0_130px]" />
            <div className="flex gap-2.5">
                {inWeeks(days).map(week => (
                    <div key={week[0]} className="flex gap-1">
                        {week.map(day => (
                            <div key={day} className={cn(
                                "w-5 text-center text-[10px]",
                                day === days.at(-1) ? "font-bold text-foreground" : "font-medium text-subtle"
                            )}>
                                {Number(day.slice(8))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Statistika navika za zadnjih 30 dana: sažetak, postotak po navici i dani za dnevne navike
function Stats() {
    const [stats, setStats] = useState(null) // cijeli odgovor backenda: { from, to, summary, habits }
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // isti obrazac kao na Dashboardu: dohvati jednom, pri prvom prikazu
    useEffect(() => {
        async function loadStats() {
            try {
                const response = await api.get('/stats', { params: { today: todayString() } })
                setStats(response.data)
            } catch {
                setError('Could not load stats') // backend ne radi ili je vratio grešku
            } finally {
                setLoading(false) // gotovo učitavanje, uspjelo ili ne
            }
        }
        loadStats()
    }, []) // [] = samo jednom, pri prvom prikazu

    if (loading) {
        return <p className="p-4 md:p-10">Loading...</p>
    }

    if (error) {
        return <p className="p-4 text-destructive md:p-10">{error}</p>
    }

    const { from, to, summary, habits } = stats
    const days = dateRange(from, to) // 30 datuma, za kvadratiće dnevnih navika
    const daily = habits.filter(habit => habit.frequency === 'daily')
    const best = summary.bestStreak // { name, days } ili null

    return (
        <>
            <MobileHeader title="Stats" />
            <div className="flex flex-col gap-7 p-4 md:p-10">
                <div>
                    <p className="text-sm text-subtle">Last 30 days</p>
                    <h1 className="mt-1 hidden text-[28px] font-bold tracking-[-0.01em] md:block">Stats</h1>
                </div>

                {habits.length === 0 ? (
                    <p className="text-muted-foreground">No habits yet. Add one on the dashboard.</p>
                ) : (
                    // jedan okvir s tri dijela; crte između njih su pozadina koja proviruje kroz gap-px
                    <div className="flex flex-col gap-px overflow-hidden rounded-[16px] border bg-hairline">
                        <section aria-label="Overview" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 bg-background p-6">
                            <SummaryTile
                                value={summary.averagePercent === null ? "–" : `${summary.averagePercent}%`}
                                label="average completion"
                            />
                            <SummaryTile
                                value={best ? `${best.days} ${unit('daily', best.days)}` : "–"}
                                label={best ? `best daily streak, ${best.name}` : "best daily streak"}
                                highlight={!!best}
                            />
                            <SummaryTile
                                value={`${summary.doneThisPeriod} of ${summary.habitCount}`}
                                label="done this period"
                            />
                        </section>

                        <section className="flex flex-col gap-3.5 bg-background px-6 pt-6 pb-[26px]">
                            <h2 className="text-[17px] font-bold">By habit</h2>
                            {habits.map(habit => (
                                <HabitBar key={habit.id} habit={habit} />
                            ))}
                        </section>

                        {daily.length > 0 && (
                            <section className="flex flex-col gap-3.5 bg-background px-6 pt-6 pb-[26px]">
                                <div className="flex items-baseline gap-2.5">
                                    <h2 className="text-[17px] font-bold">Daily</h2>
                                    <span className="text-[13px] text-subtle">{dayLabel(from)} – {dayLabel(to)}</span>
                                </div>
                                <DayLabels days={days} />
                                {daily.map(habit => (
                                    <DayStrip key={habit.id} habit={habit} days={days} />
                                ))}
                            </section>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default Stats
