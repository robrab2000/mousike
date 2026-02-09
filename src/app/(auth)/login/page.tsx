"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music2, Github } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-start/5 via-background to-accent-end/5" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent-start/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-accent-end/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card glass className="border-border/50">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
                <Music2 className="h-6 w-6 text-white" />
              </div>
            </Link>
            <CardTitle className="text-2xl">Welcome to Mousikē</CardTitle>
            <p className="text-xs text-muted-foreground italic">/moo-see-KAY/</p>
            <CardDescription className="mt-2">
              Sign in to start rehearsing with your band
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Github className="h-5 w-5 mr-2" />
              Continue with GitHub
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
