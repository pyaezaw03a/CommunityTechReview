"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ImagePlus, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";

export function SessionCard() {
  const { currentUser, isAdmin, logout, updateCurrentUser } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setAvatarUrl(currentUser.avatarUrl ?? "");
    }
  }, [currentUser]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for your profile picture.");
      return;
    }
    if (file.size > 700_000) {
      setError("Use an image smaller than 700KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result));
      setError("");
      setStatus("Profile picture ready. Save settings to apply it.");
    };
    reader.readAsDataURL(file);
  }

  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    const result = updateCurrentUser({ name, username, avatarUrl });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus("Settings saved. Your username will be used on new reviews.");
  }

  if (!currentUser) {
    return (
      <div className="border border-ink bg-white p-5">
        <h2 className="text-2xl font-black uppercase text-ink">Not Signed In</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Login or create an account to manage your GadgetPulse profile.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-ink bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden border border-ink bg-paper">
            {currentUser.avatarUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${currentUser.avatarUrl})` }}
                role="img"
                aria-label={`${currentUser.name} profile`}
              />
            ) : isAdmin ? (
              <ShieldCheck className="h-6 w-6 text-signal" aria-hidden="true" />
            ) : (
              <span className="text-lg font-black text-signal">{getInitials(currentUser.name || currentUser.username)}</span>
            )}
          </span>
          <div>
            <Badge variant={isAdmin ? "signal" : "olive"}>{currentUser.role}</Badge>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none text-ink">{currentUser.name}</h2>
            <p className="mt-1 text-sm font-semibold text-muted">{currentUser.email}</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <AccountMetric label="Username" value={`@${currentUser.username}`} />
        <AccountMetric label="Role" value={currentUser.role} />
        <AccountMetric label="Joined" value={new Date(currentUser.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} />
      </div>
      {isAdmin ? (
        <Button asChild className="mt-5">
          <Link href="/admin">Open Admin Dashboard</Link>
        </Button>
      ) : null}

      <form onSubmit={handleSettingsSubmit} className="mt-6 grid gap-5 border-t border-ink pt-5">
        <div>
          <h3 className="text-2xl font-black uppercase text-ink">Profile Settings</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Username is locked everywhere else. Change it here when you want a different review identity.
          </p>
        </div>

        {error ? (
          <div className="border border-signal bg-paper p-3 text-sm font-semibold text-signal" role="alert">
            {error}
          </div>
        ) : null}
        {status ? (
          <div className="border border-olive bg-paper p-3 text-sm font-semibold text-olive" role="status">
            {status}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display name" htmlFor="account-name">
            <Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Username" htmlFor="account-username">
            <Input id="account-username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
          <div className="flex h-36 w-36 items-center justify-center overflow-hidden border border-ink bg-paper">
            {avatarUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl})` }}
                role="img"
                aria-label="Profile preview"
              />
            ) : (
              <ImagePlus className="h-8 w-8 text-signal" aria-hidden="true" />
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-picture">Profile picture</Label>
            <Input id="profile-picture" type="file" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-xs font-semibold text-muted">
              Stored locally in this browser. Use a small square image for best results.
            </p>
            {avatarUrl ? (
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => setAvatarUrl("")}>
                Remove Picture
              </Button>
            ) : null}
          </div>
        </div>

        <Button type="submit" className="justify-self-start">
          Save Settings
        </Button>
      </form>
    </div>
  );
}

function AccountMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-paper p-3">
      <p className="text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
