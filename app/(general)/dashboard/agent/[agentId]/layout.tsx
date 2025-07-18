"use client";

import type React from "react";
import { NavItem } from "./navitem";
import { useParams, usePathname } from "next/navigation";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const agentId = params.agentId as string;
  const path = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Main navigation */}
      <div className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto">
            <NavItem
              href={`/dashboard/agent/${agentId}/playground`}
              label="Playground"
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/sources`}
              label="Sources"
              active={path.includes("/sources")}
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/connect`}
              label="Connect"
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/settings`}
              label="Settings"
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/actions`}
              label="Actions"
              active={path.includes("/actions")}
            />
            {/* TODO: Add to roadmap */}
            {/* 
            <NavItem
              href={`/dashboard/agent/${agentId}/contacts`}
              label="Contacts"
              badge={{ text: "New", variant: "primary" }}
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/activity`}
              label="Activity"
            />
            <NavItem
              href={`/dashboard/agent/${agentId}/analytics`}
              label="Analytics"
            /> */}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
