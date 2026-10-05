import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ownerAccount, verifyPassword } from "./admin-accounts";
import { jsonStore } from "./json-file";

// Admin panel login. The password is the one the owner set in the panel (lib/admin-accounts.ts),
// or ADMIN_PASSWORD from hPanel until he sets one; with neither, the panel stays locked.
// The session is a signed cookie; changing the password logs everyone out.

const COOKIE = "admin_session";
const SESSION_DAYS = 7;

const envPassword = () => process.env.ADMIN_PASSWORD ?? "";

/** The owner's own password hash, once he has set one in the panel. */
async function ownHash() {
  return (await ownerAccount())?.passwordHash || null;
}

export async function adminEnabled() {
  return !!(await ownHash()) || envPassword().length >= 8;
}

/** Sessions are signed with a key tied to the current password, so changing it logs everyone out. */
async function signingKey() {
  const secret = (await ownHash()) ?? envPassword();
  return createHash("sha256").update(`admin-session:${secret}`).digest();
}

async function sign(expires: number) {
  return createHmac("sha256", await signingKey()).update(String(expires)).digest("base64url");
}

/** Whether `password` is the current admin password. */
export async function checkPassword(password: string) {
  const hash = await ownHash();
  if (hash) return verifyPassword(password, hash);
  return envPassword().length >= 8 && safeEqual(password, envPassword());
}

function safeEqual(a: string, b: string) {
  // Hash both sides so the comparison takes the same time whatever the lengths.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function isAdmin() {
  if (!(await adminEnabled())) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires < Date.now() || !sig) return false;
  return safeEqual(sig, await sign(expires));
}

/** For admin pages and actions: sends anyone not logged in to the login page. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

// Brake on password guessing: 5 wrong tries per IP per 15 minutes, and 30 in total from
// everyone (so faked or missing IPs can't get around it). Wrong tries are kept in a file in
// the data folder so all of Hostinger's app processes share one count.
const FAIL_LIMIT = 5;
const FAIL_LIMIT_ALL = 30;
const FAIL_WINDOW_MS = 15 * 60_000;
const failures = jsonStore<{ ip: string; at: number }[]>("login-failures.json", () => []);

async function recentFailures() {
  const since = Date.now() - FAIL_WINDOW_MS;
  const all = await failures.read();
  return Array.isArray(all) ? all.filter((f) => f.at > since) : [];
}

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip")?.trim() || "unknown").slice(0, 64);
}

/** Checks the password and starts a session. Returns an error message, or null on success. */
export async function logIn(password: string): Promise<string | null> {
  if (!(await adminEnabled())) return "لوحة التحكم مقفولة: لازم ADMIN_PASSWORD يتحط في hPanel الأول.";
  const ip = await clientIp();
  const recent = await recentFailures();
  if (recent.filter((f) => f.ip === ip).length >= FAIL_LIMIT || recent.length >= FAIL_LIMIT_ALL) {
    return "محاولات كتير غلط. استنى ربع ساعة وجرّب تاني.";
  }

  if (!(await checkPassword(password))) {
    await failures.write([...recent, { ip, at: Date.now() }]).catch(() => {});
    console.warn(`[admin] pid ${process.pid}: wrong password from ${ip}`);
    return "الباسورد غلط.";
  }
  await failures.write(recent.filter((f) => f.ip !== ip)).catch(() => {});
  await startSession();
  return null;
}

/** Logs this browser in (after a correct password, a password change, or a reset). */
export async function startSession() {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  (await cookies()).set(COOKIE, `${expires}.${await sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function logOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
