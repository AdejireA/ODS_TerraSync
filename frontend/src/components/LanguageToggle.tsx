import { useLanguage } from "../contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-primary bg-card p-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 transition ${
          language === "en" ? "bg-primary text-primary-foreground" : "text-primary"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("yo")}
        className={`rounded-full px-3 py-1 transition ${
          language === "yo" ? "bg-primary text-primary-foreground" : "text-primary"
        }`}
      >
        Yorùbá
      </button>
    </div>
  );
}
