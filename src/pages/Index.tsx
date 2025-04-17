
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import PersonalityRecommender from "@/components/PersonalityRecommender";
import ActivityPlanner from "@/components/ActivityPlanner";
import { CompassIcon, UserIcon } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Tabs 
          defaultValue="home" 
          className="container py-8"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="personality">Personality Based</TabsTrigger>
            <TabsTrigger value="activity">Activity Based</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="animate-fade-in">
            <div className="mx-auto max-w-6xl text-center space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-travel-blue">
                Discover Europe, <span className="text-travel-teal">Your Way</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your personalized travel companion for exploring Europe's hidden gems and iconic landmarks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <Card className="bg-gradient-to-br from-travel-blue/10 to-travel-teal/10 border-travel-blue/20 hover:shadow-md transition-all">
                  <CardContent className="p-8 flex flex-col items-center">
                    <div className="rounded-full bg-travel-blue/10 p-4 mb-4">
                      <UserIcon className="h-8 w-8 text-travel-blue" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Not Sure Where to Go?</h2>
                    <p className="text-muted-foreground mb-6 text-center">
                      Take our personality quiz and get customized destination recommendations based on your preferences.
                    </p>
                    <Button onClick={() => setActiveTab("personality")} size="lg" className="bg-travel-blue hover:bg-travel-blue/90">
                      Find My Perfect Destination
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-travel-teal/10 to-travel-orange/10 border-travel-teal/20 hover:shadow-md transition-all">
                  <CardContent className="p-8 flex flex-col items-center">
                    <div className="rounded-full bg-travel-teal/10 p-4 mb-4">
                      <CompassIcon className="h-8 w-8 text-travel-teal" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Know What You Want?</h2>
                    <p className="text-muted-foreground mb-6 text-center">
                      Plan your European adventure based on activities and interests, from wine tasting to hiking.
                    </p>
                    <Button onClick={() => setActiveTab("activity")} size="lg" className="bg-travel-teal hover:bg-travel-teal/90">
                      Plan by Activities
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-6">
                  <div className="rounded-full bg-travel-blue/10 p-4 mb-4">
                    <span className="text-2xl font-bold text-travel-blue">1</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Choose Your Path</h3>
                  <p className="text-sm text-muted-foreground">
                    Decide whether to discover destinations based on your personality or plan by activities.
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-6">
                  <div className="rounded-full bg-travel-blue/10 p-4 mb-4">
                    <span className="text-2xl font-bold text-travel-blue">2</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Get Personalized Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive tailored recommendations and explore the interactive map.
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-6">
                  <div className="rounded-full bg-travel-blue/10 p-4 mb-4">
                    <span className="text-2xl font-bold text-travel-blue">3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Plan Your Adventure</h3>
                  <p className="text-sm text-muted-foreground">
                    Dive deeper into destinations, get detailed information, and create your perfect itinerary.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="personality" className="animate-fade-in">
            <PersonalityRecommender />
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
