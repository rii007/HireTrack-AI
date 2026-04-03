import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  Search,
  Plus,
  CalendarDays,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../state/AuthContext";
import { useTheme } from "../../state/ThemeContext";
import { useSearch } from "../../state/SearchContext";

const SIDEBAR_KEY = "ai-job-tracker-sidebar-collapsed";

const navItems: { to: string; label: string; icon: typeof LayoutDashboard }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Tracker", icon: Briefcase },
  { to: "/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/interview-prep", label: "Interview Prep", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={clsx(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen">
        {/* Sidebar — desktop */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-slate-200 bg-white shadow-lg transition-all duration-300 overflow-y-auto",
            "md:w-60",
            collapsed ? "w-[4.5rem] md:w-[4.5rem]" : "w-60 md:w-60",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div
            className={clsx(
              "flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-4",
              collapsed && "md:flex-col md:px-2"
            )}
          >
            <div className={clsx("min-w-0 px-1", collapsed && "md:hidden")}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                Workspace
              </p>
              <h1 className="mt-0.5 truncate text-sm font-bold tracking-tight text-slate-900">
                AI Job Tracker
              </h1>
            </div>
            <div className={clsx("flex items-center gap-1", collapsed && "md:w-full md:justify-center")}>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-sm font-medium transition-all duration-200 md:pl-3",
                    collapsed && "md:justify-center md:px-0 md:py-3",
                    isActive &&
                      !collapsed &&
                      "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-white/90 dark:before:bg-indigo-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-700 hover:bg-slate-100"
                  )
                }
              >
                <Icon className={clsx("h-4 w-4 shrink-0", collapsed && "md:scale-110")} strokeWidth={2} />
                <span className={clsx("truncate", collapsed && "md:sr-only")}>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-2 dark:border-slate-800">
            <button
              type="button"
              onClick={logout}
              className={clsx(
                "flex w-full items-center gap-2 rounded-xl py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50",
                collapsed ? "md:justify-center" : "px-3",
                "px-3"
              )}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={clsx(collapsed && "md:sr-only")}>Logout</span>
            </button>
          </div>
        </aside>

        <div className={clsx("flex min-w-0 flex-1 flex-col transition-all duration-300", collapsed ? "md:ml-[4.5rem]" : "md:ml-60")}>
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-3 py-3 shadow-sm md:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 xl:max-w-none">
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  className="absolute left-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>

                <div className="min-w-0 w-full max-w-lg px-12 md:px-0">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search"
                      placeholder="Search jobs, companies, or roles…"
                      className="field-input w-full bg-slate-50 pl-9 py-1 text-sm"
                    />
                  </div>
                </div>

                <div className="absolute right-0 flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Signed in</p>
                    <p className="text-sm font-bold text-slate-800">{user?.name ?? "Riya"}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-600/30">
                    {(user?.name ?? "Riya").charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>


              <nav className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
                {navItems.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      clsx(
                        "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1 px-3 py-6 md:px-6 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
