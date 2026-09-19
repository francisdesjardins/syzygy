import { useTranslation } from '../i18n';

/**
 * The language, and the one control that changes it.
 *
 * It kept its own `localStorage` copy beside the detector's and wrote `<html lang>` itself, which
 * is how the attribute came to disagree with the effect that also wrote it. One owner now.
 */
export const useLanguage = () => {
  const { language, setLanguage } = useTranslation();

  return {
    isEnglish: language === 'en',
    toggle: () => {
      setLanguage(language === 'en' ? 'fr' : 'en');
    },
  };
};
