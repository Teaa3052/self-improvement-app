import { Link } from "react-router-dom"
import { Archive, Calendar, SquareCheck } from "lucide-react"
import AppLogo from "@/components/AppLogo"
import HomeDemo from "@/components/HomeDemo"
import { APP_NAME } from "@/lib/brand"

const FEATURES = [
    {
        icon: Calendar,
        title: "Daily, weekly or monthly",
        text: "Not everything belongs on every day. Call your family once a week, review your budget once a month.",
    },
    {
        icon: SquareCheck,
        title: "One tap to check off",
        text: "Today's square sits right next to each habit, so checking in takes a second. Forgot yesterday? Fill it in later.",
    },
    {
        icon: Archive,
        title: "Retire what's automatic",
        text: "When a habit runs on its own, archive it. It leaves your list, and its history is kept.",
    },
]

// gumb i poveznica za prijavu: isti par stoji u gornjem dijelu i na dnu stranice
function CallToAction({ className = "" }) {
    return (
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 pt-2 ${className}`}>
            <Link
                to="/register"
                className="inline-flex h-[52px] items-center justify-center rounded-xl bg-primary px-[26px] text-base font-semibold text-white"
            >
                Create account
            </Link>
            <p className="text-[15px] leading-normal text-body">
                Already have one? <Link to="/login" className="font-semibold text-foreground underline underline-offset-[3px]">Log in</Link>
            </p>
        </div>
    )
}

// Početna stranica za posjetitelje. @container omogućuje veličine u cqi (posto širine stranice):
// clamp(najmanje, željeno, najviše) pa se naslovi i razmaci sami prilagode od mobitela do računala.
function HomePage() {
    return (
        <div className="@container bg-background">
            <header className="mx-auto flex h-[72px] max-w-[1160px] items-center justify-between gap-3 px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <AppLogo />
                    <span className="truncate text-base font-bold tracking-[-0.01em]">{APP_NAME}</span>
                </div>
                <nav aria-label="Account" className="flex flex-none items-center gap-1">
                    <Link to="/login" className="inline-flex h-11 items-center rounded-[10px] px-3.5 text-[15px] font-semibold">Log in</Link>
                    <Link to="/register" className="inline-flex h-10 items-center whitespace-nowrap rounded-[10px] bg-primary px-4 text-[15px] font-semibold text-white">Sign up</Link>
                </nav>
            </header>

            <section className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-[clamp(40px,5cqi,64px)] px-5 pt-[clamp(32px,5cqi,72px)] pb-[clamp(56px,7cqi,96px)]">
                <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
                    <h1 className="text-[length:clamp(42px,5.8cqi,72px)] leading-[1.02] font-extrabold tracking-[-0.04em]">
                        <span className="block">Your habits,</span>
                        <span className="block text-habit">at a glance.</span>
                    </h1>
                    <p className="max-w-[30em] text-[length:clamp(17px,1.5cqi,19px)] leading-[1.55] text-pretty text-body">
                        Track daily, weekly and monthly habits in one simple grid. One tap checks off today. Your streaks and 30-day stats keep score for you.
                    </p>
                    <CallToAction />
                </div>
                <div className="flex min-w-0 flex-[1_1_380px] flex-col items-center gap-3.5 rounded-[28px] bg-[#EEF3F0] p-[clamp(16px,3.4cqi,40px)]">
                    <HomeDemo />
                    <p className="text-[13px] text-[#4F5B54]">Go on, tap a square.</p>
                </div>
            </section>

            <section className="bg-paper">
                <div className="mx-auto flex max-w-[1160px] flex-col gap-[clamp(32px,4cqi,48px)] px-5 py-[clamp(56px,7cqi,96px)]">
                    <h2 className="max-w-[18em] text-[length:clamp(28px,3.4cqi,40px)] leading-[1.12] font-bold tracking-[-0.03em] text-balance">
                        Simple enough to use every day.
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-8 gap-y-9">
                        {FEATURES.map(feature => (
                            <div key={feature.title} className="flex flex-col gap-3">
                                <div aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl border border-[#E5E5E3] bg-white text-habit">
                                    <feature.icon className="size-[22px]" strokeWidth={2} />
                                </div>
                                <h3 className="mt-1 text-lg leading-[1.3] font-bold tracking-[-0.01em]">{feature.title}</h3>
                                <p className="text-[15px] leading-[1.6] text-body">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto flex max-w-[1160px] flex-col items-center gap-5 px-5 py-[clamp(64px,8cqi,112px)] text-center">
                <h2 className="text-[length:clamp(32px,4.2cqi,52px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
                    Start with one habit.
                </h2>
                <p className="max-w-[26em] text-[17px] leading-[1.55] text-pretty text-body">
                    Pick something small you want to do more often. Add more once it sticks.
                </p>
                <CallToAction className="justify-center" />
            </section>

            <footer className="border-t border-[#EBEBE9]">
                <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-5 py-6">
                    <div className="flex items-center gap-2">
                        <AppLogo className="size-5 rounded-md" iconClassName="size-3" />
                        <span className="text-sm font-semibold">{APP_NAME}</span>
                    </div>
                    <p className="text-sm text-[#636363]">© 2026 · Made by Tea</p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
