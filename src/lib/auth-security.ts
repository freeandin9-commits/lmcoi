import { z } from "zod";

// Strong password: 12+ chars, upper, lower, digit, special, no whitespace
export const strongPassword = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .refine((v) => !/\s/.test(v), "No spaces allowed")
  .refine((v) => /[a-z]/.test(v), "Must include a lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Must include an uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Must include a digit")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Must include a special character");

const COMMON = new Set([
  "password", "password1", "password123", "12345678", "123456789", "qwerty123",
  "letmein", "welcome1", "iloveyou", "admin123", "monkey123", "dragon123",
]);

export function passwordScore(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "Empty" };
  if (COMMON.has(pw.toLowerCase())) return { score: 0, label: "Too common" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;
  return { score: Math.min(s, 4) as 0 | 1 | 2 | 3 | 4, label: labels[Math.min(s, 4)] };
}

// Client-side attempt lockout (per email + action) — deters casual brute force
const LOCK_KEY = "lmc.authlock.v1";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 min

type LockMap = Record<string, { count: number; until: number }>;

function readMap(): LockMap {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeMap(m: LockMap) {
  try { localStorage.setItem(LOCK_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}
function keyOf(action: string, id: string) {
  return `${action}:${id.toLowerCase().trim()}`;
}

export function checkLock(action: string, id: string): { locked: boolean; remainingMs: number } {
  const m = readMap();
  const rec = m[keyOf(action, id)];
  if (!rec) return { locked: false, remainingMs: 0 };
  if (rec.until > Date.now()) return { locked: true, remainingMs: rec.until - Date.now() };
  return { locked: false, remainingMs: 0 };
}

export function recordFailure(action: string, id: string): { locked: boolean; attemptsLeft: number } {
  const m = readMap();
  const k = keyOf(action, id);
  const rec = m[k] ?? { count: 0, until: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.until = Date.now() + LOCK_MS;
    rec.count = 0;
  }
  m[k] = rec;
  writeMap(m);
  return { locked: rec.until > Date.now(), attemptsLeft: Math.max(0, MAX_ATTEMPTS - rec.count) };
}

export function clearFailures(action: string, id: string) {
  const m = readMap();
  delete m[keyOf(action, id)];
  writeMap(m);
}

export function formatRemaining(ms: number): string {
  const m = Math.ceil(ms / 60000);
  return m <= 1 ? "1 minute" : `${m} minutes`;
}

// Generic auth error text — never leak whether email exists / which field failed
export const GENERIC_LOGIN_ERROR = "Invalid email or password";
