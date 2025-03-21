export type SupportedLanguageCode = 'vi' | 'en' | 'ja' | 'zh';

export const getLanguageName = (languageCode: string): string => {
  const languageMap: Record<SupportedLanguageCode, string> = {
    vi: 'Vietnamese',
    en: 'English',
    ja: 'Japanese',
    zh: 'Chinese',
  };

  return languageMap[languageCode as SupportedLanguageCode] || languageCode;
};
