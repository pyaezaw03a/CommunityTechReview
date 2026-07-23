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
  const isLogin = mode === "login";
  const redirect = searchParams.get("redirect");

  function completeAuth(accountRole: AccountRole) {
    const target = redirect?.startsWith("/") ? redirect : accountRole === "admin" ? "/admin" : "/account";
    window.location.assign(target);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = isLogin
      ? login(email, password)
      : signup({
          name,
          email,
          password,
          confirmPassword,
          role,
          adminCode
        });

    if (!result.ok) {
      setError(result.error);
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
            ? "Sign in with an account you created."
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
          <>
            <Field label="Confirm password" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Account type" htmlFor="role">
              <Select id="role" value={role} onChange={(event) => setRole(event.target.value as AccountRole)}>
                <option value="user">User account</option>
                <option value="admin">Admin account</option>
              </Select>
            </Field>
            {role === "admin" ? (
              <Field label="Admin access code" htmlFor="admin-code">
                <Input
                  id="admin-code"
                  value={adminCode}
                  onChange={(event) => setAdminCode(event.target.value)}
                />
                <p className="text-xs font-semibold text-muted">An administrator must provide this code.</p>
              </Field>
            ) : null}
          </>
        ) : null}

        <Button type="submit" size="lg">
          {isLogin ? <LockKeyhole className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {isLogin ? "Login" : "Sign Up"}
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
