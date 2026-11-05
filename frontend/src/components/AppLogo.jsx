import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Znak aplikacije: zeleni kvadrat s kvačicom. className određuje veličinu kvadrata, iconClassName veličinu kvačice.
function AppLogo({ className = "size-7 rounded-lg", iconClassName = "size-4" }) {
    return (
        <span aria-hidden="true" className={cn("flex flex-none items-center justify-center bg-habit text-white", className)}>
            <Check className={iconClassName} strokeWidth={3} />
        </span>
    )
}

export default AppLogo
