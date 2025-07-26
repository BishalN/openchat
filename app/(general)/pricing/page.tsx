import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { Price, PricingSection } from "@/components/pricing-section";
import { Header } from "@/components/header-layout";
import { Footer } from "@/components/footer-layout";
import { CTASection } from "@/components/cta-section";

export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Transparent pricing for everyone
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Choose the plan that works for you, whether you're just starting out
            or building at scale. All plans include access to our open-source
            codebase.
          </p>

          <div className="space-y-6">
            <PricingSection prices={prices as Price[]} products={products} />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about ChatBuddy pricing and plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FaqItem
              question="What are message credits?"
              answer="Message credits are used when your AI agent responds to user queries. One message credit is consumed per AI response. This helps keep our pricing predictable and transparent."
            />
            <FaqItem
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, changes will take effect at the end of your current billing cycle."
            />
            <FaqItem
              question="What happens if I exceed my message credits?"
              answer="If you exceed your monthly message credits, you can continue using the service at a pay-as-you-go rate of $0.01 per message. You can also set usage limits in your dashboard to prevent unexpected charges."
            />
            <FaqItem
              question="Is there a difference between self-hosting and cloud hosting?"
              answer="Yes. Self-hosting gives you complete control over your deployment but requires you to manage your own infrastructure. Cloud hosting is managed by us, providing a hassle-free experience with automatic updates and scaling."
            />
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
        {question}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{answer}</p>
    </div>
  );
}
