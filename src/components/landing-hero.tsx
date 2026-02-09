"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music2, ArrowRight, Github } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-start/10 via-background to-accent-end/5" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-start/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-end/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight">Mousikē</span>
              <span className="text-xs text-muted leading-tight">moo-see-KAY</span>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </Link>
        </motion.nav>

        {/* Hero content */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm text-muted">Rehearse anytime, anywhere</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Rehearse with your band,
            <br />
            <span className="gradient-text">from anywhere</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10"
          >
            Record your parts asynchronously, playing along to your bandmates&apos;
            recordings. Perfect your performance without scheduling conflicts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button variant="gradient" size="xl" className="group">
                Start Rehearsing
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="xl">
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Waveform visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="glass-strong rounded-2xl p-8 shadow-2xl">
              <WaveformVisualization />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-start/20 to-accent-end/20 blur-xl -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Pre-computed heights for waveform visualization (deterministic)
const WAVEFORM_HEIGHTS = [
  0.65, 0.42, 0.78, 0.35, 0.52, 0.68, 0.45, 0.72, 0.38, 0.58,
  0.75, 0.48, 0.62, 0.32, 0.55, 0.70, 0.40, 0.65, 0.50, 0.72,
  0.38, 0.60, 0.45, 0.68, 0.35, 0.58, 0.75, 0.42, 0.62, 0.48,
  0.70, 0.52, 0.65, 0.38, 0.55, 0.78, 0.45, 0.68, 0.32, 0.60,
  0.72, 0.50, 0.62, 0.40, 0.75, 0.55, 0.48, 0.65, 0.35, 0.58,
  0.70, 0.42, 0.78, 0.52, 0.45, 0.68, 0.38, 0.60, 0.72, 0.48,
];

function WaveformVisualization() {
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {WAVEFORM_HEIGHTS.map((height, i) => {
        const delay = i * 0.02;

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-accent-end to-accent-start"
            initial={{ height: "20%" }}
            animate={{
              height: [`${20 + height * 60}%`, `${20 + (1 - height) * 60}%`, `${20 + height * 60}%`],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
