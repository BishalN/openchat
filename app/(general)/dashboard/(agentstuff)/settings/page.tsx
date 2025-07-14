import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { NavItem } from "@/components/nav-item";
import { CreditCard, Package, SettingsIcon } from "lucide-react";
import { Price, PricingSection } from "@/components/pricing-section";

export const revalidate = 3600;

export default async function SettingsPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          {/* TODO: Add this to the roadmap */}
          {/* <NavItem
            icon={<SettingsIcon className="h-5 w-5" />}
            label="General"
            href="/dashboard/settings/general"
          /> */}
          <NavItem
            icon={<Package className="h-5 w-5" />}
            label="Plans"
            href="/dashboard/settings/plans"
            active
          />
          {/* TODO: Add this to the roadmap */}
          {/* <NavItem
            icon={<CreditCard className="h-5 w-5" />}
            label="Billing"
            href="/dashboard/settings/billing"
          /> */}
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <PricingSection prices={prices as Price[]} products={products} />
        </div>
      </div>
    </div>
  );
}
