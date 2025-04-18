
import React from "react";
import { cn } from "@/lib/utils";

interface WavyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WavyBackground({
  children,
  className,
  ...props
}: WavyBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-white py-20 px-8",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 w-full h-full bg-white">
        {/* Hand-drawn style circles with squiggly edges */}
        <svg
          className="absolute h-48 w-48 text-sky-50 opacity-50 -top-12 -left-12"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M50,10 
            C70,10 85,25 85,45 
            C85,65 70,80 50,80 
            C30,80 15,65 15,45 
            C15,25 30,10 50,10 
            Z"
            fill="currentColor"
            className="animate-[pulse_4s_ease-in-out_infinite]"
          />
        </svg>
        <svg
          className="absolute h-96 w-96 text-rose-50 opacity-50 -bottom-24 -right-24"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M50,20 
            C65,20 80,35 80,50 
            C80,65 65,80 50,80 
            C35,80 20,65 20,50 
            C20,35 35,20 50,20 
            Z"
            fill="currentColor"
            className="animate-[pulse_5s_ease-in-out_infinite]"
          />
        </svg>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
