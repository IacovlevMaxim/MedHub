// This file is only used on native platforms (iOS/Android)
// Do not import this on web
import * as Localization from 'expo-localization';

export const getMobileLanguage = (): string => {
  try {
    const locale = Localization.getLocales()[0]?.languageCode;
    return locale || 'ro';
  } catch {
    return 'ro';
  }
};
