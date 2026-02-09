import { Card, CardContent } from "@/components/ui/card";
import { Music2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-tight">Mousikē</span>
              <span className="text-[10px] text-muted leading-tight hidden sm:block">moo-see-KAY</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-surface-hover animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-surface-hover rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-surface-hover rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-surface-hover rounded-lg animate-pulse" />
        </div>

        {/* Session Cards Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-5 w-3/4 bg-surface-hover rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-surface-hover rounded animate-pulse mb-4" />
                <div className="h-4 w-1/3 bg-surface-hover rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
