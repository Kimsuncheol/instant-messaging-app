/**
 * Translation Service using Google Cloud Translation API
 */

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ko", label: "Korean" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ru", label: "Russian" },
] as const;

/**
 * Translate text using Google Cloud Translation API
 * @param text - Text to translate
 * @param targetLanguage - Target language code (e.g., 'ko', 'es')
 * @param sourceLanguage - Optional source language code (auto-detected if not provided)
 * @returns Translated text and detected source language
 */
export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google Translate API key is not configured");
  }

  if (!text || !text.trim()) {
    throw new Error("Text to translate cannot be empty");
  }

  try {
    const url = new URL("https://translation.googleapis.com/language/translate/v2");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", text);
    url.searchParams.set("target", targetLanguage);
    
    if (sourceLanguage) {
      url.searchParams.set("source", sourceLanguage);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Translation failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    
    if (!data.data?.translations?.[0]) {
      throw new Error("Invalid translation response");
    }

    const translation = data.data.translations[0];
    
    return {
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to translate text");
  }
};

/**
 * Get language name from language code
 */
export const getLanguageName = (code: string): string => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.value === code);
  return language?.label || code;
};
