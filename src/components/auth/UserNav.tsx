"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User as UserIcon, Users, ShieldCheck, Wrench } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
      >
        <UserIcon className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";

  return (
    <div className="flex items-center gap-2 sm:gap-3 border-l pl-3 ml-2">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
          {isManager ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold leading-none text-foreground">
            {session.user.name || session.user.username}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {session.user.role} • @{session.user.username}
          </span>
        </div>
      </div>

      {isManager && (
        <Link
          href="/users"
          title="User Management"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Users className="h-4 w-4" />
        </Link>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign Out"
        className="inline-flex items-center gap-1 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors text-xs font-medium"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Sign Out</span>
      </button>
    </div>
  );
}
