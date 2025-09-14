import React, { useState, useEffect, useCallback } from 'react';
import type { Card, Language } from '../types';
import { RefreshIcon, TrashIcon } from './icons';
import { LANGUAGES } from '../constants';

interface StudyViewProps {
  cards: Card[];
  onDeleteCard: (id: string) => void;
}

const MemoCard: React.FC<{ card: Card; isRevealed: boolean }> = ({ card, isRevealed }) => {
    const getLanguageName = (code: string) => LANGUAGES.find(lang => lang.code === code)?.name || code;
    
    return (
        <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-8 perspective-1000">
             <div className={`relative w-full h-80 transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>
                {/* Card Front */}
                <div className="absolute w-full h-full backface-hidden bg-gray-700 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm text-indigo-400 font-semibold">{getLanguageName(card.targetLanguage)}</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{card.frontText}</h3>
                </div>

                {/* Card Back */}
                <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-lg p-6 overflow-y-auto rotate-y-180 flex flex-col gap-4">
                    {card.sourceLanguages.map(langCode => (
                        <div key={langCode}>
                            <h4 className="text-lg font-bold text-indigo-400">{getLanguageName(langCode)}</h4>
                            <p className="text-xl text-white mb-2">{card.translations[langCode]}</p>
                            <ul className="space-y-2 text-gray-300">
                                {card.examples[langCode]?.map((ex, i) => (
                                    <li key={i} className="pl-2 border-l-2 border-gray-700">
                                        <p>{ex.sentence}</p>
                                        <p className="text-sm text-gray-400 italic">"{ex.translation}"</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {card.notes && (
                        <div>
                            <h4 className="text-lg font-bold text-indigo-400">Notes</h4>
                            <p className="text-gray-300">{card.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const StudyView: React.FC<StudyViewProps> = ({ cards, onDeleteCard }) => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const selectRandomCard = useCallback(() => {
    if (cards.length === 0) {
      setCurrentCard(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentCard(cards[randomIndex]);
    setIsRevealed(false);
  }, [cards]);

  useEffect(() => {
    selectRandomCard();
  }, [selectRandomCard, cards]); // Rerun when cards array changes (e.g., after delete)

  const handleNextCard = () => {
    setIsSpinning(true);
    setTimeout(() => {
        selectRandomCard();
        setIsSpinning(false);
    }, 300);
  };
  
  const handleDelete = () => {
      if(!currentCard) return;
      if(window.confirm(`Are you sure you want to delete the card "${currentCard.frontText}"? This action cannot be undone.`)){
          onDeleteCard(currentCard.id);
      }
  }

  if (cards.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl">
        <h2 className="text-2xl font-bold text-white">No Cards For This Language!</h2>
        <p className="text-gray-400 mt-2">Add a card for this language or switch to another language to continue studying.</p>
      </div>
    );
  }

  if (!currentCard) {
    return null; // Should not happen if cards exist
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <MemoCard card={currentCard} isRevealed={isRevealed} />
      <div className="flex items-center gap-4">
        <button
            onClick={handleDelete}
            className="p-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-red-400 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-colors"
            aria-label="Delete Card"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextCard}
          className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors"
        >
          <RefreshIcon className="w-5 h-5" isSpinning={isSpinning}/>
          Next Card
        </button>
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-colors"
        >
          {isRevealed ? 'Hide' : 'Reveal'}
        </button>
      </div>
    </div>
  );
};

export default StudyView;
