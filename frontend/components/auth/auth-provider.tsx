"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

import {
  createUsername,
  normalizeEmail,
  validateSignup,
  type AccountRole,
  type AuthAccount,
  type AuthResult,
  type AuthSession
} from "@/lib/auth";
import { storageKeys } from "@/lib/storage-keys";
import { useLocalStorage } from "@/hooks/use-local-storage";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  adminCode?: string;
};

type AuthContextValue = {
  accounts: AuthAccount[];
  currentUser: AuthAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (input: SignupInput) => AuthResult;
  updateCurrentUser: (updates: Partial<Pick<AuthAccount, "name" | "username" | "avatarUrl">>) => AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [storedAccounts, setAccounts] = useLocalStorage<AuthAccount[]>(storageKeys.authAccounts, []);
  const [session, setSession] = useLocalStorage<AuthSession | null>(storageKeys.authSession, null);
  const accounts = useMemo(
    () =>
      storedAccounts.filter(
        (account) =>
          !["demo-user", "demo-admin"].includes(account.id) &&
          !["user@gadgetpulse.local", "admin@gadgetpulse.local"].includes(normalizeEmail(account.email))
      ),
    [storedAccounts]
  );
  const currentUser = session ? accounts.find((account) => account.id === session.accountId) ?? null : null;

  useEffect(() => {
    if (accounts.length !== storedAccounts.length) {
      setAccounts(accounts);
      if (session && !accounts.some((account) => account.id === session.accountId)) setSession(null);
    }
  }, [accounts, session, setAccounts, setSession, storedAccounts.length]);

  function login(email: string, password: string): AuthResult {
    const account = accounts.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(email) && item.password === password
    );

    if (!account) {
      return { ok: false, error: "Email or password is incorrect." };
    }

    setSession({ accountId: account.id, signedInAt: new Date().toISOString() });
    return { ok: true, account };
  }

  function signup(input: SignupInput): AuthResult {
    const error = validateSignup({ ...input, accounts });
    if (error) return { ok: false, error };

    const account: AuthAccount = {
      id: `account-${Date.now()}`,
      name: input.name.trim(),
      username: createUsername(input.name, input.email),
      email: normalizeEmail(input.email),
      password: input.password,
      role: input.role,
      createdAt: new Date().toISOString()
    };

    setAccounts((current) => [...current, account]);
    setSession({ accountId: account.id, signedInAt: new Date().toISOString() });
    return { ok: true, account };
  }

  function updateCurrentUser(updates: Partial<Pick<AuthAccount, "name" | "username" | "avatarUrl">>): AuthResult {
    if (!currentUser) return { ok: false, error: "Login before changing account settings." };

    const cleanUsername = updates.username?.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    const cleanName = updates.name?.trim();
    if (cleanName !== undefined && cleanName.length < 2) return { ok: false, error: "Display name must be at least 2 characters." };
    if (cleanUsername !== undefined && cleanUsername.length < 2) return { ok: false, error: "Username must be at least 2 characters." };
    if (
      cleanUsername &&
      accounts.some((account) => account.id !== currentUser.id && account.username.toLowerCase() === cleanUsername)
    ) {
      return { ok: false, error: "That username is already taken." };
    }

    const updatedAccount: AuthAccount = {
      ...currentUser,
      ...(cleanName !== undefined ? { name: cleanName } : {}),
      ...(cleanUsername !== undefined ? { username: cleanUsername } : {}),
      ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {})
    };

    setAccounts((current) => current.map((account) => (account.id === currentUser.id ? updatedAccount : account)));
    return { ok: true, account: updatedAccount };
  }

  function logout() {
    setSession(null);
  }

  const value: AuthContextValue = {
    accounts,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === "admin",
    login,
    signup,
    updateCurrentUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
