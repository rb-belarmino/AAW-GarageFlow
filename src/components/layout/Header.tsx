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
  const isAuthenticated = !!session?.user;
  const isManager = session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN";
  const isLoginPage = pathname === "/login";

  const navItems = [
    { href: "/", label: "Fleet Dashboard", icon: LayoutDashboard },
    { href: "/work-orders", label: "Work Orders", icon: Wrench },
    { href: "/vehicles", label: "Vehicles Inventory", icon: Car },
    ...(isManager ? [{ href: "/users", label: "Staff & Users", icon: Users }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href={isAuthenticated ? "/" : "/login"}
          className="flex items-center gap-3 group transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                AAW GarageFlow
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                US Fleet
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Dealership Yard & Service Order Management
            </p>
          </div>
        </Link>

        {/* Navigation & User Menu */}
        {!isLoginPage && isAuthenticated && (
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Pill Navigation */}
            <nav className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/40">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-card text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <UserNav />
          </div>
        )}
      </div>
    </header>
  );
}
