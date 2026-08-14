"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { AccountRole, AuthAccount, AuthResult } from "@/lib/auth";
import { storageKeys } from "@/lib/storage-keys";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  adminCode?: string;
};

type LoginInput = {
  email: string;
  password: string;
  role: AccountRole;
  adminCode?: string;
};

type AuthContextValue = {
  accounts: AuthAccount[];
  currentUser: AuthAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthResult>;
  signup: (input: SignupInput) => Promise<AuthResult>;
  updateCurrentUser: (
    updates: Partial<Pick<AuthAccount, "name" | "username" | "avatarUrl">>
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

type SessionPayload = {
  data: {
    account: AuthAccount | null;
    accounts: AuthAccount[];
  };
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload = payload as { error?: { message?: string } } | null;
    throw new Error(errorPayload?.error?.message || "The account service could not complete this request.");
  }
  return payload as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((payload: SessionPayload) => {
    setCurrentUser(payload.data.account);
    setAccounts(payload.data.accounts);
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    applySession(await parseResponse<SessionPayload>(response));
  }, [applySession]);

  useEffect(() => {
    // These keys held the previous browser-only user/admin records. The D1-backed
    // account service is authoritative now, so remove every legacy account/session.
    window.localStorage.removeItem(storageKeys.authAccounts);
    window.localStorage.removeItem(storageKeys.authSession);

    void refreshSession()
      .catch(() => {
        setCurrentUser(null);
        setAccounts([]);
      })
      .finally(() => setIsLoading(false));
  }, [refreshSession]);

  async function authenticate(action: "login" | "signup", input: LoginInput | SignupInput): Promise<AuthResult> {
    try {
      const response = await fetch(`/api/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = await parseResponse<SessionPayload>(response);
      applySession(payload);
      return payload.data.account
        ? { ok: true, account: payload.data.account }
        : { ok: false, error: "The account session could not be created." };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  function login(input: LoginInput) {
    return authenticate("login", input);
  }

  function signup(input: SignupInput) {
    return authenticate("signup", input);
  }

  async function updateCurrentUser(
    updates: Partial<Pick<AuthAccount, "name" | "username" | "avatarUrl">>
  ): Promise<AuthResult> {
    if (!currentUser) return { ok: false, error: "Login before changing account settings." };

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const payload = await parseResponse<{ data: { account: AuthAccount } }>(response);
      const updated = payload.data.account;
      setCurrentUser(updated);
      setAccounts((current) => current.map((account) => (account.id === updated.id ? updated : account)));
      return { ok: true, account: updated };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setCurrentUser(null);
    setAccounts([]);
  }

  const value: AuthContextValue = {
    accounts,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === "admin",
    isLoading,
    login,
    signup,
    updateCurrentUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
