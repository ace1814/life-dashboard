import { Button } from "@/components/ui/button";
import { CheckInDialog } from "@/components/check-in-dialog";
import { BookSearch } from "@/components/book-search";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Daily Check-in</h2>
                <div className="p-8 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">
                        Has anything interesting happened today?
                    </p>
                    <CheckInDialog />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Integrations</h3>
                    <Link href="/api/auth/strava">
                        <Button variant="outline" className="w-full">
                            Connect Strava
                        </Button>
                    </Link>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Reading List</h3>
                    <BookSearch />
                </div>
            </div>
        </div>
    );
}
