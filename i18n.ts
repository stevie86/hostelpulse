// Simplified i18n config for Next.js 12 compatibility
export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

// Mock implementation - in a real app, this would handle internationalization
export const getMessages = async (locale: string) => {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Fallback to English if locale file doesn't exist
    return (await import('./messages/en.json')).default;
  }
};