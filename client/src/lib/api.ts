import { apiRequest } from "./queryClient";
import { CreateInvoiceRequest, Invoice } from "@shared/schema";

export async function createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
  const res = await apiRequest("POST", "/api/invoices", data);
  return res.json();
}

export async function updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice> {
  const res = await apiRequest("PUT", `/api/invoices/${invoiceId}/status`, { status });
  return res.json();
}

export async function getInvoices(): Promise<Invoice[]> {
  const res = await apiRequest("GET", "/api/invoices");
  return res.json();
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  const res = await apiRequest("GET", `/api/invoices/${invoiceId}`);
  return res.json();
}
