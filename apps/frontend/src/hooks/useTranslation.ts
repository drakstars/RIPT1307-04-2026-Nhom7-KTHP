import { useSettingsStore } from '@/stores/settings.store';
import { translations, TranslationKey } from '@/utils/i18n';

export function useTranslation() {
  const language = useSettingsStore(state => state.language || 'vi');
  const setLanguage = useSettingsStore(state => state.setLanguage);

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] ?? translations['en']?.[key] ?? String(key);
  };

  return { t, language, setLanguage };
}
