"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { saveDailyLog, syncUser } from "@/app/actions";

export function CheckInDialog() {
    const [open, setOpen] = useState(false);
    const [mood, setMood] = useState([3]);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Optimistically sync user
            await syncUser();

            formData.append("mood_score", mood[0].toString());
            await saveDailyLog(formData);
            setOpen(false);
            // Reset form or show success toast
        } catch (error) {
            console.error(error);
            alert("Failed to save log");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Check In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Daily Check-in</DialogTitle>
                    <DialogDescription>
                        How was your day? Log your mood and thoughts.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="mood">Mood (1-5): {mood[0]}</Label>
                        <Slider
                            id="mood"
                            min={1}
                            max={5}
                            step={1}
                            value={mood}
                            onValueChange={setMood}
                            className="py-4"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="journal">Journal Entry</Label>
                        <Textarea
                            id="journal"
                            name="journal_entry"
                            placeholder="What happened today?"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Log"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
