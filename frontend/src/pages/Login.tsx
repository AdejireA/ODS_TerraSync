import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LanguageToggle } from "../components/LanguageToggle";

type Mode = "login" | "register";

export function Login() {
  const { t, language } = useLanguage();
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [coordinatorCode, setCoordinatorCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login({ phone, pin });
      } else {
        await register({
          phone,
          pin,
          name: name || undefined,
          language,
          role: isCoordinator ? "coordinator" : "farmer",
          coordinatorCode: isCoordinator ? coordinatorCode : undefined,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : null;
      setError(message ?? t(mode === "login" ? "authLoginError" : "authRegisterError"));
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-section px-page py-section">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="flex gap-2 rounded-md border border-border bg-card p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {t("authLoginTab")}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-md py-2 ${mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {t("authRegisterTab")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-field">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authPhone")}</span>
          <input
            required
            type="tel"
            placeholder={t("authPhonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-border bg-card p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authPin")}</span>
          <input
            required
            type="password"
            inputMode="numeric"
            pattern="\d{4,8}"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-md border border-border bg-card p-2"
          />
        </label>

        {mode === "register" && (
          <>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authName")}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-2"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={isCoordinator} onChange={(e) => setIsCoordinator(e.target.checked)} />
              {t("authAsCoordinator")}
            </label>

            {isCoordinator && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authCoordinatorCode")}</span>
                <input
                  required
                  type="text"
                  value={coordinatorCode}
                  onChange={(e) => setCoordinatorCode(e.target.value)}
                  className="w-full rounded-md border border-border bg-card p-2"
                />
              </label>
            )}
          </>
        )}

        {error && <p className="rounded-md bg-destructive-surface p-3 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("authSubmitting") : t(mode === "login" ? "authSubmitLogin" : "authSubmitRegister")}
        </Button>
      </form>

      <Card className="space-y-2">
        <p className="text-sm font-medium">{t("authWhyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("authWhyBody")}</p>
        <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
          {t("authContinueGuest")}
        </Button>
      </Card>
    </div>
  );
}
