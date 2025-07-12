const getDisplayLanguage = (lang: string) => {
  const languageMap = {
    en: 'English',
    vi: 'Vietnamese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
  };

  return languageMap[lang as keyof typeof languageMap] || 'Others';
};

export { getDisplayLanguage };
