"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

interface AnimatedContainerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, delay = 0, duration = 0.4, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

export const SlideIn = forwardRef<HTMLDivElement, AnimatedContainerProps & { direction?: "left" | "right" | "up" | "down" }>(
  ({ children, delay = 0, duration = 0.4, direction = "up", className, ...props }, ref) => {
    const directionOffset = {
      left: { x: -20, y: 0 },
      right: { x: 20, y: 0 },
      up: { x: 0, y: 20 },
      down: { x: 0, y: -20 },
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...directionOffset[direction] }}
        transition={{ duration, delay, ease: "easeOut" }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideIn.displayName = "SlideIn";

export const ScaleIn = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, delay = 0, duration = 0.3, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = "ScaleIn";

export const Stagger = ({
  children,
  staggerDelay = 0.1,
  className,
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    className={className}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {children}
  </motion.div>
);

export const PulsingDot = ({ className, color = "recording" }: { className?: string; color?: "recording" | "success" | "accent" }) => {
  const colorClasses = {
    recording: "bg-recording",
    success: "bg-success",
    accent: "bg-accent",
  };

  return (
    <span className={cn("relative flex h-3 w-3", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          colorClasses[color]
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-3 w-3 rounded-full",
          colorClasses[color]
        )}
      />
    </span>
  );
};
