import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalityType {
  type: string;
  code: string;
  primaryTraits: string[];
  characterProfile: {
    travelStyle: string;
    keyMotivations: string[];
    challengeAreas: string[];
  };
  dimensionPreferences: {
    budget: string;
    experience: string;
    logistics: string;
    social: string;
    emotional: string;
  };
  reportStyle: {
    tone: string;
    focus: string;
    detailLevel: string;
    languageStyle: string;
    emphasis: string[];
    recommendations: string;
  };
}

interface PersonalityContextType {
  personality: PersonalityType | null;
  setPersonality: (personality: PersonalityType | null) => void;
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export const PersonalityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personality, setPersonality] = useState<PersonalityType | null>(null);

  return (
    <PersonalityContext.Provider value={{ personality, setPersonality }}>
      {children}
    </PersonalityContext.Provider>
  );
};

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
}; 