"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, ShieldCheck, UserRound } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/search-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/compare", label: "Comparisons" },
  { href: "/community", label: "Community" },
  { href: "/submit-review", label: "Write a Review" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { currentUser, isAdmin, logout } = useAuth();
  const links = isAdmin ? [...navLinks, { href: "/admin", label: "Admin" }] : navLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring inline-flex min-w-0 items-center gap-3" aria-label="GadgetPulse home">
          <Image
            src="/gadgetpulse-logo.png"
            alt="GadgetPulse logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-sm object-contain"
          />
          <span className="grid min-w-0 leading-none">
            <span className="truncate text-sm font-black uppercase text-ink">GadgetPulse</span>
            <span className="truncate text-[10px] font-semibold uppercase text-muted">Real Feedback</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("focus-ring px-3 py-2 text-xs font-bold uppercase transition-colors hover:text-signal", pathname === link.href ? "text-signal" : "text-muted")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <SearchModal />
          {currentUser ? (
            <>
              <Button asChild size="sm" variant={isAdmin ? "olive" : "outline"}>
                <Link href="/account">
                  {currentUser.avatarUrl ? (
                    <span
                      className="h-5 w-5 border border-ink bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentUser.avatarUrl})` }}
                      aria-hidden="true"
                    />
                  ) : isAdmin ? (
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  )}
                  {currentUser.name}
                </Link>
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={logout} aria-label="Logout">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <SearchModal />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu" className="border-ink bg-white text-ink">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="left-auto right-0 top-0 h-full w-[min(90vw,390px)] max-w-none translate-x-0 translate-y-0 border-y-0 border-r-0 border-ink bg-paper p-0">
              <DialogHeader className="pr-14">
                <DialogTitle>GadgetPulse</DialogTitle>
                <DialogDescription>Real Feedback. Better Tech Choices.</DialogDescription>
              </DialogHeader>
              <nav className="grid" aria-label="Mobile navigation">
                {links.map((link) => (
                  <DialogClose asChild key={link.href}>
                    <Link href={link.href} className="focus-ring border-b border-ink px-5 py-4 text-sm font-black uppercase text-ink">
                      {link.label}
                    </Link>
                  </DialogClose>
                ))}
              </nav>
              <div className="grid gap-3 p-5">
                {currentUser ? (
                  <>
                    <DialogClose asChild>
                      <Button asChild variant={isAdmin ? "olive" : "outline"} className="w-full">
                        <Link href="/account">{currentUser.name}</Link>
                      </Button>
                    </DialogClose>
                    <Button type="button" variant="outline" className="w-full" onClick={logout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </DialogClose>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
