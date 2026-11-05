import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

// Zajednički izgled svih zaštićenih stranica: sidebar lijevo, sadržaj stranice desno.
// <Outlet /> je mjesto gdje React Router ubaci trenutnu stranicu (Dashboard, Stats...)
// Razmak oko sadržaja i gornju traku na mobitelu (MobileHeader) daje svaka stranica sama,
// jer Dashboard na mobitelu ima drugačiji izgled.
function AppLayout() {
    return (
        <SidebarProvider style={{ "--sidebar-width": "220px" }}>
            <AppSidebar />
            <SidebarInset className="min-w-0">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AppLayout
