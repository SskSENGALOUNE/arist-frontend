"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { EmployeeSidebar } from "@/components/employee/employee-sidebar";
import { TopbarUserMenu } from "@/components/admin/topbar-user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n";

function HeaderTitle({ pathname }: { pathname: string }) {
  const t = useT();
  const seg = pathname.split("/").filter(Boolean)[1];
  const titles: Record<string, string> = {
    dashboard: t.employeeDashboard.title,
    profile: t.profile.title,
  };
  return <h1 className="text-sm font-medium">{seg ? (titles[seg] ?? seg) : t.sidebar.portal}</h1>;
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
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
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, token, user, router]);

  if (!hydrated || !token || !user || user.mustChangePassword || user.role !== "EMPLOYEE") {
    return null;
  }

  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <HeaderTitle pathname={pathname} />
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <TopbarUserMenu />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
