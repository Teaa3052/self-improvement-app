import MobileHeader from "@/components/MobileHeader"

// Privremena stranica za dijelove aplikacije koje još nismo napravili (Habits, Diary...)
function ComingSoon({ title }) {
    return (
        <>
            <MobileHeader title={title} />
            <div className="p-4 md:p-10">
                <h1 className="text-2xl font-bold mb-2 hidden md:block">{title}</h1>
                <p className="text-muted-foreground">Coming soon.</p>
            </div>
        </>
    )
}

export default ComingSoon
