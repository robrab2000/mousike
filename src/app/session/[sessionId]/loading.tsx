import { Card, CardContent } from "@/components/ui/card";

export default function SessionLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-surface-hover rounded animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-surface-hover rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-surface-hover rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 bg-surface-hover rounded-lg animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Transport Controls Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-hover rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-surface-hover rounded-lg animate-pulse" />
              </div>
              <div className="flex-1 mx-8">
                <div className="h-2 bg-surface-hover rounded-full animate-pulse" />
              </div>
              <div className="w-40 h-10 bg-surface-hover rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Tracks Section Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-20 bg-surface-hover rounded animate-pulse" />
          <div className="h-8 w-28 bg-surface-hover rounded-lg animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-surface-hover rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-surface-hover rounded animate-pulse" />
                  </div>
                  <div className="w-32 h-4 bg-surface-hover rounded animate-pulse" />
                  <div className="w-10 h-10 bg-surface-hover rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
