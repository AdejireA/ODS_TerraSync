import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { cropName } from "../data/crops";
import { areaUnitKey, datePrecisionKey, plantingStatusKey } from "../data/farmOptions";
import { getGuidance, type GuidanceItem } from "../lib/api";
import { FEATURES } from "../lib/featureFlags";
import { Card } from "../components/ui/Card";
import { ErrorState, LoadingState, NotAvailableState } from "../components/ui/StatusStates";

export function CropDetail() {
  const { cropId = "" } = useParams();
  const { t, language } = useLanguage();
  const { profile } = useFarm();

  const [guidance, setGuidance] = useState<GuidanceItem[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!FEATURES.cropAdvisory) return;
    let cancelled = false;
    setStatus("loading");
    getGuidance(cropId, language)
      .then((result) => {
        if (cancelled) return;
        setGuidance(result.items);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [cropId, language]);

  const record = profile?.crops.find((crop) => crop.cropId === cropId);

  return (
    <div className="app-container space-y-section py-section">
      <Link to="/dashboard" className="text-sm font-medium text-primary underline">
        ← {t("cropDetailBack")}
      </Link>

      <h2 className="text-page-title text-primary">{cropName(cropId, language)}</h2>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("cropDetailMyRecords")}</h3>
        {record ? (
          <Card className="space-y-1">
            <p className="text-sm">{t(plantingStatusKey(record.status))}</p>
            {record.plantingDate && (
              <p className="text-metadata">
                {record.plantingDate} ({t(datePrecisionKey(record.plantingDatePrecision))})
              </p>
            )}
            {record.variety && (
              <p className="text-metadata">{t("cropDetailVariety")}: {record.variety}</p>
            )}
            {record.plantedArea != null && (
              <p className="text-metadata">
                {t("cropDetailPlantedArea")}: {record.plantedArea}{" "}
                {record.plantedAreaUnit ? t(areaUnitKey(record.plantedAreaUnit)) : ""}
              </p>
            )}
          </Card>
        ) : (
          <NotAvailableState label={t("cropDetailNoRecord")} />
        )}
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("cropDetailGuidanceTitle")}</h3>
        {!FEATURES.cropAdvisory && <NotAvailableState label={t("notAvailableCropAdvisory")} />}
        {FEATURES.cropAdvisory && status === "loading" && (
          <LoadingState label={t("cropDetailGuidanceLoading")} />
        )}
        {FEATURES.cropAdvisory && status === "error" && (
          <ErrorState label={t("cropDetailGuidanceError")} />
        )}
        {FEATURES.cropAdvisory && status === "ready" && guidance && guidance.length === 0 && (
          <NotAvailableState label={t("cropDetailGuidanceEmpty")} />
        )}
        {FEATURES.cropAdvisory && status === "ready" && guidance && guidance.length > 0 && (
          <div className="space-y-2">
            {guidance.map((item, index) => (
              <Card key={index} className="space-y-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-reading">{item.content}</p>
                {item.source_url && (
                  <p className="text-metadata">
                    {t("cropDetailSource")}:{" "}
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="underline">
                      {item.source_url}
                    </a>
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
