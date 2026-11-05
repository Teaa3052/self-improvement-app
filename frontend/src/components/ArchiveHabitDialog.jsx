import { useState } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"

// mala ikona pokraj imena navike; klik otvori potvrdu "Archive ...?"
// habit = navika, onArchive() = Dashboard je arhivira na backendu i makne s popisa
// children = gumb koji otvara potvrdu, ako ne želimo ikonu (na mobitelu je to cijelo ime navike)
function ArchiveHabitDialog({ habit, onArchive, children }) {
    const [error, setError] = useState(null)

    const handleArchive = async () => {
        try {
            await onArchive()
        } catch (err) {
            setError(err.response?.data?.message || "Could not archive habit")
        }
    }

    return (
        // kod svakog otvaranja/zatvaranja makni staru poruku o grešci
        <Dialog onOpenChange={() => setError(null)}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="ghost" size="icon-xs" aria-label={`Archive ${habit.name}`} className="text-muted-foreground">
                        <Archive />
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent showCloseButton={false} className="gap-[22px] rounded-2xl p-7 sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-xl leading-snug font-bold">Archive “{habit.name}”?</DialogTitle>
                    <DialogDescription className="leading-normal text-body">It leaves your dashboard. Its history is kept.</DialogDescription>
                </DialogHeader>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-10 rounded-[10px] px-4 font-semibold text-neutral-700">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleArchive} className="h-10 rounded-[10px] px-[18px] font-semibold">Archive</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ArchiveHabitDialog
