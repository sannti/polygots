import type { Translations, Examples } from '../../types';

export interface CardGenerationResult {
  translations: Translations;
  examples: Examples;
  notes?: string;
}

export interface AiAdapter {
  generateCardDetails(
    frontText: string,
    targetLanguage: string,
    sourceLanguages: string[]
  ): Promise<CardGenerationResult>;
}
