import "server-only";
import nodemailer from "nodemailer";
import { SITE } from "./site";

// Email through the company mailbox. Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.

export function mailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Sends one email. Returns false (and logs why) when SMTP isn't configured; throws on send errors. */
export async function sendMail(mail: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.error(`[mail] pid ${process.pid}: email skipped: SMTP_HOST, SMTP_USER or SMTP_PASSWORD is not set`);
    return false;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    // Google shows App Passwords in groups of 4 ("abcd efgh …"); the spaces aren't part of it.
    auth: { user: SMTP_USER, pass: /gmail\.com$/i.test(SMTP_HOST) ? SMTP_PASSWORD.replace(/\s+/g, "") : SMTP_PASSWORD },
    // Fail within seconds (and get it logged) instead of hanging the request for minutes.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  await transport.sendMail({ from: `"${SITE.nameEn} - الموقع" <${SMTP_USER}>`, ...mail });
  return true;
}
