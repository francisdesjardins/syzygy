import { useState } from "react";

import { changeLanguage } from "../i18n";

export const useLanguage = () => {
  const [isEnglish, setIsEnglish] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved ? saved === "en" : true;
  });

  const toggle = async () => {
    const newLang = !isEnglish ? "en" : "fr";
    await changeLanguage(newLang);
    localStorage.setItem("language", newLang);

    // Update the HTML lang attribute to match the selected language
    document.documentElement.lang = newLang === "en" ? "en-CA" : "fr-CA";

    setIsEnglish(!isEnglish);
  };

  return { isEnglish, toggle };
};
