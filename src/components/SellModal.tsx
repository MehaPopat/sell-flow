import { useState } from "react";
import type { BondOrder, Holding, UserRole } from "@/types";

interface SellModalProps {
  order: BondOrder;
  holding: Holding;
  role: UserRole;
  investorName?: string;
  investorPhone?: string;
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

export function SellModal({ order, holding, role, investorName, investorPhone, onBack, onClose, onSuccess }: SellModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [submitting, setSubmitting] = useState(false);

  const [units, setUnits] = useState("");
  const [desiredYield, setDesiredYield] = useState("");
  const [yieldError, setYieldError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const yieldMatch = holding.bondName.match(/(\d+\.\d+)%/);
  const purchaseYield = yieldMatch ? parseFloat(yieldMatch[1]) : null;

  const unitsNum = Number(units);

  const unitsError = (() => {
    if (units === "") return null;
    if (unitsNum < 1) return "Units must be at least 1.";
    if (unitsNum > order.available) return `Cannot exceed available units (${order.available}).`;
    return null;
  })();

  const minYield = purchaseYield !== null ? Math.max(0, purchaseYield - 10) : 0;
  const maxYield = purchaseYield !== null ? Math.min(100, purchaseYield + 10) : 100;

  const handleDesiredYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDesiredYield(value);
    if (value === "") { setYieldError(""); return; }
    const num = Number(value);
    if (num < minYield || num > maxYield) {
      setYieldError(`Value must be between ${minYield.toFixed(2)} and ${maxYield.toFixed(2)}`);
    } else {
      setYieldError("");
    }
  };

  const canSubmit =
    units !== "" &&
    unitsNum >= 1 &&
    unitsNum <= order.available &&
    desiredYield !== "" &&
    !yieldError &&
    confirmed;

  function handleFormSubmit() {
    if (!canSubmit) return;
    if (role === "investor") {
      setStep("success");
    } else {
      setStep("otp");
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setStep("success");
  }

  const maskedPhone = investorPhone
    ? `+91 ****${investorPhone.slice(-4)}`
    : "investor's registered number";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={step === "form" ? onBack : undefined}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* ── FORM STEP ── */}
          {step === "form" && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-base">Sell LiquiBonds Holdings</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <p className="text-sm">
                  Sell from order <span className="font-bold">{order.orderId}</span>
                </p>

                <div className="bg-muted rounded-xl p-4 space-y-1">
                  <p className="text-sm font-semibold">{holding.bondName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{holding.isin}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Purchased: {order.purchasedDate}&nbsp;&nbsp;&nbsp;Price: ₹{order.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Units: {order.total}&nbsp;&nbsp;&nbsp;Available: {order.available}&nbsp;&nbsp;&nbsp;Sold: {order.sold}
                  </p>
                  {purchaseYield !== null && (
                    <p className="text-xs mt-1">
                      Purchase Yield:{" "}
                      <span className="font-semibold text-success">{purchaseYield}%</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">
                    Units to Sell (Available {order.available})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={order.available}
                    placeholder={`1 – ${order.available}`}
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${unitsError ? "border-destructive" : "border-input"}`}
                  />
                  {unitsError && <p className="text-xs text-destructive">{unitsError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium block">Desired Yield (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={minYield}
                    max={maxYield}
                    placeholder={
                      purchaseYield !== null
                        ? `e.g. ${minYield.toFixed(2)} - ${maxYield.toFixed(2)}`
                        : "e.g. 9.25"
                    }
                    value={desiredYield}
                    onChange={handleDesiredYieldChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${yieldError ? "border-destructive" : "border-input"}`}
                  />
                  {yieldError && <p className="text-xs text-destructive">{yieldError}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I confirm that the above details are correct. I understand that sell orders are
                    subject to market conditions and negotiation with buyer. I agree to the Terms of
                    Service and understand the T+1 day termination policy.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="action-btn action-btn-secondary flex-1 py-3 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!canSubmit}
                    onClick={handleFormSubmit}
                  >
                    Confirm Sell Request
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── OTP STEP (IFA / Ops only) ── */}
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
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Investor Details</p>
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

                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Details</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order</span>
                    <span className="font-medium">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bond</span>
                    <span className="font-medium text-right max-w-[60%]">{holding.bondName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units</span>
                    <span className="font-medium">{units}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desired Yield</span>
                    <span className="font-medium">{desiredYield}%</span>
                  </div>
                </div>

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
                    className={`w-full rounded-lg border px-3 py-2 text-sm tracking-widest text-center ${otpError ? "border-destructive" : "border-input"}`}
                  />
                  {otpError && <p className="text-xs text-destructive">{otpError}</p>}
                </div>

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
                    {submitting ? "Submitting…" : "Verify & Confirm"}
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
                  Your request has been submitted successfully. We will review your order and
                  communicate with you for further process.
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
