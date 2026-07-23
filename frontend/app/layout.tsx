import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ReviewsProvider } from "@/components/reviews-provider";
import { SiteChrome } from "@/components/site-chrome";

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
            <SiteChrome>{children}</SiteChrome>
          </ReviewsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
