"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    searchBooks,
    addBook,
    type BookSearchResult,
} from "@/app/actions/books";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function BookSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<BookSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleSearch() {
        if (!query) return;
        setLoading(true);
        const docs = await searchBooks(query);
        setResults(docs);
        setLoading(false);
    }

    async function handleAdd(book: BookSearchResult) {
        await addBook(book);
        setOpen(false); // Close on success
        setQuery("");
        setResults([]);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Book</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Search Books</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by title..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Search"}
                    </Button>
                </div>

                <div className="mt-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    {results.map((book) => (
                        <div key={book.key} className="flex gap-4 p-2 border rounded hover:bg-muted/50">
                            <div className="relative w-12 h-16 bg-muted flex-shrink-0">
                                {book.cover_i ? (
                                    <Image
                                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                                        alt={book.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Cover</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">{book.title}</h4>
                                <p className="text-xs text-muted-foreground">{book.author_name?.[0]}</p>
                                <p className="text-xs text-muted-foreground">{book.first_publish_year}</p>
                            </div>
                            <Button size="sm" onClick={() => handleAdd(book)}>Add</Button>
                        </div>
                    ))}
                    {results.length === 0 && !loading && query && (
                        <p className="text-center text-sm text-muted-foreground">No results found.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
