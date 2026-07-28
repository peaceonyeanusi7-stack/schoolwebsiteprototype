import { createHmac, timingSafeEqual } from "crypto";
import type { Database } from "@/integrations/supabase/types";

const PAYSTACK_BASE = "https://api.paystack.co";

export interface PaystackConfig {
  secretKey: string;
  baseUrl: string;
  publicKey: string | null;
}

export function getPaystackConfig(): PaystackConfig {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key is not configured");
  return {
    secretKey,
    baseUrl: PAYSTACK_BASE,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? null,
  };
}

export function isLiveMode(secretKey: string): boolean {
  return secretKey.startsWith("sk_live_");
}

export async function paystackApiFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<{ data: T | null; error: { message: string; status?: number } | null }> {
  const { secretKey, baseUrl } = getPaystackConfig();
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = (await res.json().catch(() => ({}))) as { status: boolean; message?: string; data?: T };
  if (!res.ok || !json.status) {
    return {
      data: null,
      error: {
        message: json.message || `Paystack API error (${res.status})`,
        status: res.status,
      },
    };
  }
  return { data: (json.data ?? null) as T, error: null };
}

export interface PaystackInitPayload {
  email: string;
  amount: number; // kobo
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export function initializePaystackTransaction(payload: PaystackInitPayload) {
  return paystackApiFetch<PaystackInitResponse>("/transaction/initialize", {
    method: "POST",
    body: {
      email: payload.email,
      amount: payload.amount,
      reference: payload.reference,
      callback_url: payload.callback_url,
      metadata: payload.metadata,
      channels: payload.channels ?? ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    },
  });
}

export interface PaystackVerifyResponse {
  id: number;
  status: string;
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  log: unknown;
  fees: number | null;
  fees_split: unknown;
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: Record<string, unknown> | null;
    risk_action: string;
  };
  authorization: Record<string, unknown>;
  plan: string | null;
  metadata: Record<string, unknown> | null;
  paidAt: string | null;
  createdAt: string;
  transaction_date: string;
}

export function verifyPaystackTransaction(reference: string) {
  return paystackApiFetch<PaystackVerifyResponse>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export interface PaystackCustomerPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface PaystackCustomerResponse {
  customer_code: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export function createPaystackCustomer(payload: PaystackCustomerPayload) {
  return paystackApiFetch<PaystackCustomerResponse>("/customer", {
    method: "POST",
    body: payload,
  });
}

export interface PaystackPlanPayload {
  name: string;
  amount: number; // kobo
  interval: "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually";
  description?: string;
}

export interface PaystackPlanResponse {
  plan_code: string;
  name: string;
  amount: number;
  interval: string;
}

export function createPaystackPlan(payload: PaystackPlanPayload) {
  return paystackApiFetch<PaystackPlanResponse>("/plan", {
    method: "POST",
    body: payload,
  });
}

export interface PaystackWebhookEvent {
  event: string;
  data: Record<string, unknown> & {
    reference?: string;
    status?: string;
    amount?: number;
    metadata?: Record<string, unknown> | null;
  };
}

export function verifyPaystackSignature(payload: string, signature: string, secretKey: string): boolean {
  const expected = createHmac("sha512", secretKey).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function generatePaystackReference(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(koboToNaira(kobo));
}

export type PaymentType = Database["public"]["Enums"]["payment_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type FeeCategory = Database["public"]["Enums"]["fee_category"];
