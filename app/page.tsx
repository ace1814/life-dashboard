import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Heatmap from "@/components/heatmap";
import Image from "next/image";

// Force dynamic because we are fetching fresh data
export const dynamic = "force-dynamic";

async function getData() {
  const supabase = await createClient();

  // Fetch daily logs for Heatmap
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("date, mood_score, strava_summary, pages_read_count");

  // Fetch 'reading' book
  const { data: books } = await supabase
    .from("books")
    .select("title, author, cover_url")
    .eq("status", "reading")
    .limit(1);

  return { logs: logs || [], book: books?.[0] };
}

export default async function Home() {
  const { logs, book } = await getData();

  // Transform logs to Calendar format
  // Level 0-4
  // Mood 1-5 -> Map to 0-4?
  // Let's optimize:
  // Level = (Mood Score - 1) capped at 4?
  // Or Level = Mood Score (1-4). If 5 -> 4.
  // Bonus: If Strava is active, increase level?
  // Simple logic as requested: mood_score + strava.
  // Assuming mood_score is 1-5.
  // We need level 0-4.
  // Let's map Mood 1 -> 0, Mood 2 -> 1, ... Mood 5 -> 4.
  // Plus bonus.

  const calendarData = logs.map((log) => {
    let level = 0;
    if (log.mood_score) {
      level = Math.max(0, Math.min(4, log.mood_score - 1));
    }

    // Bonus for activity
    if (log.strava_summary) {
      level = Math.min(4, level + 1);
    }

    // Bonus for reading?
    if (log.pages_read_count > 0) {
      level = Math.min(4, level + 1);
    }

    return {
      date: log.date,
      count: 1, // Just needs to be > 0 to show? No, level controls color.
      level: level,
    };
  });

  // Fill in last 365 days? ActivityCalendar handles missing dates as level 0 usually.
  // But let's let it handle it.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 font-sans">
      <main className="flex flex-col items-center gap-4 text-center w-full max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Life Dashboard</h1>
        <p className="text-muted-foreground max-w-md">
          A personal quantified self dashboard tracking daily habits, reading, and reflections.
        </p>

        <div className="grid grid-cols-1 gap-8 w-full mt-8">
          <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col items-center">
            <h2 className="font-semibold mb-6">Consistency Heatmap</h2>
            {/* 
                We need to suppress hydration warning because dates might mismatch slightly on server/client 
                or pass explicit config.
            */}
            <div className="w-full flex justify-center overflow-x-auto">
              <Heatmap data={calendarData} />
            </div>
          </div>

          {book && (
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm max-w-md mx-auto w-full">
              <h2 className="font-semibold mb-4">Currently Reading</h2>
              <div className="flex gap-4 text-left">
                <div className="relative w-16 h-24 bg-muted flex-shrink-0 shadow-sm">
                  {book.cover_url ? (
                    <Image src={book.cover_url} alt={book.title} fill className="object-cover rounded" />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Admin Login</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
