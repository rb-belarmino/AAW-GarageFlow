"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GlobalSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function GlobalSearchBar({
  value,
  onChange,
  placeholder = "Search across fleet by VIN, Make, Model, or To Do defect notes...",
}: GlobalSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9 pr-4 bg-card shadow-sm text-sm"
      />
    </div>
  );
}
