import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut } from "lucide-react";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  const links = [
    ["/dashboard", "Dashboard"],
    ["/profile", "Profile"],
    ["/heart-health", "Heart"],
    ["/mental-health", "Mental"],
    ["/test", "Test"],
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-muted"
          aria-label="Go to dashboard"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="font-semibold text-foreground">NeuroBridge</span>
        </button>

        <nav className="ml-2 flex flex-1 items-center justify-center gap-1">
          {links.map(([to, label]) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-health"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
