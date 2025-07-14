import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { profilesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Create user profile for OAuth logins (like Google)
    if (data?.user) {
      try {
        await db
          .insert(profilesTable)
          .values({
            id: data.user.id,
            email: data.user.email || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            credits: 5, // Start with 5 credits
          })
          .onConflictDoUpdate({
            target: profilesTable.id,
            set: {
              email: data.user.email || "",
              updatedAt: new Date(),
            },
          });

        console.log("User profile created or updated successfully");
      } catch (error) {
        console.error("Error creating user profile:", error);
      }
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/dashboard`);
}
