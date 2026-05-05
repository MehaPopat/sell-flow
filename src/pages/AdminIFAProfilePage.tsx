import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchIFAById, fetchIFAProfile } from "@/services/api";
import { PortalLayout } from "@/components/PortalLayout";
import type { IFA, IFAProfile } from "@/types";

type Tab = "basic" | "bank" | "demat" | "agreement";

const TABS: { key: Tab; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "bank", label: "Bank Info" },
  { key: "demat", label: "Demat Info" },
  { key: "agreement", label: "Agreement" },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-label">{label}</span>
      <span className="profile-info-value">{value}</span>
    </div>
  );
}

export default function AdminIFAProfilePage() {
  const { ifaId } = useParams<{ ifaId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [ifa, setIfa] = useState<IFA | null>(null);
  const [profile, setProfile] = useState<IFAProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ifaId) return;
    Promise.all([fetchIFAById(ifaId), fetchIFAProfile(ifaId)]).then(([ifaData, prof]) => {
      if (ifaData) setIfa(ifaData);
      if (prof) setProfile(prof);
      setLoading(false);
    });
  }, [ifaId]);

  return (
    <PortalLayout role="ops">
      <div className="space-y-6">
        <div className="back-btn-wrap">
          <button onClick={() => navigate("/admin/ifas")} className="back-btn">
            ← Back to IFAs
          </button>
        </div>
        <div className="text-left">
          <h1 className="text-xl font-semibold">
            {loading ? "Loading..." : `${ifa?.name}'s Profile`}
          </h1>
          <p className="text-sm text-muted-foreground">IFA profile and details</p>
        </div>

        <div className="profile-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`profile-tab ${activeTab === tab.key ? "profile-tab-active" : "profile-tab-inactive"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!loading && profile && (
          <div className="card-elevated p-6">
            {activeTab === "basic" && (
              <div className="profile-section">
                <p className="profile-section-title">Basic Information</p>
                <div className="profile-info-grid">
                  <InfoRow label="Full Name" value={profile.basic.fullName} />
                  <InfoRow label="Date of Birth" value={profile.basic.dob} />
                  <InfoRow label="PAN Number" value={profile.basic.pan} />
                  <InfoRow label="Gender" value={profile.basic.gender} />
                  <InfoRow label="Address" value={profile.basic.address} />
                  <InfoRow label="City" value={profile.basic.city} />
                  <InfoRow label="State" value={profile.basic.state} />
                  <InfoRow label="Pincode" value={profile.basic.pincode} />
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="profile-section">
                <p className="profile-section-title">Bank Information</p>
                <div className="profile-info-grid">
                  <InfoRow label="Bank Name" value={profile.bank.bankName} />
                  <InfoRow label="Branch Name" value={profile.bank.branchName} />
                  <InfoRow label="Account Number" value={profile.bank.accountNumber} />
                  <InfoRow label="IFSC Code" value={profile.bank.ifscCode} />
                  <InfoRow label="Account Type" value={profile.bank.accountType} />
                </div>
              </div>
            )}

            {activeTab === "demat" && (
              <div className="profile-section">
                <p className="profile-section-title">Demat Information</p>
                <div className="profile-info-grid">
                  <InfoRow label="DP Name" value={profile.demat.dpName} />
                  <InfoRow label="DP ID" value={profile.demat.dpId} />
                  <InfoRow label="Client ID" value={profile.demat.clientId} />
                  <InfoRow label="Account Number" value={profile.demat.accountNumber} />
                  <InfoRow label="DP Type" value={profile.demat.dpType} />
                </div>
              </div>
            )}

            {activeTab === "agreement" && (
              <div className="profile-section">
                <p className="profile-section-title">Agreement Details</p>
                <div className="profile-info-grid">
                  <InfoRow label="Agreement Number" value={profile.agreement.agreementNumber} />
                  <InfoRow label="Agreement Date" value={profile.agreement.agreementDate} />
                  <InfoRow label="Status" value={profile.agreement.status} />
                  <InfoRow label="Renewal Date" value={profile.agreement.renewalDate} />
                  <InfoRow label="Commission Rate" value={profile.agreement.commissionRate} />
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="card-elevated p-6">
            <p className="text-sm text-muted-foreground text-center py-8">Loading profile...</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
