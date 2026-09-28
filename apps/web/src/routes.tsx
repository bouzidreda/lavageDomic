import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import HomePage from "./pages/client/HomePage";
import SearchProvidersPage from "./pages/client/SearchProvidersPage";
import ProviderDetailsPage from "./pages/client/ProviderDetailsPage";
import MyBookingsPage from "./pages/client/MyBookingsPage";
import BookingCheckoutPage from "./pages/client/BookingCheckoutPage";
import ProfilePage from "./pages/client/ProfilePage";

import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage";
import ProviderBookingsPage from "./pages/provider/ProviderBookingsPage";
import ProviderProfileEditPage from "./pages/provider/ProviderProfileEditPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchProvidersPage /> },
      { path: "providers/:id", element: <ProviderDetailsPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "me", element: <ProfilePage /> },
          { path: "bookings", element: <MyBookingsPage /> },
          { path: "checkout/:providerId", element: <BookingCheckoutPage /> },

          { path: "provider", element: <ProviderDashboardPage /> },
          { path: "provider/bookings", element: <ProviderBookingsPage /> },
          { path: "provider/profile", element: <ProviderProfileEditPage /> },

          { path: "admin", element: <AdminDashboardPage /> }
        ]
      }
    ]
  }
]);
