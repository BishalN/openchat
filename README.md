# OpenChat

OpenChat is an open-source platform for creating, training, and managing AI agents or chatbots using various data sources. It includes user authentication, subscription management via Stripe, and a type-safe API built with tRPC.

![OpenChat](https://OpenChatsbase.vercel.app/)

## Features

- **AI Agent Creation & Management:** Build and manage custom AI agents.
- **Multiple Data Sources:** Train agents using text, files, websites, Q&A pairs, and Notion.
- **Agent Training & Status Tracking:** Monitor agent training progress.
- **Stripe Integration:** Subscription management, payments via Stripe Checkout, and customer portal.
- **User Authentication:** Secure sign-up/login via Supabase Auth (Email/Password, Google OAuth).
- **Type-Safe API:** Robust client-server communication using tRPC.
- **Database:** Supabase Postgres with Drizzle ORM.
- **Modern UI:** Built with Next.js, Tailwind CSS, and Shadcn/UI.
- **State Management:** Zustand for global state.
- **Background Jobs:** Inngest for handling asynchronous tasks like agent training.
- **Embeddable Bot:** Functionality for embedding chatbots.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Postgres Database)
- **API**: [tRPC](https://trpc.io/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI/LLM**: [Vercel AI SDK](https://sdk.vercel.ai/), [Langfuse](https://langfuse.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)
