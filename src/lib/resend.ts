import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email from address - use your own domain later
export const EMAIL_FROM = process.env.EMAIL_FROM || "Thrift Store <onboarding@resend.dev>";
