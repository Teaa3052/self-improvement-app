import { Link } from "react-router-dom"
import { CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react"
import AppLogo from "@/components/AppLogo"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/lib/brand"

// Zajednički izgled prijave i registracije: logo gore, bijela kartica na sredini, poveznica ispod kartice (footer)
function AuthLayout({ title, subtitle, footer, children }) {
    return (
        <div className="flex min-h-svh flex-col bg-paper">
            <header className="mx-auto flex h-[72px] w-full max-w-[1160px] items-center px-5">
                <Link to="/homepage" className="flex min-h-11 items-center gap-2.5">
                    <AppLogo />
                    <span className="whitespace-nowrap text-base font-bold tracking-[-0.01em]">{APP_NAME}</span>
                </Link>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pt-4 pb-16">
                <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-[20px] bg-white px-7 py-8 shadow-[0_1px_2px_rgba(23,23,23,0.05),0_12px_32px_rgba(23,23,23,0.06)]">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-[-0.03em]">{title}</h1>
                        <p className="text-[15px] leading-normal text-body">{subtitle}</p>
                    </div>
                    {children}
                </div>
                <p className="text-[15px] leading-normal text-body">{footer}</p>
            </main>
        </div>
    )
}

// polje forme u izgledu prijave; ref i register("...") prolaze kroz props do Inputa
export function AuthInput({ className = "", ...props }) {
    return (
        <Input
            className={`h-12 rounded-[10px] border-[#C9C9C6] bg-white px-3.5 text-base shadow-none md:text-base ${className}`}
            {...props}
        />
    )
}

// gumb s okom unutar polja za lozinku: prikaži ili sakrij upisanu lozinku
export function PasswordToggle({ shown, onToggle, label }) {
    const Icon = shown ? EyeOff : Eye
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={shown}
            onClick={onToggle}
            className="absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-lg text-body"
        >
            <Icon aria-hidden="true" className="size-5" />
        </button>
    )
}

// crvena poruka na vrhu forme, npr. greška s backenda
export function AuthError({ children }) {
    return (
        <p role="alert" className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-[1.4] font-semibold text-red-700">
            <CircleAlert aria-hidden="true" className="size-[18px] flex-none" strokeWidth={2.25} />
            {children}
        </p>
    )
}

// zelena poruka na vrhu forme, npr. nakon uspješne registracije
export function AuthNotice({ children }) {
    return (
        <p role="status" className="flex items-center gap-2 rounded-[10px] bg-habit/12 px-3 py-[11px] text-sm leading-[1.4] font-semibold text-habit">
            <CircleCheck aria-hidden="true" className="size-[18px] flex-none" strokeWidth={2.25} />
            {children}
        </p>
    )
}

export default AuthLayout
