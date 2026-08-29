"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User as UserIcon, Users, ShieldCheck, Wrench, ChevronDown } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
      >
        <UserIcon className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-border/80 bg-background/50 py-1 pl-1.5 pr-3 text-left transition-all hover:bg-accent/50 hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isManager ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <Wrench className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground leading-tight">
            {session.user.name || session.user.username}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono leading-tight">
            {session.user.role}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card p-1.5 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border/60 mb-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {session.user.name || session.user.username}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              @{session.user.username} • {session.user.role}
            </p>
          </div>

          {isManager && (
            <Link
              href="/users"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Staff & User Management</span>
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
