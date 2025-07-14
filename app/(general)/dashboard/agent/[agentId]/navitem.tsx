"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  href: string;
  label: string;
  badge?: {
    text: string;
    variant: "primary" | "secondary";
  };
  active?: boolean;
}

export function NavItem({ href, label, badge, active }: NavItemProps) {
  const pathname = usePathname();
  // for sources page there need not be actual match only
  const isActive = active ?? pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 px-4 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {label}
      {badge && (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-md",
            badge.variant === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-secondary/10 text-secondary"
          )}
        >
          {badge.text}
        </span>
      )}
    </Link>
  );
}
