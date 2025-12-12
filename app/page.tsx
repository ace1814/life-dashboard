import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 font-sans">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Life Dashboard</h1>
        <p className="text-muted-foreground max-w-md">
          A personal quantified self dashboard tracking daily habits, reading, and reflections.
        </p>

        <div className="grid grid-cols-1 gap-4 w-full max-w-md mt-8">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="font-semibold mb-2">Heatmap Placeholder</h2>
            <div className="h-32 bg-muted/20 rounded flex items-center justify-center text-sm text-muted-foreground">
              (Public GitHub-style Heatmap will go here)
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="font-semibold mb-2">Currently Reading</h2>
            <div className="h-16 bg-muted/20 rounded flex items-center justify-center text-sm text-muted-foreground">
              (Book Progress)
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
