import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ReviewsProvider } from "@/components/reviews-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "GadgetPulse - Real Feedback. Better Tech Choices.",
    template: "%s | GadgetPulse"
  },
  description:
    "A premium community website for honest reviews, ratings, comparisons, and real ownership feedback about tech gadgets."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ReviewsProvider>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </ReviewsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
