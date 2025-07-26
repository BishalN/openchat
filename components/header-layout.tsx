import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white rounded-md w-8 h-8 flex items-center justify-center">
            <Code className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl">ChatBuddy</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Documentation
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Community
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
