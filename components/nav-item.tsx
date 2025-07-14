"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

export function NavItem({ icon, label, href, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      {label}
    </a>
  );
}
