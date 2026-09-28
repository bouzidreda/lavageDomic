import { Link, NavLink } from "react-router-dom";
import { authStore } from "../../store/auth";
import { parseJwt } from "../../lib/validators";

export function SideNav({ onLogout }: { onLogout: () => void }) {
  const token = authStore.getAccessToken();
  const role = token ? parseJwt(token)?.role : null;

  const link = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
      isActive ? "bg-[var(--bg-soft)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
    ].join(" ");

  return (
    <div className="shell-panel p-3">
      <div className="kicker">Workspace</div>
      <div className="mt-2 grid gap-1">
        <NavLink className={link} to="/">Home</NavLink>
        <NavLink className={link} to="/search">Find providers</NavLink>
        <NavLink className={link} to="/bookings">My bookings</NavLink>
        <NavLink className={link} to="/me">Profile</NavLink>

        {role === "PROVIDER" ? (
          <>
            <div className="kicker pt-3">Provider</div>
            <NavLink className={link} to="/provider">Dashboard</NavLink>
            <NavLink className={link} to="/provider/bookings">Requests</NavLink>
            <NavLink className={link} to="/provider/profile">Business profile</NavLink>
          </>
        ) : null}

        {role === "ADMIN" ? (
          <>
            <div className="kicker pt-3">Admin</div>
            <NavLink className={link} to="/admin">Operations</NavLink>
          </>
        ) : null}

        <div className="pt-3">
          {authStore.isAuthed() ? (
            <button className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm font-semibold" onClick={onLogout}>Logout</button>
          ) : (
            <Link className="block rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold" to="/login">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}