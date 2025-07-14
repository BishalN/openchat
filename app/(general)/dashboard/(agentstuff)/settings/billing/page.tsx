"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CreditCard, Users, Package, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-1">
          <NavItem
            icon={<SettingsIcon className="h-5 w-5" />}
            label="General"
            href="/dashboard/settings/general"
          />
          <NavItem
            icon={<Package className="h-5 w-5" />}
            label="Plans"
            href="/dashboard/settings/plans"
            active
          />
          <NavItem
            icon={<CreditCard className="h-5 w-5" />}
            label="Billing"
            href="/dashboard/settings/billing"
          />
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Billing Details Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Billing details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization name</label>
                <Input placeholder="Enter organization name" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country or region</label>
                <Select defaultValue="us">
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address line 1</label>
                <Input placeholder="Enter address" />
              </div>

              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </div>
          </div>

          {/* Billing Email Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Billing email</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Email used for invoices.
            </p>

            <div className="space-y-4">
              <Input defaultValue="neupanebishal07@gmail.com" />

              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </div>
          </div>

          {/* Tax ID Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Tax ID</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If you want your upcoming invoices to display a specific tax ID,
              please enter it here.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax type</label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="vat">VAT</SelectItem>
                    <SelectItem value="gst">GST</SelectItem>
                    <SelectItem value="ein">EIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ID</label>
                <Input placeholder="N/A" disabled />
              </div>

              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </div>
          </div>

          {/* Billing Method Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Billing method</h2>

            <div className="border-b pb-2 mb-2">
              <div className="grid grid-cols-3 text-sm font-medium">
                <div>Brand</div>
                <div>Number (Last 4)</div>
                <div>Exp. Date</div>
              </div>
            </div>

            <div className="py-8 text-center text-muted-foreground">
              No results.
            </div>

            <div className="flex justify-end mt-4">
              <Button>Add</Button>
            </div>
          </div>

          {/* Billing History Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Billing history</h2>

            <div className="border-b pb-2 mb-2">
              <div className="grid grid-cols-4 text-sm font-medium">
                <div>Invoice Number</div>
                <div>Created</div>
                <div>Amount</div>
                <div>Status</div>
              </div>
            </div>

            <div className="py-8 text-center text-muted-foreground">
              No results.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavItem({ icon, label, href, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      {label}
    </a>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
  current: boolean;
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  popular,
  current,
}: PricingCardProps) {
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
      <div className="p-6 bg-card">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{price}</span>
            {period && (
              <span className="text-muted-foreground text-sm mb-1">
                {period}
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">{description}</p>
        <Button variant={buttonVariant} className="w-full mb-6">
          {buttonText}
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
