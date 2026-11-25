import { NavLink, Outlet } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { LanguageToggle } from "../LanguageToggle";

const navItems = [
  { to: "/dashboard", key: "navHome" as const },
  { to: "/harvest/report", key: "navReport" as const },
  { to: "/harvest/board", key: "navBoard" as const },
  { to: "/voice", key: "navVoice" as const },
];

export function AppShell() {
  const { t } = useLanguage();

  return (
    <div className="min-h-dvh bg-background pb-20">
      <header className="border-b border-border bg-card p-4">
        <div className="app-container flex items-center justify-between !max-w-none">
          <h1 className="text-lg font-bold text-primary">{t("appTitle")}</h1>
          <LanguageToggle />
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card">
        <div className="app-container flex !max-w-none">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-xs font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
