import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to build your AI agent?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Start building powerful, customizable AI agents today - no credit card
          required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/create-agent">
            <Button
              size="lg"
              variant="default"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Get started for free
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              View pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
