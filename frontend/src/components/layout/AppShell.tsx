import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CloudSun,
  Home,
  ListChecks,
  LogIn,
  Mic,
  MoreHorizontal,
  Phone,
  Settings as SettingsIcon,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import type { TranslationKey } from "../../i18n/translations";
import { LanguageToggle } from "../LanguageToggle";

interface NavItem {
  key: TranslationKey;
  to?: string;
  icon: LucideIcon;
}

const sidebarItems: NavItem[] = [
  { key: "navOverview", to: "/dashboard", icon: Home },
  { key: "navMyFarm", to: "/onboarding", icon: Sprout },
  { key: "navWeather", icon: CloudSun },
  { key: "navFarmTasks", to: "/tasks", icon: ListChecks },
  { key: "navKnowledge", to: "/knowledge", icon: BookOpen },
  { key: "navVoiceAssistant", to: "/voice", icon: Mic },
  { key: "navHarvest", to: "/harvest/report", icon: Wheat },
  { key: "navProduceBoard", to: "/harvest/board", icon: ListChecks },
  { key: "navSettings", to: "/settings", icon: SettingsIcon },
];

const mobileItems: NavItem[] = [
  { key: "navHome", to: "/dashboard", icon: Home },
  { key: "navFarmShort", to: "/onboarding", icon: Sprout },
  { key: "navCall", to: "/voice", icon: Phone },
  { key: "navHarvest", to: "/harvest/report", icon: Wheat },
  { key: "navMore", to: "/more", icon: MoreHorizontal },
];

export function AppShell() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <span className="text-lg font-bold text-primary">{t("appTitle")}</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {t(item.key)}
              </NavLink>
            ) : (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60"
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {t(item.key)}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                  {t("comingSoon")}
                </span>
              </div>
            ),
          )}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
          <div className="shell-container flex h-16 items-center justify-between">
            <h1 className="text-lg font-bold text-primary lg:hidden">{t("appTitle")}</h1>
            <span className="hidden text-sm font-medium text-muted-foreground lg:inline" />
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="hidden text-sm font-medium text-muted-foreground sm:inline"
                >
                  {user?.name || user?.phone}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login", { state: { from: location.pathname } })}
                  className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  {t("authLogin")}
                </button>
              )}
              <LanguageToggle />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card lg:hidden">
        <div className="flex">
          {mobileItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to!}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {t(item.key)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
