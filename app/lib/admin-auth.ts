import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "datacom@gmail.com";
const ADMIN_PASSWORD = "datacom123";
const SESSION_COOKIE = "datacom_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type AdminSession = {
  email: string;
  expiresAt: number;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be configured with at least 32 characters.");
  }
  return "datacom-local-admin-session-change-before-production";
}

function secureEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function createSessionToken(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token: string): AdminSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !secureEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (session.email !== ADMIN_EMAIL || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function adminCredentialsMatch(email: string, password: string) {
  return secureEqual(email.trim().toLowerCase(), ADMIN_EMAIL) && secureEqual(password, ADMIN_PASSWORD);
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  cookieStore.set(SESSION_COOKIE, createSessionToken({ email: ADMIN_EMAIL, expiresAt }), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}
