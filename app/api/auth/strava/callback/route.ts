import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=strava_auth_failed`);
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=unauthorized`);
    }

    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    try {
        const tokenRes = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error("Strava Token Error:", tokenData);
            throw new Error("Failed to exchange token");
        }

        const supabase = await createClient();

        // Upsert integration
        const { error: dbError } = await supabase.from("integrations").upsert({
            user_id: userId,
            provider: "strava",
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_at,
            provider_user_id: tokenData.athlete?.id?.toString(),
        }, { onConflict: "user_id, provider" });

        if (dbError) {
            console.error("Database Error:", dbError);
            throw new Error("Failed to save tokens");
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?success=strava_connected`);

    } catch (err) {
        console.error(err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=server_error`);
    }
}
