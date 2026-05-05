import type { BondOrder, DematAccount, IFA, IFAProfile, Investor, InvestorProfile, NegotiationDetail, SellOrder, SellRequest, Transaction } from "@/types";

export const DEMAT_ACCOUNTS: DematAccount[] = [
  {
    id: "acc1",
    accountType: "Primary",
    dpName: "HDFC Securities",
    accountNumber: "1234567887654321",
    holdings: [
      { bondName: "Reliance Industries Ltd 8.95% 2027", isin: "INE002A07RY8", total: 80, available: 15, blocked: 45, sold: 20 },
      { bondName: "HDFC Bank Ltd 7.95% 2028", isin: "INE040A08120", total: 100, available: 65, blocked: 35, sold: 0 },
    ],
  },
  {
    id: "acc2",
    accountType: "Secondary",
    dpName: "ICICI Direct",
    accountNumber: "2345678998765432",
    holdings: [
      { bondName: "ICICI Bank 8.40% 2026", isin: "INE090A08UJ3", total: 30, available: 0, blocked: 0, sold: 30 },
      { bondName: "Bajaj Finance 9.10% 2029", isin: "INE152A08101", total: 75, available: 75, blocked: 0, sold: 0 },
    ],
  },
  {
    id: "acc3",
    accountType: "Secondary",
    dpName: "Zerodha",
    accountNumber: "3456789009876543",
    holdings: [
      { bondName: "Power Finance Corp 8.65% 2026", isin: "INE134E08KT0", total: 25, available: 25, blocked: 0, sold: 0 },
      { bondName: "NTPC Ltd 7.25% 2027", isin: "INE733E07JK2", total: 40, available: 10, blocked: 20, sold: 10 },
    ],
  },
  {
    id: "acc4",
    accountType: "Primary",
    dpName: "Liquibonds Securities",
    accountNumber: "2234567887655621",
    holdings: [
      { bondName: "Tata Steel Ltd 9.20% 2028", isin: "INE081A08173", total: 50, available: 50, blocked: 0, sold: 0 },
      { bondName: "L&T Finance Ltd 8.75% 2027", isin: "INE476A08035", total: 40, available: 20, blocked: 20, sold: 0 },
    ],
  },
];

export const INVESTORS: Investor[] = [
  {
    id: "inv1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "9876543210",
    accounts: [DEMAT_ACCOUNTS[0], DEMAT_ACCOUNTS[1], DEMAT_ACCOUNTS[2]],
  },
  {
    id: "inv2",
    name: "Priya Mehta",
    email: "priya.mehta@email.com",
    phone: "9123456789",
    accounts: [DEMAT_ACCOUNTS[2]],
  },
  {
    id: "inv3",
    name: "Amit Verma",
    email: "amit.verma@email.com",
    phone: "9988776655",
    accounts: [DEMAT_ACCOUNTS[0]],
  },
  {
    id: "inv4",
    name: "Sneha Joshi",
    email: "sneha.joshi@email.com",
    phone: "9871234567",
    accounts: [],
  },
  {
    id: "inv5",
    name: "Karan Patel",
    email: "karan.patel@email.com",
    phone: "9345678901",
    accounts: [DEMAT_ACCOUNTS[1]],
  },
];

