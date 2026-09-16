import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { defaultNS, defaultLng, resources, supportedLngs } from "./i18n/config";
import { handleMisusedPromise } from "./utils/handleMisusedPromise";
import { isDevelopmentEnv } from "./utils/isDevelopmentEnv";

handleMisusedPromise(() =>
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: isDevelopmentEnv(),
      fallbackLng: defaultLng,
      interpolation: {
        escapeValue: false,
      },
      defaultNS,
      resources,
      supportedLngs,
    }),
)();

export async function changeLanguage(lng: (typeof supportedLngs)[number]) {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(lng);
    return;
  }
  const handleInit = handleMisusedPromise(async () => {
    i18n.off("initialized", handleInit);
    await i18n.changeLanguage(lng);
  });
  i18n.on("initialized", handleInit);
}

export default i18n;
