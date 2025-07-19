"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: use a nav item component; reuse here from somewhere else
  const pathname = usePathname();

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex">
            <Link
              href="/dashboard/agents"
              className={cn(
                "border-b-2 px-4 py-4 text-sm font-medium",
                pathname === "/dashboard/agents"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Agents
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
