import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SellOrdersPage from "@/pages/SellOrdersPage";
import TransactionsPage from "@/pages/TransactionsPage";
import OpsDashboardPage from "@/pages/OpsDashboardPage";
import HoldPage from "@/pages/HoldPage";
import InvestorListPage from "@/pages/InvestorListPage";
import InvestorProfilePage from "@/pages/InvestorProfilePage";
import InvestorSelfProfilePage from "@/pages/InvestorSelfProfilePage";
import IFASelfProfilePage from "@/pages/IFASelfProfilePage";
import AdminIFAListPage from "@/pages/AdminIFAListPage";
import AdminIFAProfilePage from "@/pages/AdminIFAProfilePage";
import AdminIFAInvestorListPage from "@/pages/AdminIFAInvestorListPage";
import AdminInvestorListPage from "@/pages/AdminInvestorListPage";
import SellQuotesPage from "@/pages/SellQuotesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/hold" element={<HoldPage />} />
        <Route path="/investor/profile" element={<InvestorSelfProfilePage />} />
        <Route path="/ifa/investors" element={<InvestorListPage />} />
        <Route path="/ifa/investors/:id/holdings" element={<DashboardPage />} />
        <Route path="/ifa/investors/:id/profile" element={<InvestorProfilePage />} />
        <Route path="/ifa/profile" element={<IFASelfProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sell-quotes" element={<SellQuotesPage />} />
        <Route path="/orders" element={<TransactionsPage />} />
        <Route path="/sell-orders" element={<SellOrdersPage />} />
        <Route path="/sell-orders/:role" element={<SellOrdersPage />} />
        <Route path="/ops" element={<OpsDashboardPage />} />
        <Route path="/admin/ifas" element={<AdminIFAListPage />} />
        <Route path="/admin/ifas/:ifaId/profile" element={<AdminIFAProfilePage />} />
        <Route path="/admin/ifas/:ifaId/investors" element={<AdminIFAInvestorListPage />} />
        <Route path="/admin/investors" element={<AdminInvestorListPage />} />
        <Route path="/admin/sell-orders" element={<SellOrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
