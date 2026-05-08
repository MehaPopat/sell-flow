import { BOND_ORDERS, DEMAT_ACCOUNTS, IFA_PROFILES, IFAS, INVESTOR_PROFILES, INVESTORS, NEGOTIATION_DETAILS, SELL_ORDERS, SELL_QUOTES, SELL_REQUESTS, TRANSACTIONS } from "@/data/mockData";
import type { BondOrder, DematAccount, Holding, IFA, IFAProfile, Investor, InvestorProfile, NegotiationDetail, SellOrder, SellQuote, SellRequest, Transaction } from "@/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchDematAccounts(): Promise<DematAccount[]> {
  await delay(160);
  return DEMAT_ACCOUNTS;
}

export async function fetchHoldingsForAccount(accountId: string): Promise<Holding[]> {
  await delay(160);
  return DEMAT_ACCOUNTS.find((account) => account.id === accountId)?.holdings ?? [];
}

export async function fetchSellOrders(): Promise<SellOrder[]> {
  await delay(160);
  return SELL_ORDERS;
}

export async function fetchInvestors(): Promise<Investor[]> {
  await delay(160);
  return INVESTORS;
}

export async function fetchInvestorById(id: string): Promise<Investor | undefined> {
  await delay(160);
  return INVESTORS.find((inv) => inv.id === id);
}

export async function fetchDematAccountsForInvestor(investorId: string): Promise<DematAccount[]> {
  await delay(160);
  return INVESTORS.find((inv) => inv.id === investorId)?.accounts ?? [];
}

export async function fetchInvestorProfile(investorId: string): Promise<InvestorProfile | undefined> {
  await delay(160);
  return INVESTOR_PROFILES.find((p) => p.investorId === investorId);
}

export async function fetchIFAs(): Promise<IFA[]> {
  await delay(160);
  return IFAS;
}

export async function fetchIFAById(id: string): Promise<IFA | undefined> {
  await delay(160);
  return IFAS.find((ifa) => ifa.id === id);
}

export async function fetchIFAProfile(ifaId: string): Promise<IFAProfile | undefined> {
  await delay(160);
  return IFA_PROFILES.find((p) => p.ifaId === ifaId);
}

export async function fetchInvestorsForIFA(ifaId: string): Promise<Investor[]> {
  await delay(160);
  const ifa = IFAS.find((f) => f.id === ifaId);
  if (!ifa) return [];
  return INVESTORS.filter((inv) => ifa.investorIds.includes(inv.id));
}

export async function fetchBondOrders(isin: string, accountId: string): Promise<BondOrder[]> {
  await delay(160);
  return BOND_ORDERS.filter((o) => o.isin === isin && o.dematAccountId === accountId);
}

export async function fetchSellQuotes(): Promise<SellQuote[]> {
  await delay(160);
  return SELL_QUOTES;
}

export async function fetchSellRequests(): Promise<SellRequest[]> {
  await delay(160);
  return SELL_REQUESTS;
}

export async function fetchNegotiationDetail(requestId: string): Promise<NegotiationDetail | undefined> {
  await delay(160);
  return NEGOTIATION_DETAILS.find((d) => d.requestId === requestId);
}

export async function fetchTransactions(): Promise<Transaction[]> {
  await delay(160);
  return TRANSACTIONS;
}

export interface OpsEmailPayload {
  isin: string;
  isinName?: string;
  isinValue?: string;
  units: number;
  desiredYield: number;
  bankName?: string;
  investorName?: string;
  investorPhone?: string;
}

export async function sendOpsEmail(payload: OpsEmailPayload): Promise<void> {
  await delay(800);
  console.log("[mock] OPS email sent", payload);
}
