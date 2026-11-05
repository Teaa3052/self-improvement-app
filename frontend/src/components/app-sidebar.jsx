import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/brand"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// stranice koje već rade; ostale (Habits, Diary...) dodajemo ovdje kad ih napravimo
const navItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Stats", url: "/stats" },
]

const itemClass = "h-10 rounded-lg px-3 font-medium text-neutral-700 data-active:bg-hairline data-active:font-semibold data-active:text-foreground"

export function AppSidebar({ ...props }) {
  const navigate = useNavigate()
  const { pathname } = useLocation() // trenutna adresa, da istaknemo aktivnu stavku
  const { setOpenMobile } = useSidebar()

  const { logout } = useAuth() // funckija za odjavu

  const handleLogout = async () => {
    await logout() // backend obriše cookie, a context zaboravi korisnika ( user = null )
    navigate("/login")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-3 pt-5 pb-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <span aria-hidden="true" className="size-6 flex-none rounded-[7px] bg-habit" />
          <span className="truncate text-[15px] font-bold">{APP_NAME}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className={itemClass}>
                    {/* na mobitelu je izbornik preko cijelog ekrana, pa ga klik na stavku zatvori */}
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className={itemClass}>
              Log out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
