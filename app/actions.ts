"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";
import Sentiment from "sentiment";
import { revalidatePath } from "next/cache";

const sentiment = new Sentiment();

export async function saveDailyLog(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const journalEntry = formData.get("journal_entry") as string;
    const moodScore = parseInt(formData.get("mood_score") as string);
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Calculate sentiment
    const sentimentResult = sentiment.analyze(journalEntry);
    const sentimentScore = sentimentResult.score;

    const supabase = await createClient();

    // Upsert user to ensure they exist in our DB (Clerk sync)
    // In a real app, webhook sync is better, but this is a lazy sync fallback
    // OR we assume user is already created via webhook. 
    // Let's do a safe upsert for now if the user table allows it, 
    // but strict referencing means we should probably ensure user exists.
    // For this MV, let's assume webhooks will handle it or we blindly insert.
    // Actually, let's just insert the log. If user missing, it will fail FK.
    // Ideally we sync user on login or webhook.
    // Let's do a quick check/insert for the user to be safe for this "Indie Stack"
    // NOTE: This requires the user to have an email in Clerk which we might not have here easily without fetching clerk user.
    // For now, let's assume the user record must exist. 
    // Wait, the PRD says "Syncs with Clerk". 
    // Let's try to simple insert.

    const { error } = await supabase.from("daily_logs").upsert(
        {
            user_id: userId,
            date,
            journal_entry: journalEntry,
            mood_score: moodScore,
            sentiment_score: sentimentScore,
        },
        { onConflict: "user_id, date" }
    );

    if (error) {
        console.error("Error saving log:", error);
        throw new Error("Failed to save log");
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function ensureUserExists() {
    const { userId, getToken } = await auth();
    if (!userId) return;

    // fetch user details from Clerk if needed, or just insert ID
    // ideally we use a webhook.
    // For this prototype, we'll skip complex sync and assume we can figure it out.
    // Actually, we need the user in the `users` table for FK constraints.
    // Let's implement a helper to ensure user exists using just the ID for now.
    // The email is required by schema... hmm.
    // We will need to implement Clerk Webhooks later for a proper sync.
    // For now, let's use a workaround:
    // We will relax the email constraint or fetch it. 
    // Let's fetch the user from Clerk Backend API here.

    // Actually, to keep it simple for Phase 2, let's just insert the log.
    // If it fails, I'll prompt the user to setup webhooks or insert themselves manually?
    // No, that's bad DX.
    // Let's use the Clerk `currentUser` helper.
}

import { currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
    const user = await currentUser();
    if (!user) return;

    const supabase = await createClient();

    const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "no-email",
        display_name: user.fullName,
    });

    if (error) console.error("Sync user error:", error);
}
