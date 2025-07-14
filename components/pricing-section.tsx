"use client";

import { BillingTabs } from "./billing-tabs";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Price {
  id: string;
  productId: string;
  unitAmount: number | null;
  currency: string;
  interval: "month" | "year" | undefined;
  trialPeriodDays: number | null | undefined;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId: string | undefined;
  features?: string[];
  url?: string;
  featured?: boolean;
}

interface PricingSectionProps {
  prices: Price[];
  products: Product[];
}

export function PricingSection({ prices, products }: PricingSectionProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );

  // Convert billing interval to match Stripe's format
  const stripeBillingInterval =
    billingInterval === "monthly" ? "month" : "year";

  const router = useRouter();

  const handleCheckout = async (priceId: string) => {
    if (!priceId) return;

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // You can add toast notification here
    } finally {
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <BillingTabs
        defaultValue={billingInterval}
        onValueChange={(value) =>
          setBillingInterval(value as "monthly" | "yearly")
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {products.map((product) => {
          const price = prices.find(
            (p) =>
              p.productId === product.id && p.interval === stripeBillingInterval
          );

          return (
            <Card
              key={product.id}
              className="flex flex-col p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {product.description}
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${price?.unitAmount ? price.unitAmount / 100 : 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{billingInterval}
                  </span>
                </div>

                <ul className="mt-6 space-y-4">
                  {product.features?.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-gray-900 dark:text-white" />
                      </div>
                      <p className="ml-3 text-gray-500 dark:text-gray-400">
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={product.featured ? "default" : "outline"}
                className="w-full"
                onClick={() => handleCheckout(price?.id || "")}
              >
                {product.featured ? "Get started" : "Choose plan"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
