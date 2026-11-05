import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const FREQUENCIES = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
]

// children = gumb koji otvara dijalog; bez njega se prikaže crni gumb "Add habit" (mobitel daje svoj, ikonu +)
function AddHabitDialog ({ onAddHabit, children }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [frequency, setFrequency] = useState("daily")
    const [nameError, setNameError] = useState(false)
    const [error, setError] = useState(null)

    // kod zatvaranja (Save, Cancel, klik izvan dijaloga) sve vrati na početno, da se stara greška ne vidi idući put
    const handleOpenChange = (nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
            setName("")
            setFrequency("daily")
            setNameError(false)
            setError(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            setNameError(true)
            return
        }

        try {
            await onAddHabit({ name, frequency }) // cekaj da Dashboard spremi naviku na backend
            // ovo ispod izvrši samo ako je spremanje uspjelo
            handleOpenChange(false)
        } catch (err) {
            // spremanje nije uspjelo: dijalog ostaje otvoren i pokaže poruku
            setError(err.response?.data?.message || "Could not add habit")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children ?? <Button className="h-10 rounded-[10px] px-[18px] font-semibold">Add habit</Button>}
            </DialogTrigger>

            <DialogContent showCloseButton={false} aria-describedby={undefined} className="rounded-2xl p-7 sm:max-w-[400px]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">New habit</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="font-semibold">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange = {(e) => {
                                setName(e.target.value)
                                setNameError(false)
                            }}
                            placeholder="e.g. Morning run"
                            aria-invalid={nameError}
                            className="h-[42px] rounded-[10px] border-neutral-300 px-3 text-[15px] shadow-none md:text-[15px]"
                        />
                        {nameError && <p className="text-[13px] text-red-700">Name is required</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <p id="frequency-label" className="text-sm font-semibold">How often</p>
                        {/* umjesto padajućeg izbornika tri gumba: odabrani je zelen */}
                        <div role="group" aria-labelledby="frequency-label" className="grid grid-cols-3 gap-2">
                            {FREQUENCIES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={frequency === value}
                                    onClick={() => setFrequency(value)}
                                    className={cn(
                                        "h-[42px] cursor-pointer rounded-[10px] border text-sm font-semibold",
                                        frequency === value ? "border-habit bg-habit text-white" : "border-neutral-300 bg-white"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    { error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" className="h-10 rounded-[10px] px-4 font-semibold text-neutral-700">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="h-10 rounded-[10px] px-[18px] font-semibold">Save habit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddHabitDialog
