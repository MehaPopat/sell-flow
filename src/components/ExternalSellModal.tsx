import { useState } from "react";
import type { UserRole } from "@/types";
import { sendOpsEmail } from "@/services/api";


const SETTLEMENT_BANKS = [
  { id: "b1", name: "HDFC Bank",  masked: "****6789", type: "Savings", ifsc: "HDFC0001234" },
  { id: "b2", name: "ICICI Bank", masked: "****9012", type: "Savings", ifsc: "ICIC0001567" },
  { id: "b3", name: "SBI",        masked: "****3456", type: "Savings", ifsc: "SBIN0050432" },
];

const DEMAT_ACCOUNTS_LIST = [
  { id: "acc1", dpName: "HDFC Securities",       accountNumber: "1234567887654321", dpType: "NSDL" },
  { id: "acc2", dpName: "ICICI Direct",           accountNumber: "2345678998765432", dpType: "CDSL" },
  { id: "acc3", dpName: "Zerodha",                accountNumber: "3456789009876543", dpType: "NSDL" },
  { id: "acc4", dpName: "Liquibonds Securities",  accountNumber: "2234567887655621", dpType: "CDSL" },
];

const AVAILABLE_ISINS = [
  { isin: "INE002A07RY8", bondName: "Reliance Industries Ltd 8.95% 2027" },
  { isin: "INE040A08120", bondName: "HDFC Bank Ltd 7.95% 2028" },
  { isin: "INE090A08UJ3", bondName: "ICICI Bank 8.40% 2026" },
  { isin: "INE152A08101", bondName: "Bajaj Finance 9.10% 2029" },
  { isin: "INE134E08KT0", bondName: "Power Finance Corp 8.65% 2026" },
  { isin: "INE733E07JK2", bondName: "NTPC Ltd 7.25% 2027" },
  { isin: "INE081A08173", bondName: "Tata Steel Ltd 9.20% 2028" },
  { isin: "INE476A08035", bondName: "L&T Finance Ltd 8.75% 2027" },
];

