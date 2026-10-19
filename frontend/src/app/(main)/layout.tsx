'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";


export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const segments = usePathname().split("/").filter(Boolean);
    const routeFormatted = segments.map((segment) => {
        if (segment === "market") {
            return "Mercado";
        }
        if (segment === "league") {
            return "Liga";
        }
        if (segment === "players") {
            return "Jogadores";
        }
        if (segment === "clubs") {
            return "Clubes";
        }
        if (segment === "matches") {
            return "Partidas";
        }
        if (segment === "standings") {
            return "Classificação";
        }
        return segment;
    })

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
                    <SidebarTrigger />
                    <div className="h-4 w-px bg-border mx-2" />
                    <div className="flex flex-row items-center gap-2">
                        <span className="body-sm text-muted-foreground">
                            {routeFormatted[routeFormatted.length - 2]}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="body-sm-medium text-foreground">
                            {routeFormatted[routeFormatted.length - 1]}
                        </span>
                    </div>

                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}