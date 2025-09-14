import { GoogleGenAI, Type } from "@google/genai";
import { LANGUAGES } from '../../constants';
import type { Translations, Examples, Example } from '../../types';
import type { AiAdapter, CardGenerationResult } from './types';

const PLACEHOLDER_API_KEY = 'placeholder_key';

export class GeminiAdapter implements AiAdapter {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || PLACEHOLDER_API_KEY;

    if (this.apiKey === PLACEHOLDER_API_KEY) {
      console.warn(
`*********************************************************************************
* Gemini API Key (API_KEY) is not set. The app will not be able to generate     *
* card details. AI-powered features will fail.                                *
*********************************************************************************`
      );
    }
    
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }
  
  private responseSchema = {
    type: Type.OBJECT,
    properties: {
        translations: {
            type: Type.ARRAY,
            description: "An array of translation objects. Each object must contain a language code and the corresponding translation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    languageCode: { type: Type.STRING, description: "The source language code (e.g., 'en', 'fr')." },
                    translation: { type: Type.STRING, description: "The single best translation in that language." }
                },
                required: ['languageCode', 'translation']
            }
        },
        examples: {
            type: Type.ARRAY,
            description: "An array of example objects. Each object must contain a language code and a list of 2-4 example sentences with their translations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    languageCode: { type: Type.STRING, description: "The source language code (e.g., 'en', 'fr')." },
                    sentences: {
                        type: Type.ARRAY,
                        items: {
                           type: Type.OBJECT,
                           properties: {
                               sentence: { type: Type.STRING, description: "An example sentence in the source language." },
                               translation: { type: Type.STRING, description: "The translation of the example sentence into the target language." }
                           },
                           required: ['sentence', 'translation']
                        },
                        description: "An array of 2-4 example sentences."
                    }
                },
                required: ['languageCode', 'sentences']
            }
        },
        notes: {
            type: Type.STRING,
            description: "Optional. Brief grammar or usage notes, like 'verb, infinitive' or 'noun, masculine'."
        }
    },
    required: ['translations', 'examples']
  };

  private getLanguageName(code: string): string {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  }

  async generateCardDetails(
    frontText: string,
    targetLanguage: string,
    sourceLanguages: string[]
  ): Promise<CardGenerationResult> {
     if (this.apiKey === PLACEHOLDER_API_KEY) {
        throw new Error("Gemini AI is not configured. Please set the API_KEY environment variable.");
     }

    try {
      const targetLangName = this.getLanguageName(targetLanguage);
      const sourceLangNames = sourceLanguages.map(this.getLanguageName).join(', ');

      const systemInstruction = `You are an expert linguist. Your task is to generate learning materials for a flashcard. The user provides a word/phrase, its language (target language), and a list of languages they know (source languages). You must provide translations and 2-4 example sentences for each source language. Crucially, for each example sentence, you MUST also provide its translation into the target language (${targetLangName}). Respond ONLY with a valid JSON object that adheres to the provided schema. The 'translations' and 'examples' fields must be arrays of objects. For 'translations', each object in the array must have a 'languageCode' and a 'translation'. For 'examples', each object in the array must have a 'languageCode' and a 'sentences' array. Each object in the 'sentences' array must have a 'sentence' and its corresponding 'translation'. Do not include any extra text, explanations, or markdown formatting.`;
      const prompt = `Word/Phrase: "${frontText}"\nTarget Language: ${targetLangName} (${targetLanguage})\nSource Languages: ${sourceLangNames} (${sourceLanguages.join(', ')})`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: this.responseSchema,
        },
      });

      const jsonText = response.text.trim();
      const parsedData = JSON.parse(jsonText);

      // FIX: Corrected typo from `parsed.examples` to `parsedData.examples`.
      if (!parsedData.translations || !Array.isArray(parsedData.translations) || !parsedData.examples || !Array.isArray(parsedData.examples)) {
          throw new Error("Invalid JSON structure received from API.");
      }
      
      const translations: Translations = parsedData.translations.reduce((acc: Translations, item: { languageCode: string, translation: string }) => {
          if(item.languageCode && item.translation) acc[item.languageCode] = item.translation;
          return acc;
      }, {});

      const examples: Examples = parsedData.examples.reduce((acc: Examples, item: { languageCode: string, sentences: Example[] }) => {
          if(item.languageCode && item.sentences) acc[item.languageCode] = item.sentences;
          return acc;
      }, {});

      return {
        translations,
        examples,
        notes: parsedData.notes,
      };

    } catch (error) {
      console.error("Error generating card details from Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`Failed to generate card details from AI: ${error.message}`);
      }
      throw new Error("An unknown error occurred while communicating with the AI.");
    }
  }
}