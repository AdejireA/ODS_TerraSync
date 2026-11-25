export interface CropProfile {
  id: string;
  nameEn: string;
  nameYo: string;
  icon: string;
}

// Matches the six crops carried over conceptually from the previous TerraSync
// product. Agronomic rules themselves live on the backend, not here.
export const CROP_PROFILES: CropProfile[] = [
  { id: "maize", nameEn: "Maize", nameYo: "Àgbàdo", icon: "🌽" },
  { id: "cassava", nameEn: "Cassava", nameYo: "Ẹgẹ́", icon: "🥔" },
  { id: "tomato", nameEn: "Tomato", nameYo: "Tòmátì", icon: "🍅" },
  { id: "pepper", nameEn: "Pepper", nameYo: "Ata", icon: "🌶️" },
  { id: "yam", nameEn: "Yam", nameYo: "Iṣu", icon: "🍠" },
  { id: "groundnut", nameEn: "Groundnut", nameYo: "Ẹ̀pà", icon: "🥜" },
];

export function cropName(id: string, language: "en" | "yo"): string {
  const crop = CROP_PROFILES.find((c) => c.id === id);
  if (!crop) return id;
  return language === "yo" ? crop.nameYo : crop.nameEn;
}
