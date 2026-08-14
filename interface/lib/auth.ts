export type AccountRole = "user" | "admin";

export type AuthAccount = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  avatarUrl?: string;
  createdAt: string;
};

export type AuthResult =
  | {
      ok: true;
      account: AuthAccount;
    }
  | {
      ok: false;
      error: string;
    };

export const adminAccessCode = "PULSE-ADMIN";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createUsername(name: string, email: string) {
  const fallback = normalizeEmail(email).split("@")[0] || "member";
  return (name || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || fallback;
}

export function validateSignup(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  adminCode?: string;
}): string | null {
  if (input.name.trim().length < 2) return "Enter a display name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.email))) return "Enter a valid email address.";
  if (input.password.length < 8) return "Use at least 8 characters for the password.";
  if (input.password !== input.confirmPassword) return "Passwords do not match.";
  return null;
}
