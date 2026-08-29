"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, Users, AlertCircle, ShieldAlert } from "lucide-react";
import { UserListTable, UserItem } from "@/components/users/UserListTable";
import { CreateUserModal } from "@/components/users/CreateUserModal";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/users");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access forbidden. Only Managers and Administrators can view user accounts.");
        }
        throw new Error("Failed to load user list");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
        Checking permissions...
      </div>
    );
  }

  const isManager = session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN";

  if (!isManager) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You are signed in as <span className="font-mono font-semibold">@{session?.user?.username}</span> with role <span className="font-semibold">{session?.user?.role}</span>. Only Managers can manage shop users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff & User Management</h1>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Manager Access
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create, view, and manage technician and shop staff access accounts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <UserListTable users={users} loading={loading} />

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
}
