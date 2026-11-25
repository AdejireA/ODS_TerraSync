import { useState, type FormEvent } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { searchKnowledge, type InsightItem } from "../lib/api";
import { CROP_PROFILES, cropName } from "../data/crops";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState, EmptyState } from "../components/ui/StatusStates";

type Category = "crop_care" | "harvest" | "post_harvest" | "weather";
type LoadState = "idle" | "loading" | "ready" | "error";

const CATEGORIES: { value: Category | ""; key: string }[] = [
  { value: "", key: "knowledgeCategoryAll" },
  { value: "crop_care", key: "knowledgeCategoryCropCare" },
  { value: "harvest", key: "knowledgeCategoryHarvest" },
  { value: "post_harvest", key: "knowledgeCategoryPostHarvest" },
  { value: "weather", key: "knowledgeCategoryWeather" },
];

export function Knowledge() {
  const { t, language } = useLanguage();
  const [crop, setCrop] = useState(CROP_PROFILES[0].id);
  const [category, setCategory] = useState<Category | "">("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<InsightItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setLoadState("loading");
    try {
      const result = await searchKnowledge({ crop, category: category || undefined, q: query || undefined });
      setItems(result.items);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  return (
    <div className="shell-container space-y-section py-section">
      <PageHeader title={t("knowledgeTitle")} />

      <form onSubmit={handleSearch} className="space-y-field">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="rounded-md border border-border bg-card p-2"
          >
            {CROP_PROFILES.map((option) => (
              <option key={option.id} value={option.id}>{cropName(option.id, language)}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="rounded-md border border-border bg-card p-2"
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>{t(option.key as never)}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={t("knowledgeSearchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-md border border-border bg-card p-2"
          />
          <Button type="submit">{t("knowledgeTitle")}</Button>
        </div>
      </form>

      {loadState === "loading" && <LoadingState label={t("insightsLoading")} />}
      {loadState === "error" && <ErrorState label={t("insightsError")} />}
      {loadState === "ready" && items.length === 0 && <EmptyState label={t("knowledgeEmpty")} />}

      <div className="grid gap-row sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.rule_id} className="space-y-1">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-reading">{item.action}</p>
            <p className="text-metadata">{item.rationale}</p>
            {item.review_status !== "reviewed" && (
              <p className="text-metadata text-warning">{t("insightsUnreviewedNotice")}</p>
            )}
            <p className="text-metadata">
              {t("insightsSource")}:{" "}
              <a href={item.evidence.source_url} target="_blank" rel="noreferrer" className="underline">
                {item.evidence.source_title}
              </a>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
