import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TRPCProvider } from "@/trpc/client";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "AI Agents for everyone",
  description: "Open source alternative to ChatBase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col gap-20 items-center">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
              <Toaster />
            </main>
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
