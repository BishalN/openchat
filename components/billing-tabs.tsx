"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BillingTabsProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function BillingTabs({
  defaultValue = "monthly",
  onValueChange,
}: BillingTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className="w-full"
    >
      <TabsList className="grid w-[400px] grid-cols-2 mx-auto mb-8 bg-gray-100 dark:bg-gray-800">
        <TabsTrigger
          value="monthly"
          className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-black dark:data-[state=active]:text-white"
        >
          Monthly billing
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-black dark:data-[state=active]:text-white"
        >
          Yearly billing
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
