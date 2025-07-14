"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PricingCardProps {
  title: string;
  price: number;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
  current: boolean;
  priceId?: string;
  onUpgrade?: (priceId: string) => void;
  yearlyDiscount?: string;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  popular,
  current,
  priceId,
  onUpgrade,
  yearlyDiscount,
}: PricingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!priceId) return;

    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "border dark:border-gray-700 rounded-lg overflow-hidden",
        popular ? "ring-2 ring-primary" : "",
        current ? "border-primary border-2" : ""
      )}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Popular
        </div>
      )}
      {current && (
        <div className="bg-primary/10 text-primary text-center py-1 text-sm font-medium">
          Current Plan
        </div>
      )}
      {yearlyDiscount && (
        <div className="bg-green-100 text-green-800 text-center py-1 text-sm font-medium">
          {yearlyDiscount}
        </div>
      )}
      <div className="p-6 bg-card">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">${price / 100}</span>
            {period && (
              <span className="text-muted-foreground text-sm mb-1">
                {period}
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">{description}</p>
        <Button
          variant={buttonVariant}
          className="w-full mb-6"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : buttonText}
        </Button>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
