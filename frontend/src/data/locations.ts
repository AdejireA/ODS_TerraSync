export interface StateProfile {
  name: string;
  lgas: string[];
}

// For the hackathon release, active coverage is Ogun State only. The other
// three states' data stays in STATE_PROFILES for future expansion but is
// disabled for selection rather than deleted.
export const ACTIVE_STATES: readonly string[] = ["Ogun"];

export function isStateActive(stateName: string): boolean {
  return ACTIVE_STATES.includes(stateName);
}

// Official LGA lists for TerraSync's four-state architecture. Ogun is the
// active hackathon-release state; Ondo, Osun and Lagos are retained for
// future expansion but disabled for selection in this release.
export const STATE_PROFILES: StateProfile[] = [
  {
    name: "Ogun",
    lgas: [
      "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North (Yewa North)",
      "Egbado South (Yewa South)", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North",
      "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia",
      "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Sagamu",
    ],
  },
  {
    name: "Ondo",
    lgas: [
      "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West",
      "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje",
      "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West",
      "Ose", "Owo",
    ],
  },
  {
    name: "Osun",
    lgas: [
      "Atakumosa East", "Atakumosa West", "Aiyedaade", "Aiyedire", "Boluwaduro",
      "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central",
      "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila",
      "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo",
      "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo",
    ],
  },
  {
    name: "Lagos",
    lgas: [
      "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
      "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe",
      "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu",
      "Surulere",
    ],
  },
];

export function getLgasForState(stateName: string): string[] {
  return STATE_PROFILES.find((state) => state.name === stateName)?.lgas ?? [];
}
