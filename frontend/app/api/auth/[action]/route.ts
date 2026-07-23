import {
  AccountError,
  authenticateAccount,
  clearSessionCookie,
  createAccount,
  createSession,
  createSessionCookie,
  deleteSession,
  getSessionAccount,
  listAccounts,
  requireSessionAccount,
  updateAccount
} from "@/db/accounts";
import type { AccountRole } from "@/lib/auth";

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { ...init, headers });
}

async function readJson(request: Request) {
  return (await request.json().catch(() => {
    throw new AccountError(400, "Request body must contain valid JSON.");
  })) as Record<string, unknown>;
}

function readRole(value: unknown): AccountRole {
  if (value !== "user" && value !== "admin") throw new AccountError(422, "Choose user or admin access.");
  return value;
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function errorResponse(error: unknown) {
  const status = error instanceof AccountError ? error.status : 500;
  const message = error instanceof AccountError ? error.message : "The account service encountered an unexpected error.";
  if (status === 500) console.error(error);
  return json({ error: { message } }, { status });
}

export async function GET(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (action !== "session") throw new AccountError(404, "Account route not found.");

    const account = await getSessionAccount(request);
    const accounts = account ? (account.role === "admin" ? await listAccounts() : [account]) : [];
    return json({ data: { account, accounts } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (action === "logout") {
      await deleteSession(request);
      return json(
        { data: { ok: true } },
        { headers: { "Set-Cookie": clearSessionCookie(request) } }
      );
    }

    const payload = await readJson(request);
    let account;
    if (action === "login") {
      account = await authenticateAccount({
        email: readText(payload.email),
        password: readText(payload.password),
        role: readRole(payload.role),
        adminCode: readText(payload.adminCode)
      });
    } else if (action === "signup") {
      account = await createAccount({
        name: readText(payload.name),
        email: readText(payload.email),
        password: readText(payload.password),
        confirmPassword: readText(payload.confirmPassword),
        role: readRole(payload.role),
        adminCode: readText(payload.adminCode)
      });
    } else {
      throw new AccountError(404, "Account route not found.");
    }

    const token = await createSession(account.id);
    const accounts = account.role === "admin" ? await listAccounts() : [account];
    return json(
      { data: { account, accounts } },
      { status: action === "signup" ? 201 : 200, headers: { "Set-Cookie": createSessionCookie(token, request) } }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (action !== "profile") throw new AccountError(404, "Account route not found.");
    const account = await requireSessionAccount(request);
    const payload = await readJson(request);
    const updated = await updateAccount(account.id, {
      ...(typeof payload.name === "string" ? { name: payload.name } : {}),
      ...(typeof payload.username === "string" ? { username: payload.username } : {}),
      ...(typeof payload.avatarUrl === "string" ? { avatarUrl: payload.avatarUrl } : {})
    });
    return json({ data: { account: updated } });
  } catch (error) {
    return errorResponse(error);
  }
}