interface ExternalSellModalProps {
  role: UserRole;
  investorName?: string;
  investorPhone?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExternalSellModal({ role, investorName, investorPhone, onClose, onSuccess }: ExternalSellModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedIsin, setSelectedIsin] = useState("");
  const [isinName, setIsinName] = useState("");
  const [isinValue, setIsinValue] = useState("");
  const [units, setUnits] = useState("");
  const [desiredYield, setDesiredYield] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState(SETTLEMENT_BANKS[0].id);
  const [selectedDematId, setSelectedDematId] = useState(DEMAT_ACCOUNTS_LIST[0].id);
  const [confirmed, setConfirmed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const isOther = selectedIsin === "other";
  const unitsNum = Number(units);
  const yieldNum = Number(desiredYield);

  const displayIsin = isOther ? `${isinName} (${isinValue})` : (() => {
    const match = AVAILABLE_ISINS.find((b) => b.isin === selectedIsin);
    return match ? `${match.isin} — ${match.bondName}` : selectedIsin;
  })();

  function handleIsinChange(value: string) {
    setSelectedIsin(value);
    if (value !== "other") {
      setIsinName("");
      setIsinValue("");
      setPurchaseDate("");
      setPurchaseAmount("");
    }
    setErrors((prev) => ({ ...prev, isin: "", isinName: "", isinValue: "", purchaseDate: "", purchaseAmount: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!selectedIsin) next.isin = "Please select a Bond ISIN.";
    if (isOther && !isinName.trim()) next.isinName = "ISIN Name is required.";
    if (isOther && !isinValue.trim()) next.isinValue = "ISIN Value is required.";
    if (isOther && !purchaseDate) next.purchaseDate = "Purchase Date is required.";
    if (isOther && (purchaseAmount === "" || Number(purchaseAmount) <= 0))
      next.purchaseAmount = "Purchase Amount must be greater than 0.";
    if (units === "" || unitsNum < 1 || unitsNum > 1000)
      next.units = "Units must be between 1 and 1000.";
    if (desiredYield === "" || yieldNum < 0 || yieldNum > 100)
      next.desiredYield = "Desired Yield must be between 0 and 100.";
    if (!selectedBankId) next.bank = "Please select a settlement bank account.";
    if (!confirmed) next.confirmed = "Please confirm the details before submitting.";
    return next;
  }

  async function submitEmail() {
    await sendOpsEmail({
      isin: selectedIsin,
      isinName: isOther ? isinName : undefined,
      isinValue: isOther ? isinValue : undefined,
      units: unitsNum,
      desiredYield: yieldNum,
      investorName: investorName,
      investorPhone: investorPhone,
    });
  }

  async function handleFormSubmit() {
    const next = validate();
    if (Object.values(next).some(Boolean)) {
      setErrors(next);
      return;
    }
    setStep("otp");
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }
    setSubmitting(true);
    await submitEmail();
    setSubmitting(false);
    setStep("success");
  }

  const maskedPhone = role === "investor"
    ? "your registered mobile number"
    : investorPhone
      ? `+91 ****${investorPhone.slice(-4)}`
      : "investor's registered number";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={step === "form" ? onClose : undefined}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* ── FORM STEP ── */}
          {step === "form" && (
            <>
              <div className="flex items-start justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="font-semibold text-base">External Sell</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create a quote for bonds purchased from other vendors
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground text-2xl leading-none ml-4 shrink-0"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Select Bond ISIN */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Select Bond ISIN</label>
                  <select
                    value={selectedIsin}
                    onChange={(e) => {
                      handleIsinChange(e.target.value);
                      if (e.target.value) setErrors((prev) => ({ ...prev, isin: "" }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm appearance-none bg-white ${errors.isin ? "border-destructive" : "border-input"}`}
                  >
                    <option value="">Search and select ISIN...</option>
                    {AVAILABLE_ISINS.map((b) => (
                      <option key={b.isin} value={b.isin}>
                        {b.isin} — {b.bondName}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                  {errors.isin && <p className="text-xs text-destructive">{errors.isin}</p>}
                </div>

                {/* Custom ISIN fields – visible only when "Other" is selected */}
                {isOther && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">ISIN Name</label>
                      <input
                        type="text"
                        placeholder="Enter ISIN name"
                        value={isinName}
                        onChange={(e) => {
                          setIsinName(e.target.value);
                          if (e.target.value.trim()) setErrors((prev) => ({ ...prev, isinName: "" }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.isinName ? "border-destructive" : "border-input"}`}
                      />
                      {errors.isinName && <p className="text-xs text-destructive">{errors.isinName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">ISIN Value</label>
                      <input
                        type="text"
                        placeholder="Enter ISIN value"
                        value={isinValue}
                        onChange={(e) => {
                          setIsinValue(e.target.value);
                          if (e.target.value.trim()) setErrors((prev) => ({ ...prev, isinValue: "" }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.isinValue ? "border-destructive" : "border-input"}`}
                      />
                      {errors.isinValue && <p className="text-xs text-destructive">{errors.isinValue}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Purchase Date</label>
                      <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={purchaseDate}
                        onChange={(e) => {
                          setPurchaseDate(e.target.value);
                          if (e.target.value) setErrors((prev) => ({ ...prev, purchaseDate: "" }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.purchaseDate ? "border-destructive" : "border-input"}`}
                      />
                      {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium block">Purchase Amount (₹ per unit)</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="e.g. 10500"
                        value={purchaseAmount}
                        onChange={(e) => {
                          setPurchaseAmount(e.target.value);
                          if (Number(e.target.value) > 0) setErrors((prev) => ({ ...prev, purchaseAmount: "" }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.purchaseAmount ? "border-destructive" : "border-input"}`}
                      />
                      {errors.purchaseAmount && <p className="text-xs text-destructive">{errors.purchaseAmount}</p>}
                    </div>
                  </>
                )}

                {/* Number of Units */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Number of Units</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    placeholder="Enter number of units (1 – 1000)"
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value);
                      setErrors((prev) => ({ ...prev, units: "" }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.units ? "border-destructive" : "border-input"}`}
                  />
                  {errors.units && <p className="text-xs text-destructive">{errors.units}</p>}
                </div>

                {/* Desired Yield */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Desired Yield (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9.25 (0 – 100)"
                    value={desiredYield}
                    onChange={(e) => {
                      setDesiredYield(e.target.value);
                      setErrors((prev) => ({ ...prev, desiredYield: "" }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.desiredYield ? "border-destructive" : "border-input"}`}
                  />
                  {errors.desiredYield && <p className="text-xs text-destructive">{errors.desiredYield}</p>}
                </div>

                {/* Settlement Bank */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Settlement Bank Account</label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => {
                      setSelectedBankId(e.target.value);
                      if (e.target.value) setErrors((prev) => ({ ...prev, bank: "" }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm appearance-none bg-white ${errors.bank ? "border-destructive" : "border-input"}`}
                  >
                    <option value="">Select bank account for settlement…</option>
                    {SETTLEMENT_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.masked} ({b.type}) · {b.ifsc}
                      </option>
                    ))}
                  </select>
                  {errors.bank && <p className="text-xs text-destructive">{errors.bank}</p>}
                  {selectedBankId && (() => {
                    const bank = SETTLEMENT_BANKS.find((b) => b.id === selectedBankId);
                    return bank ? (
                      <p className="text-xs text-muted-foreground">
                        Proceeds will be credited to{" "}
                        <span className="font-medium">{bank.name} {bank.masked}</span>
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Demat Account */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Demat Account</label>
                  <select
                    value={selectedDematId}
                    onChange={(e) => setSelectedDematId(e.target.value)}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm appearance-none bg-white"
                  >
                    {DEMAT_ACCOUNTS_LIST.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dpName} — XXXX XXXX {d.accountNumber.slice(-4)} ({d.dpType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confirm checkbox */}
                <div className="space-y-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => {
                        setConfirmed(e.target.checked);
                        if (e.target.checked) setErrors((prev) => ({ ...prev, confirmed: "" }));
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I confirm that the above details are correct. I understand that sell orders are
                      subject to market conditions and negotiation with buyers. I agree to the Terms of
                      Service and understand the T+2 day termination policy.
                    </span>
                  </label>
                  {errors.confirmed && <p className="text-xs text-destructive">{errors.confirmed}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={submitting}
                    onClick={handleFormSubmit}
                  >
                    {submitting ? "Submitting…" : "Create Quote"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── OTP STEP (IFA / Admin only) ── */}
          {step === "otp" && (
            <>
              <div className="flex items-start justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="font-semibold text-base">Verify OTP</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirm this sell request with investor's OTP
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Investor details */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{role === "investor" ? "Your Details" : "Investor Details"}</p>
                  {investorName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{investorName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">OTP sent to</span>
                    <span className="font-medium">{maskedPhone}</span>
                  </div>
                </div>

                {/* Quote details summary */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quote Details</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bond / ISIN</span>
                    <span className="font-medium text-right max-w-[60%]">{displayIsin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units</span>
                    <span className="font-medium">{units}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desired Yield</span>
                    <span className="font-medium">{desiredYield}%</span>
                  </div>
                  {isOther && purchaseDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Date</span>
                      <span className="font-medium">
                        {purchaseDate.split("-").reverse().join("/")}
                      </span>
                    </div>
                  )}
                  {isOther && purchaseAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Amount</span>
                      <span className="font-medium">₹{Number(purchaseAmount).toLocaleString("en-IN")} / unit</span>
                    </div>
                  )}
                  {(() => {
                    const bank = SETTLEMENT_BANKS.find((b) => b.id === selectedBankId);
                    return bank ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Settlement Bank</span>
                        <span className="font-medium">{bank.name} {bank.masked}</span>
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const d = DEMAT_ACCOUNTS_LIST.find((a) => a.id === selectedDematId);
                    return d ? (
                      <>
                        <div className="border-t border-border/60 pt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">Demat Account</span>
                          <span className="font-medium">{d.dpName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Account No.</span>
                          <span className="font-medium">XXXX XXXX {d.accountNumber.slice(-4)}</span>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>

                {/* OTP input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setOtpError("");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm tracking-widest text-center ${
                      otpError ? "border-destructive" : "border-input"
                    }`}
                  />
                  {otpError && <p className="text-xs text-destructive">{otpError}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setOtp(""); setOtpError(""); setStep("form"); }}
                    className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={otp.length !== 6 || submitting}
                    onClick={handleVerifyOtp}
                  >
                    {submitting ? "Submitting…" : "Verify & Create"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── SUCCESS STEP ── */}
          {step === "success" && (
            <div className="px-6 py-10 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold text-base">Request Submitted</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your request has been submitted successfully. OPS team will review your request
                  and get back to you for further process.
                </p>
              </div>
              <button
                type="button"
                className="action-btn action-btn-primary px-8 py-2.5 text-sm mt-2"
                onClick={onSuccess}
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
