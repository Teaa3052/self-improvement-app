import { useState } from "react"
import { Check, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

// izmišljene navike za probu na početnoj stranici; ništa se ne sprema, sve živi samo u ovoj komponenti
const DEMO_HABITS = [
    { id: "run", name: "Morning run" },
    { id: "read", name: "Reading" },
    { id: "meditate", name: "Meditate" },
]

// [oznaka stupca, ime za čitače ekrana]; zadnji stupac je danas
const DAYS = [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Today", "today"]]

// jedan znak po danu, od najstarijeg; zadnji je danas (1 = odrađeno)
const START_HISTORY = { run: "10111110", read: "01101111", meditate: "00100100" }

// isto pravilo kao u aplikaciji: današnji dan koji još nije odrađen ne prekida niz
function streakOf(history) {
    let i = history.length - 1
    if (history[i] !== "1") i--
    let streak = 0
    while (i >= 0 && history[i] === "1") {
        streak++
        i--
    }
    return streak
}

// Proba u gornjem dijelu početne stranice: tablica navika u kojoj posjetitelj može kliknuti kvadratiće
function HomeDemo() {
    const [demo, setDemo] = useState(START_HISTORY)

    function toggle(id, index) {
        setDemo(prev => {
            const history = prev[id]
            const flipped = history.slice(0, index) + (history[index] === "1" ? "0" : "1") + history.slice(index + 1)
            return { ...prev, [id]: flipped }
        })
    }

    const doneToday = DEMO_HABITS.filter(habit => demo[habit.id].at(-1) === "1").length

    return (
        <div
            role="group"
            aria-label="Demo: check off a habit"
            className="w-full max-w-[400px] rounded-[18px] bg-white pt-1 pr-1 pb-1.5 pl-4 shadow-[0_1px_2px_rgba(23,23,23,0.06),0_18px_40px_rgba(23,46,34,0.10)]"
        >
            <div className="flex min-h-[52px] items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-px">
                    <p className="text-[15px] font-bold">Habits</p>
                    <p className="whitespace-nowrap text-xs text-[#636363]">{doneToday} of {DEMO_HABITS.length} done today</p>
                </div>
                <div aria-hidden="true" className="flex flex-none">
                    {DAYS.map(([text], k) => {
                        const isToday = k === DAYS.length - 1
                        return (
                            <div key={text} className="flex w-10 justify-center">
                                <span className={cn(
                                    "w-[38px] rounded-lg py-1 text-center text-[11px]",
                                    isToday ? "bg-habit/12 font-bold text-habit" : "font-semibold text-subtle"
                                )}>
                                    {text}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {DEMO_HABITS.map(habit => {
                const history = demo[habit.id]
                const start = history.length - DAYS.length // povijest je duža od prikazanih 5 dana
                const streak = streakOf(history)

                return (
                    <div key={habit.id} className="flex min-h-[52px] items-center border-t border-[#EFEFED]">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-1.5">
                            <span className="truncate text-sm font-semibold">{habit.name}</span>
                            {streak > 0 && (
                                <span className="flex items-center gap-[3px] text-xs font-semibold text-orange-700">
                                    <Flame aria-hidden="true" className="size-3" strokeWidth={2.25} />
                                    {streak} {streak === 1 ? "day" : "days"}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-none">
                            {DAYS.map(([text, label], k) => {
                                const index = start + k
                                const done = history[index] === "1"
                                const isToday = index === history.length - 1
                                return (
                                    <button
                                        key={text}
                                        type="button"
                                        aria-pressed={done}
                                        aria-label={`${habit.name}, ${label}`}
                                        onClick={() => toggle(habit.id, index)}
                                        className="flex h-12 w-10 cursor-pointer items-center justify-center"
                                    >
                                        <span className={cn(
                                            "flex size-[30px] items-center justify-center rounded-lg",
                                            done && "bg-habit",
                                            !done && !isToday && "bg-[#EDEDEB]",
                                            !done && isToday && "border-2 border-dashed border-[#858585] bg-white"
                                        )}>
                                            {done && <Check aria-hidden="true" className="size-[15px] text-white" strokeWidth={3} />}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default HomeDemo
