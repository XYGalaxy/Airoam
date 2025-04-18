
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
        <svg
          className="absolute h-48 w-48 text-sky-50 opacity-50 -top-12 -left-12"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle cx="50" cy="50" r="40" />
        </svg>
        <svg
          className="absolute h-96 w-96 text-rose-50 opacity-50 -bottom-24 -right-24"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
