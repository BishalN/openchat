"use server";

import { redirect } from "next/navigation";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getUserProfile,
} from "./stripe";
import { createClient } from "../supabase/server";
import { db } from "@/drizzle";
import { profilesTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get("priceId") as string;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  // get profile from supabase db
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, user?.user_metadata?.user_id));

  if (!user) {
    // Handle unauthenticated user, maybe redirect to login
    redirect("/sign-in?redirect=/pricing"); // Adjust redirect as needed
    return; // Stop execution
  }

  // Pass the user profile to createCheckoutSession
  await createCheckoutSession({ profile, priceId });
};

export const customerPortalAction = async () => {
  const profile = await getUserProfile();

  if (!profile) {
    // Handle unauthenticated user
    redirect("/sign-in?redirect=/dashboard"); // Adjust redirect as needed
    return; // Stop execution
  }

  // Pass the user profile to createCustomerPortalSession
  const portalSession = await createCustomerPortalSession(profile);
  redirect(portalSession.url);
};
