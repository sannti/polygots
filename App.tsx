import React, { useState, useEffect, useCallback } from 'react';
import type { Card, Settings } from './types';
import AddCardForm from './components/AddCardForm';
import StudyView from './components/StudyView';
import SettingsView from './components/SettingsView';
import Auth from './components/Auth';
import { PlusIcon, BookOpenIcon, CogIcon, RefreshIcon, LogOutIcon } from './components/icons';
import * as dataService from './services/db/dataService';
import { supabase } from './services/db/supabaseClient';
import type { Session } from '@supabase/supabase-js';


type View = 'study' | 'add' | 'settings';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [view, setView] = useState<View>('study');
  const [settings, setSettings] = useState<Settings>({ 
    targetLanguage: 'es', 
    sourceLanguages: ['en'] 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultSettings: Settings = { targetLanguage: 'es', sourceLanguages: ['en'] };
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
    });

    return () => subscription.unsubscribe();
  }, []);


  // Load data from Supabase on initial render
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dbCards, dbSettings] = await Promise.all([
        dataService.getCards(),
        dataService.getSettings()
      ]);
      setCards(dbCards);
      setSettings(dbSettings || defaultSettings);
    } catch (err: any) {
      console.error("Failed to load data from database:", err);
      setError("Could not connect to the database. Please check your configuration and network connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(session) {
      loadData();
    }
  }, [session, loadData]);


  const handleAddCard = async (newCardData: Omit<Card, 'id' | 'created_at'>) => {
    try {
      const savedCard = await dataService.addCard(newCardData);
      setCards(prevCards => [savedCard, ...prevCards]);
      setView('study');
    } catch(err) {
      console.error("Failed to add card:", err);
      setError("Failed to save the new card. Please try again.");
    }
  };
  
  const handleSaveSettings = async (newSettings: Settings) => {
    try {
      const savedSettings = await dataService.saveSettings(newSettings);
      setSettings(savedSettings);
      setView('study');
    } catch (err) {
       console.error("Failed to save settings:", err);
       setError("Failed to save settings. Please try again.");
    }
  }

  const handleDeleteCard = async (idToDelete: string) => {
    // Optimistic UI update
    const originalCards = cards;
    setCards(prevCards => prevCards.filter(card => card.id !== idToDelete));
    
    try {
      await dataService.deleteCard(idToDelete);
    } catch (err) {
      console.error("Failed to delete card:", err);
      setError("Failed to delete the card. Reverting changes.");
      // Revert on failure
      setCards(originalCards);
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) {
        console.error("Error logging out:", error);
        setError("Failed to log out. Please try again.");
    }
  }
  
  const filteredCards = cards.filter(card => card.targetLanguage === settings.targetLanguage);

  const NavButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex flex-1 justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  const renderContent = () => {
    if(isLoading && session) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <RefreshIcon className="w-12 h-12 text-gray-500 animate-spin" />
            <p className="mt-4 text-lg text-gray-400">Loading your data...</p>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="max-w-xl mx-auto p-6 bg-red-900/50 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-red-300 mt-2">{error}</p>
        </div>
      );
    }

    switch(view) {
      case 'add':
        return <AddCardForm onAddCard={handleAddCard} targetLanguage={settings.targetLanguage} sourceLanguages={settings.sourceLanguages} />;
      case 'study':
        return <StudyView cards={filteredCards} onDeleteCard={handleDeleteCard}/>;
      case 'settings':
         return <SettingsView currentSettings={settings} onSave={handleSaveSettings} />;
      default:
        return null;
    }
  }

  if (!session) {
    return <Auth />;
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
      
      <div className="w-full max-w-lg mx-auto mb-8">
        <div className="flex items-center gap-2">
            <nav className="flex-grow flex justify-center items-center gap-2 bg-gray-800 p-2 rounded-xl shadow-md">
                <NavButton active={view === 'study'} onClick={() => setView('study')}>
                  <BookOpenIcon className="w-5 h-5" />
                  Study
                </NavButton>
                <NavButton active={view === 'add'} onClick={() => setView('add')}>
                  <PlusIcon className="w-5 h-5" />
                  Add Card
                </NavButton>
                 <NavButton active={view === 'settings'} onClick={() => setView('settings')}>
                  <CogIcon className="w-5 h-5" />
                  Settings
                </NavButton>
            </nav>
            <button
                onClick={handleLogout}
                className="p-3 bg-gray-800 rounded-xl shadow-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Log Out"
            >
                <LogOutIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <main className="w-full max-w-4xl flex-grow flex justify-center">
        {renderContent()}
      </main>
      
      <footer className="w-full text-center mt-8 text-gray-500 text-sm">
          <p>Logged in as {session.user.email}</p>
      </footer>
    </div>
  );
};

export default App;
