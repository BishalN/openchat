import Stripe from "stripe";
import { redirect } from "next/navigation";
import { SelectProfile, profilesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { createClient } from "../supabase/server";

export interface StripePrice {
  id: string;
  productId: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year";
  trialPeriodDays?: number | null;
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  defaultPriceId?: string;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

async function getProfileByStripeCustomerId(
  customerId: string
): Promise<SelectProfile | null> {
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.stripeCustomerId, customerId))
    .limit(1);
  return profile || null;
}

async function updateProfileSubscription(
  profileId: string,
  subscriptionData: Partial<SelectProfile> & { credits?: number }
) {
  await db
    .update(profilesTable)
    .set({ ...subscriptionData, updatedAt: new Date() })
    .where(eq(profilesTable.id, profileId));
}

export async function createCheckoutSession({
  profile,
  priceId,
}: {
  profile: SelectProfile | null;
  priceId: string;
}) {
  if (!profile) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    customer: profile.stripeCustomerId || undefined,
    client_reference_id: profile.id,
    allow_promotion_codes: true,
  });

  return session;
}

export async function createCustomerPortalSession(profile: SelectProfile) {
  if (!profile.stripeCustomerId) {
    console.error(
      "User does not have a Stripe Customer ID. Redirecting to pricing."
    );
    redirect("/pricing");
  }

  let configurationId: string | undefined;
  const configurations = await stripe.billingPortal.configurations.list({
    limit: 1,
    active: true,
  });
  if (configurations.data.length > 0) {
    configurationId = configurations.data[0].id;
  } else {
    console.warn(
      "No active Stripe Billing Portal configuration found. Creating a default one."
    );
    const newConfig = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ["email", "tax_id"],
        },
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
      },
    });
    configurationId = newConfig.id;
  }

  return stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    configuration: configurationId,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const profile = await getProfileByStripeCustomerId(customerId);

  if (!profile) {
    console.error("Profile not found for Stripe customer:", customerId);
    return;
  }

  const plan = subscription.items.data[0]?.price;
  const product = plan?.product;

  const productId = typeof product === "string" ? product : product?.id;
  const productName =
    typeof product === "string" ? null : (product as Stripe.Product)?.name;

  // Fetch product details to get metadata if product is just an ID
  const productDetails =
    typeof product === "string"
      ? await stripe.products.retrieve(product)
      : (product as Stripe.Product);

  console.log(productDetails);

  // Get credits from product metadata, default to 0 if not set
  const creditsToAllocate = parseInt(
    productDetails?.metadata?.credits || "0",
    10
  );

  if (status === "active" || status === "trialing") {
    await updateProfileSubscription(profile.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId,
      planName: productName,
      subscriptionStatus: status,
      credits: creditsToAllocate,
    });
  } else {
    await updateProfileSubscription(profile.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status,
      credits: 0,
    });
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}

export const getUserProfile = async () => {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, user?.user_metadata?.user_id))
    .limit(1);

  return profile;
};
