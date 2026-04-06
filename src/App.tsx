import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Healers } from "./pages/users/Healers";
import { HealerDetail } from "./pages/users/HealerDetail";
import { Seekers } from "./pages/users/Seekers";
import { SeekerDetail } from "./pages/users/SeekerDetail";
import { Listings } from "./pages/listings/Listings";
import { ListingDetail } from "./pages/listings/ListingDetail";
import RetreatsPage from "./pages/retreats/RetreatsPage";
import RetreatDetail from "./pages/retreats/RetreatDetail";
import DisputesPage from "./pages/disputes/DisputesPage";
import DisputeDetailPage from './pages/disputes/DisputeDetailPage';
// import ModalitiesPage from './pages/modalities';
// import PayoutsPage from './pages/payouts/index';
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { FinancialReport } from "./pages/reports/FinancialReport";
import { CampaignReport } from "./pages/reports/CampaignReport";
import { DisputeReport } from "./pages/reports/DisputeReport";

function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes (Guard Disabled Temporarily) */}
          {/* <Route path="/" element={<AdminGuard />}> */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Placeholder routes for the other modules (Users, Listings, etc) */}
            <Route path="users/healers" element={<Healers />} />
            <Route path="users/healers/:id" element={<HealerDetail />} />
            <Route path="users/seekers" element={<Seekers />} />
            <Route path="users/seekers/:id" element={<SeekerDetail />} />

            <Route path="listings" element={<Listings />} />
            <Route path="listings/:id" element={<ListingDetail />} />
            <Route path="retreats" element={<RetreatsPage />} />
            <Route path="retreats/:id" element={<RetreatDetail />} />


            <Route path="bookings/sessions" element={<div>Session Bookings</div>} />
            <Route path="bookings/retreats" element={<div>Retreat Bookings</div>} />

            {/* Disputes */}
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="disputes/:id" element={<DisputeDetailPage />} />

            <Route path="finance" element={<div>Finance</div>} />
            <Route path="campaigns" element={<div>Campaigns</div>} />
            
            <Route path="reports">
              <Route index element={<div>Reports</div>} />
              <Route path="financial" element={<FinancialReport />} />
              <Route path="campaigns" element={<CampaignReport />} />
              <Route path="disputes" element={<DisputeReport />} />
            </Route>
            <Route path="modalities" element={<div>Modalities</div>} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
          {/* </Route> */}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </AdminAuthProvider>
    </ToastProvider>
  );
}

export default App;
