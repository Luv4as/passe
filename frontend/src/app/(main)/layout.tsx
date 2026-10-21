'use client'

import { Badge } from "@/components/ui/badge";
import { IconContainer } from "@/components/ui/icon-container";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { ChevronRight, ListOrderedIcon, Shield, Swords, Users } from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { headerAction } = useHeaderAction();
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

    const getPageDescription = () => {
        const isClubs = segments.includes("clubs");
        const isDynamicClub = isClubs && segments.length > segments.indexOf("clubs") + 1;

        if (segments.includes("players")) {
            return "Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.";
        }
        if (isClubs) {
            return isDynamicClub
                ? "Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
                : "Stats do clube";
        }
        if (segments.includes("matches")) {
            return "Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico.";
        }
        if (segments.includes("standings")) {
            return "Todos os clubes, com 3 pontos por vitória e 1 por empate.";
        }
        return "Gerenciamento completo da liga de futebol.";
    };

    const getPageIcon = (): React.ReactNode => {
        if (segments.includes("players")) {
            return <Users className="h-6 w-6 text-primary" />;
        }
        if (segments.includes("clubs")) {
            return <Shield className="h-6 w-6 text-primary" />;
        }
        if (segments.includes("matches")) {
            return <Swords className="h-6 w-6 text-primary" />;
        }
        if (segments.includes("standings")) {
            return <ListOrderedIcon className="h-6 w-6 text-primary" />;
        }
        return <Users className="h-6 w-6 text-primary" />;
    }

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

                <main className="flex-1 py-7 px-8">
                    <div className="flex flex-row items-baseline justify-between mb-6 gap-2">
                        <div className="flex flex-row items-center gap-4">
                            <div>
                                <IconContainer className=" bg-primary-soft border border-primary h-12 w-12 ">
                                    {getPageIcon()}
                                </IconContainer>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl heading">{routeFormatted[routeFormatted.length - 1]}</h1>
                                <div className="body-sm text-muted-foreground">
                                    {getPageDescription() !== "Stats do clube" ? (
                                        getPageDescription()
                                    ) : (
                                        <div className="flex flex-row items-center gap-2">
                                            <Badge variant={"outline"} className="border-border bg-background text-foreground" >
                                                Sigla { }
                                            </Badge>
                                            <Badge variant={"outline"} className="border-border bg-background text-foreground">
                                                { } de { } jogadores
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {headerAction}
                    </div>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}