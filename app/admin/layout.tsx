import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b p-4 flex justify-between items-center bg-muted/20">
                <h1 className="font-semibold">Admin Dashboard</h1>
                <UserButton />
            </header>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
