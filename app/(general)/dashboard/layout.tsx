import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { UserDropdown } from "@/components/user-dropdown";

import NextLink from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Logo } from "@/components/logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return <div>Error fetching user data</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <NextLink href="/">
              <Logo />
            </NextLink>
            <h1 className="font-medium">
              Welcome {data.user.user_metadata.full_name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />

            <UserDropdown
              userData={{
                avatarUrl: data?.user?.user_metadata.avatar_url || null,
                email: data?.user?.email || null,
                fullName: data?.user?.user_metadata.full_name || null,
                id: data?.user?.id,
              }}
              userInitials={`${data?.user?.user_metadata.full_name
                ?.split(" ")
                // @ts-ignore
                .map((name) => name[0])
                .join("") || "U"
                }`}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
