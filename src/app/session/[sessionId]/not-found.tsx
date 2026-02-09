import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, ArrowLeft } from "lucide-react";

export default function SessionNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
            <Music2 className="h-8 w-8 text-muted" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted text-center mb-6">
            The session you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard">
            <Button variant="gradient">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
