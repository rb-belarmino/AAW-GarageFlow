"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Car, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/auth/UserNav";
import { useSession } from "next-auth/react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isManager = session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN";

  const navItems = [
    { href: "/", label: "Fleet Dashboard", icon: LayoutDashboard },
    { href: "/work-orders", label: "Work Orders", icon: Wrench },
    { href: "/vehicles", label: "Vehicles Inventory", icon: Car },
    ...(isManager ? [{ href: "/users", label: "Staff & Users", icon: Users }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">AAW GarageFlow</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">US Dealer Fleet</span>
            </div>
            <p className="text-xs text-muted-foreground">Dealership Yard & Service Order Management</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
