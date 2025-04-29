import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ActivityPlanner from "@/components/ActivityPlanner";
import ItineraryGenerator from "@/components/ItineraryGenerator/ItineraryGenerator";
import { WavyBackground } from "@/components/ui/wavy-background";
import PersonalityRecommender from "@/components/PersonalityRecommender";
import { LandmarksProvider } from '@/contexts/LandmarksContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string> | null>(null);

  const handlePersonalityComplete = (answers: Record<string, string>) => {
    setPersonalityAnswers(answers);
    setActiveTab("activity");
  };

  return (
    <LandmarksProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-sky-50">
        <Header />
        
        <main className="flex-1">
          <Tabs 
            value={activeTab}
            onValueChange={setActiveTab}
            className="container py-8"
          >
            {!personalityAnswers ? (
              <div className="mx-auto max-w-6xl text-center space-y-8">
                <WavyBackground className="max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent mb-6 [font-family:'Virgil',system-ui] animate-float">
                    Begin Your Travel Journey
                  </h1>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto [font-family:'Virgil',system-ui] squiggly-underline">
                    Take our personality quiz to discover your perfect European destinations and unlock personalized travel recommendations.
                  </p>
                </WavyBackground>
                
                <div className="mt-12 animate-float">
                  <PersonalityRecommender onComplete={handlePersonalityComplete} />
                </div>
              </div>
            ) : (
              <>
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-sky-50/50 rounded-full p-1 border-2 border-dashed border-sky-200">
                  <TabsTrigger 
                    value="activity"
                    className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sky-700 [font-family:'Virgil',system-ui]"
                  >
                    Activity Planner
                  </TabsTrigger>
                  <TabsTrigger 
                    value="itinerary"
                    className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sky-700 [font-family:'Virgil',system-ui]"
                  >
                    Itinerary Generator
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="animate-fade-in h-[calc(100vh-12rem)]">
                  <ActivityPlanner />
                </TabsContent>
                
                <TabsContent value="itinerary" className="animate-fade-in h-[calc(100vh-12rem)]">
                  <ItineraryGenerator />
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </LandmarksProvider>
  );
};

export default Index;