export const INVESTOR_PROFILES: InvestorProfile[] = [
  {
    investorId: "inv1",
    basic: { fullName: "Rahul Sharma", dob: "1985-06-15", pan: "ABCPS1234D", gender: "Male", address: "12, MG Road", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    bank: { bankName: "HDFC Bank", branchName: "Andheri West", accountNumber: "50100123456789", ifscCode: "HDFC0001234", accountType: "Savings" },
    demat: { dpName: "HDFC Securities", dpId: "12345678", clientId: "87654321", accountNumber: "1234567887654321", dpType: "NSDL" },
    nominee: { nomineeName: "Sunita Sharma", relationship: "Spouse", dob: "1987-09-22", percentage: 100, address: "12, MG Road, Mumbai" },
  },
  {
    investorId: "inv2",
    basic: { fullName: "Priya Mehta", dob: "1990-03-28", pan: "BCDPM5678E", gender: "Female", address: "45, Park Street", city: "Pune", state: "Maharashtra", pincode: "411001" },
    bank: { bankName: "ICICI Bank", branchName: "Koregaon Park", accountNumber: "123456789012", ifscCode: "ICIC0001567", accountType: "Savings" },
    demat: { dpName: "ICICI Direct", dpId: "23456789", clientId: "98765432", accountNumber: "2345678998765432", dpType: "CDSL" },
    nominee: { nomineeName: "Ravi Mehta", relationship: "Father", dob: "1960-01-10", percentage: 100, address: "45, Park Street, Pune" },
  },
  {
    investorId: "inv3",
    basic: { fullName: "Amit Verma", dob: "1978-11-05", pan: "CDEFV9012F", gender: "Male", address: "78, Sector 21", city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
    bank: { bankName: "SBI", branchName: "Sector 18 Noida", accountNumber: "34567890123456", ifscCode: "SBIN0050432", accountType: "Savings" },
    demat: { dpName: "Zerodha", dpId: "34567890", clientId: "09876543", accountNumber: "3456789009876543", dpType: "NSDL" },
    nominee: { nomineeName: "Kavita Verma", relationship: "Spouse", dob: "1980-07-18", percentage: 100, address: "78, Sector 21, Noida" },
  },
  {
    investorId: "inv4",
    basic: { fullName: "Sneha Joshi", dob: "1995-08-12", pan: "DEFGJ3456G", gender: "Female", address: "22, Lake View", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
    bank: { bankName: "Axis Bank", branchName: "Indiranagar", accountNumber: "919876543210", ifscCode: "UTIB0001234", accountType: "Savings" },
    demat: { dpName: "Groww", dpId: "45678901", clientId: "10987654", accountNumber: "4567890110987654", dpType: "CDSL" },
    nominee: { nomineeName: "Anand Joshi", relationship: "Brother", dob: "1992-04-25", percentage: 100, address: "22, Lake View, Bengaluru" },
  },
  {
    investorId: "inv5",
    basic: { fullName: "Karan Patel", dob: "1982-02-20", pan: "EFGHP7890H", gender: "Male", address: "5, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009" },
    bank: { bankName: "Kotak Mahindra Bank", branchName: "CG Road", accountNumber: "7654321098765", ifscCode: "KKBK0001234", accountType: "Current" },
    demat: { dpName: "Angel One", dpId: "56789012", clientId: "21098765", accountNumber: "5678901221098765", dpType: "NSDL" },
    nominee: { nomineeName: "Hema Patel", relationship: "Mother", dob: "1955-12-08", percentage: 100, address: "5, Navrangpura, Ahmedabad" },
  },
];

export const IFAS: IFA[] = [
  {
    id: "ifa1",
    name: "Vikram Nair",
    email: "vikram.nair@wealth.com",
    phone: "9812345678",
    investorIds: ["inv1", "inv2", "inv3"],
  },
  {
    id: "ifa2",
    name: "Deepika Rao",
    email: "deepika.rao@wealth.com",
    phone: "9923456789",
    investorIds: ["inv4", "inv5"],
  },
  {
    id: "ifa3",
    name: "Suresh Pillai",
    email: "suresh.pillai@wealth.com",
    phone: "9034567890",
    investorIds: [],
  },
];

export const IFA_PROFILES: IFAProfile[] = [
  {
    ifaId: "ifa1",
    basic: { fullName: "Vikram Nair", dob: "1980-04-12", pan: "PQRVN1234A", gender: "Male", address: "34, Marine Lines", city: "Mumbai", state: "Maharashtra", pincode: "400002" },
    bank: { bankName: "HDFC Bank", branchName: "Fort Branch", accountNumber: "50100987654321", ifscCode: "HDFC0000167", accountType: "Current" },
    demat: { dpName: "HDFC Securities", dpId: "12349876", clientId: "67891234", accountNumber: "1234987667891234", dpType: "NSDL" },
    agreement: { agreementNumber: "AGR-2024-001", agreementDate: "2024-01-15", status: "Active", renewalDate: "2025-01-15", commissionRate: "1.5%" },
  },
  {
    ifaId: "ifa2",
    basic: { fullName: "Deepika Rao", dob: "1985-09-25", pan: "QRSTD5678B", gender: "Female", address: "56, Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034" },
    bank: { bankName: "Axis Bank", branchName: "Banjara Hills", accountNumber: "9187654321098", ifscCode: "UTIB0000567", accountType: "Savings" },
    demat: { dpName: "Zerodha", dpId: "23456781", clientId: "18765432", accountNumber: "2345678118765432", dpType: "CDSL" },
    agreement: { agreementNumber: "AGR-2024-002", agreementDate: "2024-03-01", status: "Active", renewalDate: "2025-03-01", commissionRate: "1.25%" },
  },
  {
    ifaId: "ifa3",
    basic: { fullName: "Suresh Pillai", dob: "1975-12-08", pan: "RSTUSP901C", gender: "Male", address: "78, Trivandrum Road", city: "Kochi", state: "Kerala", pincode: "682001" },
    bank: { bankName: "SBI", branchName: "Ernakulam", accountNumber: "31234567890123", ifscCode: "SBIN0001567", accountType: "Savings" },
    demat: { dpName: "Angel One", dpId: "34567892", clientId: "29876543", accountNumber: "3456789229876543", dpType: "NSDL" },
    agreement: { agreementNumber: "AGR-2023-015", agreementDate: "2023-06-10", status: "Expired", renewalDate: "2024-06-10", commissionRate: "1.0%" },
  },
];

export const SELL_ORDERS: SellOrder[] = [
  {
    orderId: "SO-1001",
    dematAccountId: "acc1",
    stockName: "Tata Consultancy Services",
    symbol: "TCS",
    quantity: 20,
    sellPrice: 3580,
    status: "Executed",
    orderDate: "2026-04-20T10:45:00Z",
  },
  {
    orderId: "SO-1002",
    dematAccountId: "acc1",
    stockName: "Reliance Industries",
    symbol: "RELIANCE",
    quantity: 15,
    sellPrice: 2640,
    status: "Pending",
    orderDate: "2026-04-24T14:30:00Z",
  },
  {
    orderId: "SO-1003",
    dematAccountId: "acc2",
    stockName: "Infosys",
    symbol: "INFY",
    quantity: 30,
    sellPrice: 1610,
    status: "Cancelled",
    orderDate: "2026-04-14T09:20:00Z",
  },
  {
    orderId: "SO-1004",
    dematAccountId: "acc2",
    stockName: "HDFC Bank",
    symbol: "HDFC",
    quantity: 25,
    sellPrice: 1515,
    status: "Executed",
    orderDate: "2026-04-25T11:10:00Z",
  },
];

export const BOND_ORDERS: BondOrder[] = [
  // Reliance Industries Ltd 8.95% 2027 — acc1
  { orderId: "ORD-001", isin: "INE002A07RY8", dematAccountId: "acc1", purchasedDate: "2024-03-15", total: 50, available: 15, blocked: 35, sold: 0, price: 1020 },
  { orderId: "ORD-002", isin: "INE002A07RY8", dematAccountId: "acc1", purchasedDate: "2024-06-20", total: 30, available: 0, blocked: 10, sold: 20, price: 1015 },
  // HDFC Bank Ltd 7.95% 2028 — acc1
  { orderId: "ORD-003", isin: "INE040A08120", dematAccountId: "acc1", purchasedDate: "2024-04-10", total: 60, available: 40, blocked: 20, sold: 0, price: 980 },
  { orderId: "ORD-004", isin: "INE040A08120", dematAccountId: "acc1", purchasedDate: "2024-07-05", total: 40, available: 25, blocked: 15, sold: 0, price: 975 },
  // ICICI Bank 8.40% 2026 — acc2
  { orderId: "ORD-005", isin: "INE090A08UJ3", dematAccountId: "acc2", purchasedDate: "2024-02-01", total: 30, available: 0, blocked: 0, sold: 30, price: 995 },
  // Bajaj Finance 9.10% 2029 — acc2
  { orderId: "ORD-006", isin: "INE152A08101", dematAccountId: "acc2", purchasedDate: "2024-05-15", total: 75, available: 75, blocked: 0, sold: 0, price: 1050 },
  // Power Finance Corp 8.65% 2026 — acc3
  { orderId: "ORD-007", isin: "INE134E08KT0", dematAccountId: "acc3", purchasedDate: "2024-08-01", total: 25, available: 25, blocked: 0, sold: 0, price: 1030 },
  // NTPC Ltd 7.25% 2027 — acc3
  { orderId: "ORD-008", isin: "INE733E07JK2", dematAccountId: "acc3", purchasedDate: "2024-09-10", total: 20, available: 10, blocked: 10, sold: 0, price: 960 },
  { orderId: "ORD-009", isin: "INE733E07JK2", dematAccountId: "acc3", purchasedDate: "2024-11-05", total: 20, available: 0, blocked: 10, sold: 10, price: 955 },
];

export const SELL_REQUESTS: SellRequest[] = [
  { requestId: "SR-001", bondName: "Reliance Industries Ltd", orderId: "ORD-001", units: 20, yield: 9.25, settlementDate: "2026-03-23", status: "Negotiation" },
  { requestId: "SR-002", bondName: "HDFC Bank Ltd",           orderId: "ORD-002", units: 50, yield: 8.1,  settlementDate: "2026-03-24", status: "Sell Initiated" },
  { requestId: "SR-003", bondName: "ICICI Bank 8.40%",        orderId: "ORD-003", units: 15, yield: 8.6,  settlementDate: "2026-03-25", status: "Buyer Approved" },
  { requestId: "SR-004", bondName: "Bajaj Finance 9.10%",     orderId: "ORD-004", units: 30, yield: 9.3,  settlementDate: "2026-03-15", utr: "UTR202603150001", rfqNumber: "RFQ-2026-0412", tradeNumber: "TRD-2026-0412", status: "Settled" },
  { requestId: "SR-005", bondName: "Tata Capital 8.75%",      orderId: "ORD-005", units: 40, yield: 8.9,  settlementDate: "2026-03-16", status: "Rejected" },
  { requestId: "SR-006", bondName: "HDFC Bank Ltd",           orderId: "ORD-003", units: 20, yield: 8.2,  settlementDate: "2026-03-28", status: "Negotiation" },
  { requestId: "SR-007", bondName: "Power Finance Corp 8.65%", orderId: "ORD-005", units: 25, yield: 8.65, settlementDate: "2026-03-29", status: "Auto Approved" },
  { requestId: "SR-009", bondName: "Reliance Industries Ltd",  orderId: "ORD-001", units: 15, yield: 9.0,  settlementDate: "2026-03-24", status: "InProgress" },
  { requestId: "SR-010", bondName: "Tata Capital 8.75%",       orderId: "ORD-002", units: 10, yield: 8.8,  settlementDate: "2026-03-10", status: "Terminated" },
  { requestId: "SR-011", bondName: "Bajaj Finance 9.10%",      orderId: "ORD-006", units: 10, yield: 9.5,  settlementDate: "2026-05-10", status: "Negotiation" },
];

export const NEGOTIATION_DETAILS: NegotiationDetail[] = [
  {
    requestId: "SR-001",
    fullBondName: "Reliance Industries Ltd 8.95% 2027",
    isin: "INE002A07RY8",
    purchaseYield: 8.75,
    settlementBank: "HDFC Bank · XXXX XXXX 4521",
    rounds: [
      { round: 1, party: "You",   date: "10/03/2026, 10:30:00", yield: 9.25, price: 1015, remark: "Initiating sell at desired yield." },
      { round: 2, party: "Buyer", date: "11/03/2026, 09:00:00", yield: 9.5,  price: 1008, remark: "Counter with higher yield based on current market rates." },
    ],
  },
  {
    requestId: "SR-006",
    fullBondName: "HDFC Bank Ltd 7.95% 2028",
    isin: "INE040A08120",
    purchaseYield: 7.5,
    settlementBank: "HDFC Bank · XXXX XXXX 4521",
    rounds: [
      { round: 1, party: "You", date: "12/03/2026, 11:00:00", yield: 8.2, price: 982, remark: "Initiating sell at desired yield." },
    ],
  },
  {
    requestId: "SR-011",
    fullBondName: "Bajaj Finance Ltd 9.10% 2029",
    isin: "INE152A08101",
    settlementBank: "ICICI Bank · XXXX XXXX 7890",
    rounds: [
      { round: 1, party: "You",   date: "01/05/2026, 10:00:00", yield: 9.5,  price: 1048, remark: "Initiating sell at desired yield." },
      { round: 2, party: "Buyer", date: "02/05/2026, 14:30:00", yield: 9.75, price: 1042, remark: "Countering with a slightly higher yield." },
    ],
  },
];

const DEFAULT_BANK = "HDFC Bank  XXXX XXXX 4521";

export const TRANSACTIONS: Transaction[] = [
  // Sell transactions
  { id: "SR-006", type: "Sell", bondName: "HDFC Bank Ltd",            isin: "INE040A08120", units: 20, price: 1000, yield: 8.2,  date: "2026-03-28", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc1", status: "Negotiation" },
  { id: "SR-003", type: "Sell", bondName: "ICICI Bank 8.40%",         isin: "INE090A08UJ3", units: 15, price: 1000, yield: 8.6,  date: "2026-03-25", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc2", status: "Buyer Approved" },
  { id: "SR-002", type: "Sell", bondName: "HDFC Bank Ltd",            isin: "INE040A08120", units: 50, price: 1000, yield: 8.1,  date: "2026-03-24", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc1", status: "Sell Initiated" },
  { id: "SR-007", type: "Sell", bondName: "Power Finance Corp 8.65%", isin: "INE134E08KT0", units: 25, price: 1000, yield: 8.65, date: "2026-03-29", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc3", status: "Auto Approved" },
  { id: "SR-009", type: "Sell", bondName: "Reliance Industries Ltd",  isin: "INE002A07RY8", units: 15, price: 1000, yield: 9.0,  date: "2026-03-24", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc1", status: "InProgress" },
  { id: "SR-001", type: "Sell", bondName: "Reliance Industries Ltd",  isin: "INE002A07RY8", units: 20, price: 1000, yield: 9.25, date: "2026-03-23", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc1", status: "Negotiation" },
  { id: "SR-005", type: "Sell", bondName: "Tata Capital 8.75%",       isin: "INE261F08181", units: 40, price: 1000, yield: 8.9,  date: "2026-03-16", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc2", status: "Rejected" },
  { id: "SR-004", type: "Sell", bondName: "Bajaj Finance 9.10%",      isin: "INE152A08101", units: 30, price: 1000, yield: 9.3,  date: "2026-03-15", utr: "UTR202603150001", bank: DEFAULT_BANK, dematAccountId: "acc2", status: "Settled" },
  { id: "SR-010", type: "Sell", bondName: "Tata Capital 8.75%",       isin: "INE261F08181", units: 10, price: 1000, yield: 8.8,  date: "2026-03-10", utr: undefined,         bank: DEFAULT_BANK, dematAccountId: "acc1", status: "Terminated" },
  // Buy transactions
  { id: "ORD-004", type: "Buy", bondName: "ICICI Bank 8.40%",         isin: "INE090A08UJ3", units: 30,  price: 1010, date: "2025-01-05", dematAccountId: "acc2", status: "Settled" },
  { id: "ORD-005", type: "Buy", bondName: "Bajaj Finance 9.10%",      isin: "INE152A08101", units: 75,  price: 1005, date: "2024-11-18", dematAccountId: "acc2", status: "Settled" },
  { id: "ORD-002", type: "Buy", bondName: "Reliance Industries Ltd",  isin: "INE002A07RY8", units: 30,  price: 1015, date: "2024-06-20", dematAccountId: "acc1", status: "Settled" },
  { id: "ORD-001", type: "Buy", bondName: "Reliance Industries Ltd",  isin: "INE002A07RY8", units: 50,  price: 1020, date: "2024-03-15", dematAccountId: "acc1", status: "Settled" },
  { id: "ORD-003", type: "Buy", bondName: "HDFC Bank Ltd",            isin: "INE040A08120", units: 100, price: 995,  date: "2024-01-10", dematAccountId: "acc1", status: "Settled" },
];
