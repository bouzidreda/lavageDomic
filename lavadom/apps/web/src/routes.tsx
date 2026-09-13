import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import RoleLandingPage from "./pages/RoleLandingPage";

import SearchProvidersPage from "./pages/client/SearchProvidersPage";
import ProviderDetailsPage from "./pages/client/ProviderDetailsPage";
import MyBookingsPage from "./pages/client/MyBookingsPage";
import BookingCheckoutPage from "./pages/client/BookingCheckoutPage";
import ProfilePage from "./pages/client/ProfilePage";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ServiceCategoryPage from "./pages/client/ServiceCategoryPage";
import ReservationFlowPage from "./pages/client/ReservationFlowPage";
import BookingKycPage from "./pages/client/BookingKycPage";
import KycPolicyPage from "./pages/client/KycPolicyPage";
import ContactPage from "./pages/client/ContactPage";

import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage";
import ProviderBookingsPage from "./pages/provider/ProviderBookingsPage";
import ProviderProfileEditPage from "./pages/provider/ProviderProfileEditPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <RoleLandingPage /> },
      { path: "search", element: <SearchProvidersPage /> },
      { path: "services/:service", element: <ServiceCategoryPage /> },
      { path: "reservation-flow", element: <ReservationFlowPage /> },
      { path: "booking-and-kyc", element: <BookingKycPage /> },
      { path: "kyc-policy", element: <KycPolicyPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "providers/:id", element: <ProviderDetailsPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },

      {
        element: <ProtectedRoute roles={["CLIENT", "PROVIDER", "ADMIN"]} />,
        children: [
          { path: "client", element: <ClientDashboardPage /> },
          { path: "me", element: <ProfilePage /> },
          { path: "bookings", element: <MyBookingsPage /> },
          { path: "checkout/:providerId", element: <BookingCheckoutPage /> }
        ]
      },

      {
        element: <ProtectedRoute roles={["PROVIDER", "ADMIN"]} />,
        children: [
          { path: "provider", element: <ProviderDashboardPage /> },
          { path: "provider/bookings", element: <ProviderBookingsPage /> },
          { path: "provider/profile", element: <ProviderProfileEditPage /> }
        ]
      },

      {
        element: <ProtectedRoute roles={["ADMIN"]} />,
        children: [{ path: "admin", element: <AdminDashboardPage /> }]
      },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);
