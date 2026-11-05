import { useState, useEffect } from "react"
import AddHabitDialog from "@/components/AddHabitDialog"
import HabitCalendar from "@/components/HabitCalendar"
import MobileDashboard from "@/components/MobileDashboard"
import { api } from "@/api/client"
import { useIsMobile } from "@/hooks/use-mobile"
import { todayString } from "@/utils/dates"
import { addMonths, gridStart, longDate, monthGrid, monthName, monthPeriod, monthWeeks, periodStart } from "@/utils/calendar"
import PeriodRow from "@/components/PeriodRow"

// navike sa zapisima od datuma from; backend svejedno računa streak iz svih zapisa
async function fetchHabits(from) {
    const response = await api.get('/habits', { params: { today: todayString(), from }})
    return response.data.habits
}

// strelica za promjenu mjeseca (trokut pokazuje lijevo ili desno)
function MonthArrow({ label, path, disabled, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg disabled:cursor-default disabled:text-neutral-400"
        >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
        </button>
    )
}

function Dashboard() {
    const [habits, setHabits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [month, setMonth] = useState(() => periodStart(todayString(), 'monthly')) // prvi dan mjeseca koji kalendar prikazuje
    const isMobile = useIsMobile()

    const today = todayString()
    // od kojeg datuma trebamo zapise: mobitel prikazuje zadnjih 5 mjeseci, računalo jednu mrežu kalendara
    const from = isMobile ? addMonths(today, -4) : gridStart(month)

    async function toggleLog(habitId, date, isDone) {
        if(isDone) {
            await api.delete(`/habits/${habitId}/logs/${date}`)
        } else {
            await api.put(`/habits/${habitId}/logs/${date}`)
        }
        setHabits(await fetchHabits(from))
    }

    async function addHabit(newHabit) {
        const response = await api.post('/habits', newHabit) // newHabit = { name, frequency } iz dijaloga
        const habit = response.data.habit // backend vrati { habit: {id,name,frequency,createdAt}}
        setHabits(prev => [...prev, { ...habit, doneInPeriod: false, streak: 0, dates: []}]) // nova navika još nema zapisa
    }

    async function archiveHabit(habitId) {
        await api.delete(`/habits/${habitId}`)
        setHabits(prev => prev.filter(habit => habit.id !== habitId))
    }

    useEffect(() => {
        let stale = false // postane true kad se from promijeni: odgovor na stari zahtjev više ne vrijedi

        async function loadHabits() {
            try {
                const loaded = await fetchHabits(from)
                 // navike s backenda, svaka s doneInPeriod, streak i dates
                if (!stale) setHabits(loaded)
            } catch {
                if (!stale) setError('Could not load habits') // backend ne radi ili je vratio grešku
            } finally {
                if (!stale) setLoading(false) // gotovo učitavanje, uspjelo ili ne
            }
        }
        loadHabits()

        return () => { stale = true }
    }, [from]) // ponovno samo kad se promijeni from, npr. klikom na drugi mjesec

    if (loading) {
        return <p className="p-4 md:p-10">Loading...</p>
    }

    if (error) {
        return <p className="p-4 text-destructive md:p-10">{error}</p>
    }

    if (isMobile) {
        return (
            <MobileDashboard
                habits={habits}
                today={today}
                onAddHabit={addHabit}
                onToggle={toggleLog}
                onArchive={archiveHabit}
            />
        )
    }

    const weeks = monthGrid(month, today)
    const daily = habits.filter(habit => habit.frequency === 'daily')
    const weekly = habits.filter(habit => habit.frequency === 'weekly')
    const monthly = habits.filter(habit => habit.frequency === 'monthly')
    const isCurrentMonth = month === periodStart(today, 'monthly')

    // sidebar daje AppLayout, pa ovdje ostaje samo sadržaj stranice
    return (
        <div className="flex flex-col gap-7 p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-subtle">{longDate(today)}</p>
                    <h1 className="mt-1 text-[28px] font-bold tracking-[-0.01em]">Dashboard</h1>
                </div>
                <AddHabitDialog onAddHabit={addHabit} />
            </div>
            {habits.length === 0 ? (
                <p className="text-muted-foreground">No habits yet. Add your first one!</p>
            ) : (
                // jedan veliki okvir: gore dnevne navike (kalendari), dolje tjedne i mjesečne
                // crte između dijelova su pozadina okvira koja proviruje kroz gap-px
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-px overflow-hidden rounded-[16px] border bg-hairline">
                    <section className="col-span-full flex flex-col gap-5 bg-background px-6 pt-6 pb-7">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                            <h2 className="text-[17px] font-bold">Daily</h2>
                            <div className="flex items-center gap-1">
                                <MonthArrow label="Previous month" path="M16 4 6 12l10 8z" onClick={() => setMonth(addMonths(month, -1))} />
                                <span className="min-w-[120px] text-center text-[15px] font-bold">{monthName(month)}</span>
                                {/* budući mjeseci nemaju što prikazati */}
                                <MonthArrow label="Next month" path="M8 4l10 8-10 8z" disabled={isCurrentMonth} onClick={() => setMonth(addMonths(month, 1))} />
                            </div>
                        </div>
                        {daily.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No daily habits yet.</p>
                        ) : (
                            // svaka dnevna navika ima svoj kalendar; u red stane onoliko koliko ima mjesta (min. 266px)
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(266px,1fr))] gap-x-8 gap-y-7">
                                {daily.map(habit => (
                                    <HabitCalendar
                                        key={habit.id}
                                        habit={habit}
                                        weeks={weeks}
                                        onToggle={(date, isDone) => toggleLog(habit.id, date, isDone)}
                                        onArchive={() => archiveHabit(habit.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* dolje: tjedne (lijevo) i mjesečne (desno) navike, jedna uz drugu */}
                    <section className="flex flex-col gap-4 bg-background px-6 pt-6 pb-7">
                        <div className="flex items-baseline gap-2.5">
                            <h2 className="text-[17px] font-bold">Weekly</h2>
                            <span className="text-[13px] text-subtle">weeks of {monthName(month, 'plain')}</span>
                        </div>
                        {weekly.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No weekly habits yet.</p>
                        ) : (
                            weekly.map(habit => (
                                <PeriodRow
                                    key={habit.id}
                                    habit={habit}
                                    periods={monthWeeks(month, today)}
                                    today={today}
                                    onToggle={(date, isDone) => toggleLog(habit.id, date, isDone)}
                                    onArchive={() => archiveHabit(habit.id)}
                                />
                            ))
                        )}
                    </section>

                    <section className="flex flex-col gap-4 bg-background px-6 pt-6 pb-7">
                        <div className="flex items-baseline gap-2.5">
                            <h2 className="text-[17px] font-bold">Monthly</h2>
                            <span className="text-[13px] text-subtle">{isCurrentMonth ? "this month" : monthName(month, 'plain')}</span>
                        </div>
                        {monthly.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No monthly habits yet.</p>
                        ) : (
                            monthly.map(habit => (
                                <PeriodRow
                                    key={habit.id}
                                    habit={habit}
                                    periods={monthPeriod(month, today)}
                                    today={today}
                                    onToggle={(date, isDone) => toggleLog(habit.id, date, isDone)}
                                    onArchive={() => archiveHabit(habit.id)}
                                />
                            ))
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
export default Dashboard
