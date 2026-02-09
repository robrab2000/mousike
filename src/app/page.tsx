import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music2, Mic2, Headphones, ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/landing-hero";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHero />

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-muted text-center mb-16 max-w-2xl mx-auto">
            Collaborate with your band without being in the same room. Record,
            listen, and iterate at your own pace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <FeatureCard
              icon={<Music2 className="h-6 w-6" />}
              title="Create a Session"
              description="Start a new rehearsal session and invite your bandmates to collaborate."
            />
            <FeatureCard
              icon={<Mic2 className="h-6 w-6" />}
              title="Record Your Part"
              description="Play along to existing tracks while recording your instrument. Choose between compressed or lossless audio."
            />
            <FeatureCard
              icon={<Headphones className="h-6 w-6" />}
              title="Mix & Review"
              description="Listen to all tracks together, adjust volumes, and perfect your performance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-border p-12 rounded-2xl w-full overflow-hidden flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to start rehearsing?
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Sign up for free and create your first session in minutes. No
              credit card required.
            </p>
            <Link href="/login">
              <Button variant="gradient" size="lg" className="group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-accent" />
            <span className="font-semibold">Mousikē</span>
            <span className="text-xs text-muted-foreground">/moo-see-KAY/</span>
          </div>
          <p className="text-muted text-sm">
            Built for musicians who can&apos;t always be together.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full flex flex-col p-6 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center mb-4 text-white shrink-0">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm flex-1">{description}</p>
    </div>
  );
}
