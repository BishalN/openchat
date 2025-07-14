"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSafeActionClient } from "next-safe-action";
import { profilesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";

// Create a new client for next-safe-action
const actionClient = createSafeActionClient();

// Helper function to create or update user profile
const upsertUserProfile = async (userId: string, email: string) => {
  try {
    await db
      .insert(profilesTable)
      .values({
        id: userId,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profilesTable.id,
        set: {
          email,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Error upserting user profile:", error);
    return { success: false, error };
  }
};

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect(data.url);
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
