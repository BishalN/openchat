import Link from "next/link";
import { Code } from "lucide-react";

interface FooterSectionProps {
  title: string;
  links: Array<{ href: string; label: string }>;
}

function FooterSection({ title, links }: FooterSectionProps) {
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

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "#", label: "Features" },
        { href: "#", label: "Pricing" },
        { href: "#", label: "Integrations" },
        { href: "#", label: "Enterprise" },
        { href: "#", label: "Changelog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", label: "Documentation" },
        { href: "#", label: "Tutorials" },
        { href: "#", label: "Blog" },
        { href: "#", label: "Community" },
        { href: "#", label: "GitHub" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white text-black rounded-md w-8 h-8 flex items-center justify-center">
                <Code className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-xl">ChatBuddy</span>
            </div>
            <p className="text-gray-400 mb-4">
              The open-source AI agent platform for everyone.
            </p>
          </div>
          {footerSections.map((section, index) => (
            <FooterSection
              key={index}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} ChatBuddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
