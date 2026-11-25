export interface CropProfile {
  id: string;
  nameEn: string;
  nameYo: string;
  image: string;
}

// The six crops supported for Ogun State. Agronomic rules themselves live on
// the backend, not here. Photos are free-license Unsplash images stored
// locally under public/images/crops (see public/images/CREDITS.md).
export const CROP_PROFILES: CropProfile[] = [
  { id: "maize", nameEn: "Maize", nameYo: "Àgbàdo", image: "/images/crops/maize.jpg" },
  { id: "cassava", nameEn: "Cassava", nameYo: "Ẹgẹ́", image: "/images/crops/cassava.jpg" },
  { id: "tomato", nameEn: "Tomato", nameYo: "Tòmátì", image: "/images/crops/tomato.jpg" },
  { id: "pepper", nameEn: "Pepper", nameYo: "Ata", image: "/images/crops/pepper.jpg" },
  { id: "yam", nameEn: "Yam", nameYo: "Iṣu", image: "/images/crops/yam.jpg" },
  { id: "groundnut", nameEn: "Groundnut", nameYo: "Ẹ̀pà", image: "/images/crops/groundnut.jpg" },
];

export function cropImage(id: string): string {
  return CROP_PROFILES.find((c) => c.id === id)?.image ?? "/images/crops/maize.jpg";
}

export function cropName(id: string, language: "en" | "yo"): string {
  const crop = CROP_PROFILES.find((c) => c.id === id);
  if (!crop) return id;
  return language === "yo" ? crop.nameYo : crop.nameEn;
}
