import { Outlet, Link, useNavigate } from "react-router-dom";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";
import { authStore } from "../../store/auth";
import { logout } from "../../api/auth";

export function AppShell() {
  const nav = useNavigate();

  async function onLogout() {
    try { await logout(); } catch {}
    authStore.clear();
    nav("/");
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-6xl px-3 py-4 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3">
        <aside className="hidden md:block">
          <SideNav onLogout={onLogout} />
        </aside>
        <main className="bg-white border rounded-xl p-3">
          <div className="md:hidden mb-3 flex gap-2 items-center">
            <Link className="text-sm font-semibold" to="/">Lavadom</Link>
            <div className="ml-auto">
              {authStore.isAuthed() ? (
                <button className="text-sm underline" onClick={onLogout}>Logout</button>
              ) : (
                <Link className="text-sm underline" to="/login">Login</Link>
              )}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
