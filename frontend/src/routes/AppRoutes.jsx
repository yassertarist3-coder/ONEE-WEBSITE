import { Routes, Route, Navigate } from 'react-router-dom';

// ── Admin pages ──────────────────────────────
import RoleSelectionPage from '../pages/RoleSelectionPage';
import DashboardPage       from '../pages/DashboardPage';
import CatalogPage         from '../pages/CatalogPage';
import StockEntryPage      from '../pages/StockEntryPage';
import StockExitPage       from '../pages/StockExitPage';
import DischargesPage      from '../pages/DischargesPage';
import MovementHistoryPage from '../pages/MovementHistoryPage';
import LowStockPage        from '../pages/LowStockPage';
import UsersManagementPage from '../pages/UsersManagementPage';
import AnalyticsDashboardPage from '../pages/Decisionnel/AnalyticsDashboardPage';

// ── User pages ───────────────────────────────
import UserCatalogPage from '../pages/UserCatalogPage';
import UserRequestPage from '../pages/UserRequestPage';
import UserTicketsPage from '../pages/UserTicketsPage';
import UserLayout      from '../components/UserLayout';
import AdminTicketsPage from '../pages/AdminTicketsPage';

export default function AppRoutes() {
    return (
        <Routes>
            {/* ── Entry route ── */}
            <Route path="/" element={<RoleSelectionPage />} />

            {/* ── Admin routes ── */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/stock-entry" element={<StockEntryPage />} />
            <Route path="/stock-exit" element={<StockExitPage />} />
            <Route path="/discharges" element={<DischargesPage />} />
            <Route path="/movements" element={<MovementHistoryPage />} />
            <Route path="/low-stock" element={<LowStockPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />

            {/* ── User routes ── */}
            <Route path="/user/catalog" element={
                <UserLayout>
                    <UserCatalogPage />
                </UserLayout>
            } />
            <Route path="/user/request" element={
                <UserLayout>
                    <UserRequestPage />
                </UserLayout>
            } />
            <Route path="/user/tickets" element={
                <UserLayout>
                    <UserTicketsPage />
                </UserLayout>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
