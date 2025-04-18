
import React from 'react';
import { Compass, User, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-100">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-sky-500 transform rotate-12 hover:rotate-0 transition-transform duration-300" />
          <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent [font-family:'Virgil',system-ui] hover:scale-105 transition-transform">
            Wanderlust Whisperer
          </span>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon" className="md:hidden relative overflow-hidden group">
            <Sheet>
              <SheetTrigger asChild>
                <Menu className="h-5 w-5 text-slate-600 group-hover:scale-110 transition-transform" />
              </SheetTrigger>
              <SheetContent className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="px-4">
                    <h2 className="text-lg font-semibold mb-4 [font-family:'Virgil',system-ui]">Menu</h2>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-sky-50 hover:text-sky-600 group relative overflow-hidden"
          >
            <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute inset-0 border-2 border-dashed border-sky-200 rounded-full scale-0 group-hover:scale-100 transition-transform" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
