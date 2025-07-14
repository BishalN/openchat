import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TabButtonProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const TabButton = ({ icon, label, active, onClick }: TabButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      <div className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      {label}
    </button>
  );
};
