export type UserRole = "investor" | "ifa" | "ops";
export type SellOrderStatus = "Executed" | "Pending" | "Cancelled";

export interface Holding {
  bondName: string;
  isin: string;
  total: number;
  available: number;
  blocked: number;
  sold: number;
}

export interface DematAccount {
  id: string;
  accountType: "Primary" | "Secondary";
  dpName: string;
  accountNumber: string;
  holdings: Holding[];
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  accounts: DematAccount[];
}

export interface BasicInfo {
  fullName: string;
  dob: string;
  pan: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankInfo {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
}

export interface DematInfo {
  dpName: string;
  dpId: string;
  clientId: string;
  accountNumber: string;
  dpType: string;
}

export interface NomineeInfo {
  nomineeName: string;
  relationship: string;
  dob: string;
  percentage: number;
  address: string;
}

export interface InvestorProfile {
  investorId: string;
  basic: BasicInfo;
  bank: BankInfo;
  demat: DematInfo;
  nominee: NomineeInfo;
}

export interface SellOrder {
  orderId: string;
  dematAccountId: string;
  stockName: string;
  symbol: string;
  quantity: number;
  sellPrice: number;
  status: SellOrderStatus;
  orderDate: string;
}

export type SellRequestStatus =
  | "Sell Initiated"
  | "Auto Approved"
  | "Negotiation"
  | "Buyer Approved"
  | "Seller Approved"
  | "Payment Done"
  | "Processing"
  | "Settled"
  | "InProgress"
  | "Rejected"
  | "Terminated";

export interface SellRequest {
  requestId: string;
  bondName: string;
  orderId: string;
  units: number;
  yield: number;
  settlementDate: string;
  utr?: string;
  rfqNumber?: string;
  tradeNumber?: string;
  status: SellRequestStatus;
}

export interface NegotiationRound {
  round: number;
  party: "You" | "Buyer";
  date: string;
  yield: number;
  price: number;
  remark: string;
}

export interface NegotiationDetail {
  requestId: string;
  fullBondName: string;
  isin: string;
  purchaseYield?: number;
  settlementBank: string;
  rounds: NegotiationRound[];
}

export interface Transaction {
  id: string;
  type: "Buy" | "Sell";
  bondName: string;
  isin: string;
  units: number;
  price: number;
  yield?: number;
  date: string;
  utr?: string;
  bank?: string;
  dematAccountId?: string;
  status: SellRequestStatus | "Settled";
}

export interface BondOrder {
  orderId: string;
  isin: string;
  dematAccountId: string;
  purchasedDate: string;
  total: number;
  available: number;
  blocked: number;
  sold: number;
  price: number;
}

export interface IFA {
  id: string;
  name: string;
  email: string;
  phone: string;
  investorIds: string[];
}

export interface IFABasicInfo {
  fullName: string;
  dob: string;
  pan: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IFABankInfo {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
}

export interface IFADematInfo {
  dpName: string;
  dpId: string;
  clientId: string;
  accountNumber: string;
  dpType: string;
}

export interface IFAAgreementInfo {
  agreementNumber: string;
  agreementDate: string;
  status: string;
  renewalDate: string;
  commissionRate: string;
}

export interface IFAProfile {
  ifaId: string;
  basic: IFABasicInfo;
  bank: IFABankInfo;
  demat: IFADematInfo;
  agreement: IFAAgreementInfo;
}
