"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface BookSearchResult {
    key: string; // OpenLibrary ID (e.g., /works/OL12345W)
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
}

export type BookStatus = "reading" | "completed" | "wishlist";

export async function searchBooks(query: string) {
    if (!query) return [];

    try {
        const res = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(
                query
            )}&fields=key,title,author_name,cover_i,first_publish_year&limit=5`
        );
        const data = await res.json();
        return (data.docs as BookSearchResult[]) || [];
    } catch (error) {
        console.error("OpenLibrary Search Error:", error);
        return [];
    }
}

export async function addBook(book: BookSearchResult) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClient();

    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : null;

    const { error } = await supabase.from("books").insert({
        user_id: userId,
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        cover_url: coverUrl,
        status: "reading", // Default status
        started_at: new Date().toISOString().split("T")[0],
    });

    if (error) {
        console.error("Error adding book:", error);
        throw new Error("Failed to add book");
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}
