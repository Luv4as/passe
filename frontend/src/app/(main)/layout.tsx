import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
                    <SidebarTrigger />
                    <div className="h-4 w-px bg-border mx-2" />
                    <span className="body-sm text-muted-foreground">
                        Passe - Gestão da Liga
                    </span>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}