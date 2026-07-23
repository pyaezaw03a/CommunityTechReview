"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ExternalLink,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  type LucideIcon
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
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

const adminLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/accounts", label: "Accounts", icon: UsersRound },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/moderation", label: "Moderation", icon: MessageSquareText }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.assign("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden h-screen flex-col border-r border-ink bg-ink text-white lg:sticky lg:top-0 lg:flex">
        <AdminSidebarContent currentUser={currentUser} onLogout={() => void handleLogout()} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink bg-paper/95 px-4 backdrop-blur sm:px-6 lg:hidden">
          <Link href="/admin" className="focus-ring inline-flex items-center gap-3" aria-label="GadgetPulse admin home">
            <span className="grid h-9 w-9 place-items-center bg-signal text-xs font-black text-white">GP</span>
            <span className="grid leading-none">
              <span className="text-sm font-black uppercase text-ink">Admin Panel</span>
              <span className="mt-1 text-[9px] font-bold uppercase text-muted">GadgetPulse</span>
            </span>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" size="icon" variant="outline" aria-label="Open admin sidebar">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="left-0 top-0 h-full w-[min(88vw,340px)] max-w-none translate-x-0 translate-y-0 border-y-0 border-l-0 border-white/15 bg-ink text-white shadow-none">
              <DialogHeader className="border-white/15 pr-14">
                <DialogTitle className="text-white">GadgetPulse Admin</DialogTitle>
                <DialogDescription className="text-white/55">Manage community activity from one workspace.</DialogDescription>
              </DialogHeader>
              <div className="flex min-h-0 flex-1 flex-col">
                <AdminNavigation mobile />
                <AdminAccountActions currentUser={currentUser} onLogout={() => void handleLogout()} mobile />
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main className="min-h-screen p-4 sm:p-6 lg:p-10 xl:p-12">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebarContent({
  currentUser,
  onLogout
}: {
  currentUser: ReturnType<typeof useAuth>["currentUser"];
  onLogout: () => void;
}) {
  return (
    <>
      <div className="border-b border-white/15 p-6">
        <Link href="/admin" className="focus-ring inline-flex items-center gap-3" aria-label="GadgetPulse admin home">
          <span className="grid h-11 w-11 place-items-center bg-signal text-sm font-black text-white">GP</span>
          <span className="grid leading-none">
            <span className="text-base font-black uppercase text-white">GadgetPulse</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Admin Panel</span>
          </span>
        </Link>
      </div>

      <AdminNavigation />
      <AdminAccountActions currentUser={currentUser} onLogout={onLogout} />
    </>
  );
}

function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2 p-4" aria-label="Admin navigation">
      <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Workspace</p>
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
        const link = (
          <Link
            href={href}
            className={`focus-ring flex items-center gap-3 border px-3 py-3 text-xs font-black uppercase transition-colors ${
              isActive
                ? "border-signal bg-signal text-white"
                : "border-transparent text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );

        return mobile ? (
          <DialogClose asChild key={href}>
            {link}
          </DialogClose>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
    </nav>
  );
}

function AdminAccountActions({
  currentUser,
  onLogout,
  mobile = false
}: {
  currentUser: ReturnType<typeof useAuth>["currentUser"];
  onLogout: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="mt-auto border-t border-white/15 p-4">
      {currentUser ? (
        <div className="mb-4 border border-white/15 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-peach" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase text-white">{currentUser.name}</p>
              <p className="mt-1 truncate text-[10px] text-white/45">{currentUser.email}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        {currentUser ? (
          <button
            type="button"
            onClick={onLogout}
            className="focus-ring flex items-center gap-3 border border-white/20 px-3 py-3 text-left text-xs font-black uppercase text-white/65 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <Link
            href="/login?redirect=/admin"
            className="focus-ring flex items-center gap-3 border border-white/20 px-3 py-3 text-xs font-black uppercase text-white/65 hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Admin login
          </Link>
        )}

        {mobile ? (
          <DialogClose asChild>
            <Link
              href="/"
              className="focus-ring flex items-center gap-3 border border-transparent px-3 py-3 text-xs font-black uppercase text-white/50 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View public site
            </Link>
          </DialogClose>
        ) : (
          <Link
            href="/"
            className="focus-ring flex items-center gap-3 border border-transparent px-3 py-3 text-xs font-black uppercase text-white/50 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View public site
          </Link>
        )}
      </div>
    </div>
  );
}
