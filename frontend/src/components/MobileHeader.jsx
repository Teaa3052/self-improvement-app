import { Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

// Gornja traka na mobitelu: gumb za izbornik, naslov stranice i desno gumb stranice (children), npr. dodavanje navike.
// Na računalu se ne vidi (md:hidden), jer je tamo izbornik uvijek otvoren.
function MobileHeader({ title, children }) {
    const { toggleSidebar } = useSidebar()

    return (
        <header className="sticky top-0 z-10 flex h-14 flex-none items-center gap-1 border-b border-[#E6E6E3] bg-background px-1 md:hidden">
            <button
                type="button"
                aria-label="Open menu"
                onClick={toggleSidebar}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-[10px]"
            >
                <Menu className="size-5" />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-[-0.01em]">{title}</h1>
            {children}
        </header>
    )
}

export default MobileHeader
