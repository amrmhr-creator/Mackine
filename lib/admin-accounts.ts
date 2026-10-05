import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { writeJsonFile } from "./json-file";
import { dataDir } from "./data-dir";

// Admin accounts. For now there is one: the owner. Until he sets his own password, logging in
// uses ADMIN_PASSWORD from hPanel; once he sets one here, only the new password works (and
// ADMIN_PASSWORD is the way back in only if this file is lost). Passwords are stored as scrypt
// hashes in admins.json in the data folder, outside the app folder. More accounts (with fewer
// rights) can be added to the list later.

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const MIN_PASSWORD = 12;
const RESET_MINUTES = 30;
const RESET_EMAIL_GAP_MS = 5 * 60_000;

type Account = {
  id: string;
  role: "owner";
  passwordHash: string; // "scrypt$<salt hex>$<hash hex>"
  passwordChangedAt: string;
  reset?: { tokenHash: string; expires: number };
  lastResetEmailAt?: number;
};

type Store = { accounts: Account[] };

const storeFile = () => path.join(dataDir(), "admins.json");

async function readStore(): Promise<Store> {
  try {
    const data = JSON.parse(await readFile(storeFile(), "utf8")) as Partial<Store>;
    return { accounts: Array.isArray(data.accounts) ? data.accounts : [] };
  } catch {
    return { accounts: [] };
  }
}

async function writeStore(store: Store) {
  await writeJsonFile(storeFile(), store, { private: true });
}

export async function ownerAccount() {
  return (await readStore()).accounts.find((a) => a.role === "owner");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** A reason the new password can't be used, or null. */
export function passwordProblem(password: string, confirm: string) {
  if (password.length < MIN_PASSWORD) return `الباسورد لازم يبقى ${MIN_PASSWORD} حرف أو رقم على الأقل.`;
  if (password !== confirm) return "الباسورد والتأكيد مش زي بعض.";
  return null;
}

/** Sets the owner's password (creating the account the first time) and cancels any reset link. */
export async function setOwnerPassword(password: string) {
  const store = await readStore();
  let owner = store.accounts.find((a) => a.role === "owner");
  if (!owner) {
    owner = { id: "owner", role: "owner", passwordHash: "", passwordChangedAt: "" };
    store.accounts.push(owner);
  }
  owner.passwordHash = await hashPassword(password);
  owner.passwordChangedAt = new Date().toISOString();
  delete owner.reset;
  await writeStore(store);
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * A one-time reset token for the owner, valid for 30 minutes; only its hash is stored.
 * Returns null if one was sent less than 5 minutes ago (so the inbox can't be flooded).
 */
export async function createResetToken() {
  const store = await readStore();
  let owner = store.accounts.find((a) => a.role === "owner");
  if (owner?.lastResetEmailAt && Date.now() - owner.lastResetEmailAt < RESET_EMAIL_GAP_MS) return null;
  if (!owner) {
    // Still on ADMIN_PASSWORD: the account is created with no usable password until the reset.
    owner = { id: "owner", role: "owner", passwordHash: "", passwordChangedAt: "" };
    store.accounts.push(owner);
  }
  const token = randomBytes(32).toString("base64url");
  owner.reset = { tokenHash: tokenHash(token), expires: Date.now() + RESET_MINUTES * 60_000 };
  owner.lastResetEmailAt = Date.now();
  await writeStore(store);
  return token;
}

export async function resetTokenValid(token: string) {
  const reset = (await ownerAccount())?.reset;
  return !!reset && reset.expires > Date.now() && reset.tokenHash === tokenHash(token);
}

/** Uses the token to set a new password. Returns false if the token is wrong, used or expired. */
export async function resetPassword(token: string, password: string) {
  if (!(await resetTokenValid(token))) return false;
  await setOwnerPassword(password);
  return true;
}

export const RESET_LINK_MINUTES = RESET_MINUTES;
