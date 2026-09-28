import { Link } from "react-router-dom";

export function TopBar() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-6xl px-3 py-3 flex items-center gap-3">
        <Link to="/" className="font-bold">Lavadom</Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <Link to="/search" className="underline">Search</Link>
          <Link to="/bookings" className="underline">Bookings</Link>
          <Link to="/me" className="underline">Profile</Link>
        </nav>
      </div>
    </header>
  );
}
