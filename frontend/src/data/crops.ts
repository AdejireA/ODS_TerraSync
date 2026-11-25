export interface CropProfile {
  id: string;
  nameEn: string;
  nameYo: string;
}

// Matches the six crops carried over conceptually from the previous TerraSync
// product. Agronomic rules themselves live on the backend, not here.
export const CROP_PROFILES: CropProfile[] = [
  { id: "maize", nameEn: "Maize", nameYo: "Àgbàdo" },
  { id: "cassava", nameEn: "Cassava", nameYo: "Ẹgẹ́" },
  { id: "tomato", nameEn: "Tomato", nameYo: "Tòmátì" },
  { id: "pepper", nameEn: "Pepper", nameYo: "Ata" },
  { id: "yam", nameEn: "Yam", nameYo: "Iṣu" },
  { id: "groundnut", nameEn: "Groundnut", nameYo: "Ẹ̀pà" },
];

export function cropName(id: string, language: "en" | "yo"): string {
  const crop = CROP_PROFILES.find((c) => c.id === id);
  if (!crop) return id;
  return language === "yo" ? crop.nameYo : crop.nameEn;
}
