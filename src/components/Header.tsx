
import React from 'react';
import { Compass, User, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-travel-teal" />
          <span className="text-xl font-bold text-travel-blue">Wanderlust Whisperer</span>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent>
                {/* Empty sheet content */}
              </SheetContent>
            </Sheet>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
