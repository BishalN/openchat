import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Github,
  Star,
  Code,
  Users,
  Zap,
  Lock,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Logo } from "@/components/logo";
import { getGitHubRepoInfo } from "@/lib/github";

// Navigation links data
const navLinks = [
  // { href: "/#features", label: "Features" },
  // TODO: add this to roadmap
  // { href: "/docs", label: "Documentation" },
  // { href: "/pricing", label: "Pricing" },
];

// Common link styles
const linkStyles =
  "text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white";

// Feature cards data
const features = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Own Your Data",
    description:
      "Your data stays yours. No vendor lock-in, no hidden data mining. Deploy on your infrastructure or use our cloud offering.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Powerful Integrations",
    description:
      "Connect to any LLM provider, vector database, or knowledge source. Use OpenAI, Anthropic, or open-source models like Llama.",
  },
  {
    icon: <Users className="h-6 w-6 text-gray-600" />,
    title: "Community-Driven",
    description:
      "Benefit from a thriving community of developers. Share agents, plugins, and improvements with others.",
  },
  {
    icon: <Code className="h-6 w-6 text-gray-600" />,
    title: "Fully Customizable",
    description:
      "Modify any aspect of your agents. Custom UI, specialized behaviors, unique integrations - it's all possible.",
  },
  {
    icon: <Globe className="h-6 w-6 text-gray-600" />,
    title: "Deploy Anywhere",
    description:
      "Run on your laptop, your server, or our cloud. OpenChat works everywhere, from development to production.",
  },
];

// Footer links data
// const footerSections = [
// {
//   title: "Product",
//   links: [
//     { href: "#", label: "Features" },
//     { href: "#", label: "Pricing" },
//   ],
// },
// {
//   title: "Resources",
//   links: [
//     { href: "#", label: "Documentation" },
//     { href: "#", label: "Tutorials" },
//     { href: "#", label: "Blog" },
//     { href: "#", label: "Community" },
//     { href: "#", label: "GitHub" },
//   ],
// },
// ];

export default async function LandingPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  // Fetch GitHub repository info
  const repoInfo = await getGitHubRepoInfo("bishaln", "openchat").catch(
    () => null
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl">OpenChat</span>
          </div>
          {/* <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkStyles}>
                {link.label}
              </Link>
            ))}
          </nav> */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link
              href="https://github.com/bishaln/openchat"
              className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              <Github className="h-5 w-5" />
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/sign-in"> Sign in </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/30 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* <div className="inline-flex items-center gap-2 bg-black/5 px-3 py-1 rounded-full text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  Open Source Alternative to Chatbase
                </span>
              </div> */}
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                An Open Source Alternative to Chatbase
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Like Chatbase, but 100% free and open source. Train custom AI
                chatbots with your docs, PDFs, and websites. Deploy anywhere,
                keep full control of your data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/create-agent">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create your chatbot <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com/bishaln/openchat">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Github className="mr-2 h-4 w-4" /> View on GitHub
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="h-4 w-4 text-green-500" />
                <span>Free & Open Source</span>
                <span className="mx-2">•</span>
                <Check className="h-4 w-4 text-green-500" />
                <span>Deploy Anywhere</span>
                <span className="mx-2">•</span>
                <Check className="h-4 w-4 text-green-500" />
                <span>Your Data, Your Rules</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 to-gray-300/20 dark:from-gray-700/30 dark:to-gray-600/30 rounded-lg transform rotate-3"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border dark:border-gray-700">
                <div className="bg-black text-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      O
                    </div>
                    <span className="font-medium">OpenChat Agent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 h-[400px] flex flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                      <p>
                        👋 Hi there! I'm your OpenChat assistant. How can I help
                        you today?
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                      <p>
                        I can answer questions about your data, help with tasks,
                        or just chat!
                      </p>
                    </div>
                    <div className="bg-gray-800 text-white rounded-lg p-3 max-w-[80%] ml-auto">
                      <p>
                        What makes OpenChat different from other AI platforms?
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                      <p>
                        Great question! OpenChat is 100% open-source, which
                        means:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>You own your data - no vendor lock-in</li>
                        <li>Self-hostable - deploy anywhere</li>
                        <li>Transparent - see exactly how it works</li>
                        <li>Customizable - modify it to fit your needs</li>
                        <li>Community-driven - benefit from contributions</li>
                      </ul>
                      <p className="mt-2">
                        Plus, we offer cloud hosting with generous free tiers if
                        you don't want to self-host!
                      </p>
                    </div>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask something..."
                      className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose OpenChat?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Build powerful AI agents without compromising on ownership,
              privacy, or flexibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Github className="h-6 w-6" />
                  <h3 className="text-xl font-bold">bishaln/openchat</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {repoInfo?.description ||
                    "An open-source platform for building, deploying, and sharing AI agents with your data."}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-gray-400 fill-gray-400" />
                    <span className="font-medium">
                      {repoInfo?.stargazers_count?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-600"
                    >
                      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                      <path d="M3 9h18v6a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-6z"></path>
                      <path d="M3 9l2.45 -4.9a2 2 0 0 1 1.93 -1.1h9.24a2 2 0 0 1 1.93 -1.1l2.45 4.9"></path>
                    </svg>
                    <span className="font-medium">
                      {repoInfo?.forks_count?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-600"
                    >
                      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M12 7m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                      <path d="M12 17m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                    </svg>
                    <span className="font-medium">MIT License</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">
                    TypeScript
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">
                    React
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">
                    Next.js
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">
                    AI
                  </div>
                </div>
                <Link href="https://github.com/bishaln/openchat">
                  <Button className="w-full">View on GitHub</Button>
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Open Source at Heart</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                OpenChat is built in the open, for the community, by the
                community. We believe AI should be accessible to everyone, not
                locked behind proprietary walls.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">MIT Licensed</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Free to use, modify, and distribute, even for commercial
                      purposes.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Active Community</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Join thousands of developers building and improving
                      OpenChat together.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Transparent Development</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      All code, issues, and roadmaps are public. Your voice
                      matters in shaping the future.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to build your AI agent?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start building powerful, customizable AI agents today - no credit
            card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/create-agent">
              <Button
                size="lg"
                variant="default"
                className="bg-white text-gray-800"
              >
                Get started for free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-black border-white hover:bg-white/10"
              >
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo />
                <span className="font-bold text-white text-xl">OpenChat</span>
              </div>
              <p className="text-gray-400 mb-4">
                The open-source AI agent platform for everyone.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Link>
              </div>
            </div>
            {/* {footerSections.map((section, index) => (
              <FooterSection
                key={index}
                title={section.title}
                links={section.links}
              />
            ))} */}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} OpenChat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="font-bold text-white mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-gray-400 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
