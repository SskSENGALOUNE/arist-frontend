"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { TopbarUserMenu } from "@/components/admin/topbar-user-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n";

function AdminHeaderTitle({ pathname }: { pathname: string }) {
  const t = useT();
  const seg = pathname.split("/").filter(Boolean)[1];
  const titles: Record<string, string> = {
    dashboard: t.dashboard.title,
    employees: t.employees.title,
    profile: t.profile.title,
    settings: t.siteSettings.heading,
  };
  return <h1 className="text-sm font-medium">{seg ? (titles[seg] ?? seg) : t.app.adminConsole}</h1>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.replace("/");
      return;
    }
    if (user.mustChangePassword) {
      router.replace("/force-password");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/employee/dashboard");
    }
  }, [hydrated, token, user, router]);

  if (!hydrated || !token || !user || user.mustChangePassword || user.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminHeaderTitle pathname={pathname} />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-muted-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
            </Button>
            <TopbarUserMenu />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
