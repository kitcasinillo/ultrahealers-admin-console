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
import { AdminGuard } from "./components/AdminGuard";
import { FinancialReport } from "./pages/reports/FinancialReport";
import { CampaignReport } from "./pages/reports/CampaignReport";
import { DisputeReport } from "./pages/reports/DisputeReport";
import { UserReport } from "./pages/reports/UserReport";
import { BookingReport } from "./pages/reports/BookingReport";
import { RetreatReport } from "./pages/reports/RetreatReport";

import { PlatformOverview } from "./pages/reports/PlatformOverview";
import { Payments } from "./pages/payments/Payments";
import Modalities from "./pages/modalities/Modalities";
import { Notifications } from "./pages/notifications/Notifications";
import { SettingsPage } from "./pages/settings/SettingsPage";
import SEOPage from "./pages/seo/SEOPage";
import { CampaignList } from "./pages/campaigns/pages/CampaignList";
import { CampaignEditor } from "./pages/campaigns/pages/CampaignEditor";
import { CampaignDetail } from "./pages/campaigns/pages/CampaignDetail";    
import { Templates } from "./pages/campaigns/pages/Templates";
import { UnsubscribeList } from "./pages/campaigns/pages/UnsubscribeList";  
import { UnsubscribePage } from "./pages/campaigns/pages/UnsubscribePage";  
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<AdminGuard />}>
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

            <Route path="finance/*" element={<Payments />} />
            
            {/* Campaign Builder */}
            <Route path="campaigns" element={<CampaignList />} />
            <Route path="campaigns/new" element={<CampaignEditor />} />     
            <Route path="campaigns/:id/edit" element={<CampaignEditor />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="campaigns/templates" element={<Templates />} />
            <Route path="campaigns/unsubscribes" element={<UnsubscribeList />} />
            <Route path="unsubscribe" element={<UnsubscribePage />} />
            
            <Route path="reports">
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<PlatformOverview />} />
              <Route path="financial" element={<FinancialReport />} />
              <Route path="campaigns" element={<CampaignReport />} />
              <Route path="disputes" element={<DisputeReport />} />
              <Route path="users" element={<UserReport />} />
              <Route path="bookings" element={<BookingReport />} />
              <Route path="retreats" element={<RetreatReport />} />
            </Route>
            <Route path="modalities" element={<Modalities />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="seo" element={<SEOPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </AdminAuthProvider>
    </ToastProvider>
  );
}

export default App;
