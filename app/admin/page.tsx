import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Daily Check-in</h2>
                <div className="p-8 border rounded-lg border-dashed text-center text-muted-foreground">
                    Form Placeholder
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Integrations</h3>
                    <Button variant="outline">Connect Strava</Button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Reading List</h3>
                    <Button variant="outline">Add Book</Button>
                </div>
            </div>
        </div>
    );
}
