"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole, UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AccountRole } from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();
  const [error, setError] = useState("");
  const [role, setRole] = useState<AccountRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === "login";
  const redirect = searchParams.get("redirect");

  function completeAuth(accountRole: AccountRole) {
    const target = redirect?.startsWith("/") ? redirect : accountRole === "admin" ? "/admin" : "/account";
    window.location.assign(target);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await (isLogin
      ? login({ email, password, role, adminCode })
      : signup({ name, email, password, confirmPassword, role, adminCode }));

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    completeAuth(result.account.role);
  }

  return (
    <div className="grid gap-5 border border-ink bg-white p-5 shadow-hard-sm sm:p-6">
      <div>
        <Badge variant={isLogin ? "olive" : "signal"}>{isLogin ? "Welcome back" : "Create account"}</Badge>
        <h1 className="mt-4 text-4xl font-black uppercase leading-none text-ink sm:text-5xl">
          {isLogin ? "Login To GadgetPulse" : "Join GadgetPulse"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isLogin
            ? "Choose user or admin access, then sign in with the matching account."
            : "Create your account to publish real ownership reviews."}
        </p>
      </div>

      {error ? (
        <div className="border border-signal bg-paper p-3 text-sm font-semibold text-signal" role="alert">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {!isLogin ? (
          <Field label="Display name" htmlFor="name">
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </Field>

        {!isLogin ? (
          <Field label="Confirm password" htmlFor="confirm-password">
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Field>
        ) : null}

        <Field label={isLogin ? "Login type" : "Account type"} htmlFor="role">
          <Select
            id="role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as AccountRole);
              setAdminCode("");
              setError("");
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>

        {role === "admin" ? (
          <Field label="Admin access code" htmlFor="admin-code">
            <Input
              id="admin-code"
              type="password"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              autoComplete="off"
              required
            />
            <p className="text-xs font-semibold text-muted">
              Required for both admin login and admin account creation.
            </p>
          </Field>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting}>
          {isLogin ? <LockKeyhole className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {submitting ? "Please wait..." : isLogin ? `Login As ${role === "admin" ? "Admin" : "User"}` : "Sign Up"}
        </Button>
      </form>

      <div className="border-t border-line pt-4 text-sm text-muted">
        {isLogin ? (
          <p>
            New to GadgetPulse?{" "}
            <Link href="/signup" className="font-black text-signal hover:underline">
              Create an account
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-black text-signal hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
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
