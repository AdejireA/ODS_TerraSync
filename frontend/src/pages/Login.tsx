import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LanguageToggle } from "../components/LanguageToggle";

type Mode = "login" | "register";

const PHONE_PATTERN = /^(\+?\d[\d\s-]{6,14}\d)$/;
const PIN_PATTERN = /^\d{4,8}$/;

export function Login() {
  const { t, language } = useLanguage();
  const { login, register, loading, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [coordinatorCode, setCoordinatorCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; pin?: string }>({});

  function validate(): boolean {
    const next: { phone?: string; pin?: string } = {};
    if (!PHONE_PATTERN.test(phone.trim())) next.phone = t("authPhoneInvalid");
    if (!PIN_PATTERN.test(pin)) next.pin = t("authPinInvalid");
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
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
      navigate(redirectTo, { replace: true });
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

      {sessionExpired && (
        <p className="rounded-md bg-warning-surface p-3 text-sm text-warning">{t("authSessionExpired")}</p>
      )}

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

      <form onSubmit={handleSubmit} noValidate className="space-y-field">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authPhone")}</span>
          <input
            required
            type="tel"
            autoComplete="tel"
            placeholder={t("authPhonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            className="w-full rounded-md border border-border bg-card p-2"
          />
          {fieldErrors.phone && (
            <p id="phone-error" role="alert" className="mt-1 text-sm text-destructive">{fieldErrors.phone}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authPin")}</span>
          <div className="relative">
            <input
              required
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              pattern="\d{4,8}"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              aria-invalid={Boolean(fieldErrors.pin)}
              aria-describedby={fieldErrors.pin ? "pin-error" : undefined}
              className="w-full rounded-md border border-border bg-card p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              aria-label={t(showPin ? "authHidePin" : "authShowPin")}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground"
            >
              {showPin ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.pin && (
            <p id="pin-error" role="alert" className="mt-1 text-sm text-destructive">{fieldErrors.pin}</p>
          )}
        </label>

        {mode === "register" && (
          <>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("authName")}</span>
              <input
                type="text"
                autoComplete="name"
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

        {error && (
          <p role="alert" className="rounded-md bg-destructive-surface p-3 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("authSubmitting") : t(mode === "login" ? "authSubmitLogin" : "authSubmitRegister")}
        </Button>
      </form>

      <Card className="space-y-2">
        <p className="text-sm font-medium">{t("authWhyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("authWhyBody")}</p>
        <Button variant="outline" className="w-full" onClick={() => navigate(redirectTo, { replace: true })}>
          {t("authContinueGuest")}
        </Button>
      </Card>
    </div>
  );
}
