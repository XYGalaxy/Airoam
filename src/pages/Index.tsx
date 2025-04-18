
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import PersonalityRecommender from "@/components/PersonalityRecommender";
import ActivityPlanner from "@/components/ActivityPlanner";
import DestinationResults from "@/components/DestinationResults";
import { CompassIcon, UserIcon } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string> | null>(null);

  const handlePersonalityComplete = (answers: Record<string, string>) => {
    setPersonalityAnswers(answers);
    setActiveTab("personality");
  };

  // Show different tabs based on quiz completion
  const renderTabs = () => {
    if (!personalityAnswers) {
      return (
        <TabsList className="grid w-full grid-cols-1 mb-8">
          <TabsTrigger value="home">Start Your Journey</TabsTrigger>
        </TabsList>
      );
    }

    return (
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="personality">Personality Based</TabsTrigger>
        <TabsTrigger value="activity">Activity Based</TabsTrigger>
      </TabsList>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Tabs 
          value={activeTab}
          onValueChange={setActiveTab}
          className="container py-8"
        >
          {renderTabs()}
          
          <TabsContent value="home" className="animate-fade-in">
            <div className="mx-auto max-w-6xl text-center space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-travel-blue">
                Begin Your Travel Journey
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Take our personality quiz to discover your perfect European destinations and unlock personalized travel recommendations.
              </p>
              
              <div className="mt-12">
                <PersonalityRecommender onComplete={handlePersonalityComplete} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="personality" className="animate-fade-in">
            {personalityAnswers && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-travel-blue mb-4">Your Personalized Recommendations</h2>
                  <p className="text-lg text-muted-foreground">Based on your personality profile, here are destinations that match your travel style.</p>
                </div>
                <DestinationResults personalityAnswers={personalityAnswers} onReset={() => setActiveTab("home")} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="animate-fade-in">
            <ActivityPlanner />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-6 bg-muted/40">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Wanderlust Whisperer. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
