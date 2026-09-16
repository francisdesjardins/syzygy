export const frLngKey = "fr";
export const enLngKey = "en";

export const defaultNS = "common";
export const defaultLng = enLngKey;
export const supportedLngs = [enLngKey, frLngKey] as const;

import enCommon from "./translations/en/common.json" with { type: "json" };
import frCommon from "./translations/fr/common.json" with { type: "json" };

export const resources = {
  [enLngKey]: {
    common: enCommon,
  },
  [frLngKey]: {
    common: frCommon,
  },
} as const;
