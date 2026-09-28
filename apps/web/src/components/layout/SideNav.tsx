import { Link } from "react-router-dom";
import { authStore } from "../../store/auth";
import { parseJwt } from "../../lib/validators";

export function SideNav({ onLogout }: { onLogout: () => void }) {
  const token = authStore.getAccessToken();
  const role = token ? parseJwt(token)?.role : null;

  return (
    <div className="bg-white border rounded-xl p-3">
      <div className="text-xs text-neutral-500">Navigation</div>
      <div className="mt-2 grid gap-2 text-sm">
        <Link className="underline" to="/">Home</Link>
        <Link className="underline" to="/search">Search providers</Link>
        <Link className="underline" to="/bookings">My bookings</Link>
        <Link className="underline" to="/me">My profile</Link>

        {role === "PROVIDER" ? (
          <>
            <div className="pt-2 text-xs text-neutral-500">Provider</div>
            <Link className="underline" to="/provider">Dashboard</Link>
            <Link className="underline" to="/provider/bookings">Bookings</Link>
            <Link className="underline" to="/provider/profile">Profile</Link>
          </>
        ) : null}

        {role === "ADMIN" ? (
          <>
            <div className="pt-2 text-xs text-neutral-500">Admin</div>
            <Link className="underline" to="/admin">Dashboard</Link>
          </>
        ) : null}

        {authStore.isAuthed() ? (
          <button className="text-left underline" onClick={onLogout}>Logout</button>
        ) : (
          <Link className="underline" to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}
