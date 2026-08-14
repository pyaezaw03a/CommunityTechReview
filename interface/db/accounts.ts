import { env } from "cloudflare:workers";

import { getDatabase } from "@/db/database";
import {
  adminAccessCode,
  createUsername,
  normalizeEmail,
  validateSignup,
  type AccountRole,
  type AuthAccount
} from "@/lib/auth";

const sessionCookieName = "gadgetpulse_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
const passwordIterations = 210_000;

type AccountRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role: AccountRole;
  avatar_url: string | null;
  created_at: string;
};

export class AccountError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function rowToAccount(row: AccountRow): AuthAccount {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role,
    ...(row.avatar_url ? { avatarUrl: row.avatar_url } : {}),
    createdAt: row.created_at
  };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number) {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations },
    material,
    256
  );
  return new Uint8Array(bits);
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, passwordIterations);
  return `pbkdf2$${passwordIterations}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = encoded.split("$");
  const iterations = Number(iterationsValue);
  if (algorithm !== "pbkdf2" || !Number.isInteger(iterations) || !saltValue || !hashValue) return false;

  const expected = base64ToBytes(hashValue);
  const actual = await derivePassword(password, base64ToBytes(saltValue), iterations);
  if (actual.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }
  return difference === 0;
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToBase64(new Uint8Array(digest));
}

function createToken() {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getAdminCode() {
  const runtimeEnv = env as unknown as { ADMIN_REVIEW_CODE?: string };
  return runtimeEnv.ADMIN_REVIEW_CODE?.trim() || adminAccessCode;
}

function cleanUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function createSessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function listAccounts() {
  const database = await getDatabase();
  const rows = await database
    .prepare("SELECT * FROM accounts ORDER BY created_at DESC")
    .all<AccountRow>();
  return rows.results.map(rowToAccount);
}

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  adminCode?: string;
}) {
  const error = validateSignup(input);
  if (error) throw new AccountError(422, error);
  if (input.role === "admin" && input.adminCode?.trim() !== getAdminCode()) {
    throw new AccountError(403, "Enter the valid admin access code.");
  }

  const database = await getDatabase();
  const email = normalizeEmail(input.email);
  const existing = await database
    .prepare("SELECT email FROM accounts WHERE email = ? AND role = ?")
    .bind(email, input.role)
    .first<{ email: string }>();
  if (existing) throw new AccountError(409, `A ${input.role} account with that email already exists.`);

  const baseUsername = createUsername(input.name, email);
  let username = baseUsername;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const match = await database
      .prepare("SELECT username FROM accounts WHERE username = ?")
      .bind(username)
      .first<{ username: string }>();
    if (!match) break;
    username = `${baseUsername.slice(0, 24)}-${suffix}`;
  }

  const row: AccountRow = {
    id: `account-${crypto.randomUUID()}`,
    name: input.name.trim(),
    username,
    email,
    password_hash: await hashPassword(input.password),
    role: input.role,
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  try {
    await database
      .prepare(`
        INSERT INTO accounts (
          id, name, username, email, password_hash, role, avatar_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        row.id,
        row.name,
        row.username,
        row.email,
        row.password_hash,
        row.role,
        row.avatar_url,
        row.created_at
      )
      .run();
  } catch (insertError) {
    if (String(insertError).toLowerCase().includes("unique")) {
      throw new AccountError(409, `That email or username is already registered for a ${input.role} account.`);
    }
    throw insertError;
  }

  return rowToAccount(row);
}

export async function authenticateAccount(input: {
  email: string;
  password: string;
  role: AccountRole;
  adminCode?: string;
}) {
  if (!input.email.trim() || !input.password) {
    throw new AccountError(422, "Enter your email and password.");
  }
  if (input.role === "admin" && input.adminCode?.trim() !== getAdminCode()) {
    throw new AccountError(403, "Enter the valid admin access code.");
  }

  const database = await getDatabase();
  const row = await database
    .prepare("SELECT * FROM accounts WHERE email = ? AND role = ?")
    .bind(normalizeEmail(input.email), input.role)
    .first<AccountRow>();

  if (!row || !(await verifyPassword(input.password, row.password_hash))) {
    throw new AccountError(401, "Email or password is incorrect.");
  }
  return rowToAccount(row);
}

export async function createSession(accountId: string) {
  const database = await getDatabase();
  const token = createToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionLifetimeSeconds * 1000);
  await database.batch([
    database.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now.toISOString()),
    database
      .prepare("INSERT INTO sessions (id, account_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
      .bind(await hashToken(token), accountId, now.toISOString(), expiresAt.toISOString())
  ]);
  return token;
}

export async function getSessionAccount(request: Request) {
  const token = readCookie(request, sessionCookieName);
  if (!token) return null;

  const database = await getDatabase();
  const sessionId = await hashToken(token);
  const row = await database
    .prepare(`
      SELECT accounts.*
      FROM sessions
      INNER JOIN accounts ON accounts.id = sessions.account_id
      WHERE sessions.id = ? AND sessions.expires_at > ?
    `)
    .bind(sessionId, new Date().toISOString())
    .first<AccountRow>();
  return row ? rowToAccount(row) : null;
}

export async function requireSessionAccount(request: Request, role?: AccountRole) {
  const account = await getSessionAccount(request);
  if (!account) throw new AccountError(401, "Sign in to continue.");
  if (role && account.role !== role) throw new AccountError(403, "An admin account is required.");
  return account;
}

export async function deleteSession(request: Request) {
  const token = readCookie(request, sessionCookieName);
  if (!token) return;
  const database = await getDatabase();
  await database.prepare("DELETE FROM sessions WHERE id = ?").bind(await hashToken(token)).run();
}

export async function updateAccount(
  accountId: string,
  updates: { name?: string; username?: string; avatarUrl?: string }
) {
  const database = await getDatabase();
  const current = await database
    .prepare("SELECT * FROM accounts WHERE id = ?")
    .bind(accountId)
    .first<AccountRow>();
  if (!current) throw new AccountError(404, "Account not found.");

  const name = updates.name === undefined ? current.name : updates.name.trim();
  const username = updates.username === undefined ? current.username : cleanUsername(updates.username);
  const avatarUrl = updates.avatarUrl === undefined ? current.avatar_url : updates.avatarUrl.trim() || null;

  if (name.length < 2 || name.length > 80) {
    throw new AccountError(422, "Display name must be between 2 and 80 characters.");
  }
  if (username.length < 2 || username.length > 28) {
    throw new AccountError(422, "Username must be between 2 and 28 characters.");
  }
  if (avatarUrl && (!avatarUrl.startsWith("data:image/") || avatarUrl.length > 950_000)) {
    throw new AccountError(422, "Profile pictures must be valid images smaller than 700KB.");
  }

  try {
    await database
      .prepare("UPDATE accounts SET name = ?, username = ?, avatar_url = ? WHERE id = ?")
      .bind(name, username, avatarUrl, accountId)
      .run();
  } catch (updateError) {
    if (String(updateError).toLowerCase().includes("unique")) {
      throw new AccountError(409, "That username is already taken.");
    }
    throw updateError;
  }

  return {
    ...rowToAccount(current),
    name,
    username,
    ...(avatarUrl ? { avatarUrl } : { avatarUrl: undefined })
  };
}
