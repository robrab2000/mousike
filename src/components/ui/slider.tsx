"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  showGradient?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      className,
      disabled = false,
      showGradient = true,
    },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn("relative w-full", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 appearance-none cursor-pointer bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: showGradient
              ? `linear-gradient(to right, var(--accent-start) 0%, var(--accent-end) ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`
              : `linear-gradient(to right, var(--muted) 0%, var(--muted) ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`,
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            transition: transform 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          input[type="range"]::-webkit-slider-runnable-track {
            height: 8px;
            border-radius: 4px;
          }
          input[type="range"]::-moz-range-track {
            height: 8px;
            border-radius: 4px;
          }
        `}</style>
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
