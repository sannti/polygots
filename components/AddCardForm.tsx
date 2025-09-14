import React, { useState } from 'react';
import type { Card } from '../types';
import aiAdapter from '../services/ai';
import { SparklesIcon } from './icons';
import { LANGUAGES } from '../constants';

interface AddCardFormProps {
  onAddCard: (card: Omit<Card, 'id' | 'created_at'>) => void;
  targetLanguage: string;
  sourceLanguages: string[];
}

const AddCardForm: React.FC<AddCardFormProps> = ({ onAddCard, targetLanguage, sourceLanguages }) => {
  const [frontText, setFrontText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isFormValid = frontText.trim() !== '' && targetLanguage !== '' && sourceLanguages.length > 0;
  const targetLanguageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
  const sourceLanguageNames = sourceLanguages.map(code => LANGUAGES.find(l => l.code === code)?.name || code).join(', ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      const { translations, examples, notes } = await aiAdapter.generateCardDetails(frontText, targetLanguage, sourceLanguages);
      const newCard: Omit<Card, 'id' | 'created_at'> = {
        frontText,
        targetLanguage: targetLanguage,
        sourceLanguages,
        translations,
        examples,
        notes,
      };
      onAddCard(newCard);
      setFrontText('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center text-white">Add a New Memo Card</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Word or Phrase (in {targetLanguageName})
          </label>
          <input
            id="frontText"
            type="text"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            placeholder={`e.g., 'aprender'`}
            disabled={isLoading}
            className="block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 py-2 px-3 disabled:opacity-50"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-400 mb-2">
            Generating translations for:
          </label>
          <p className="block w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-gray-300 text-sm">
            {sourceLanguageNames}
          </p>
        </div>
        
        {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              Generating...
            </>
          ) : (
             <>
              <SparklesIcon className="w-5 h-5" />
              Generate & Save Card
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCardForm;
