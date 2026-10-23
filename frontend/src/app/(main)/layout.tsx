"use client";

import { IconContainer } from "@/components/ui/icon-container";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import {
  ChevronRight,
  ListOrderedIcon,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerAction, headerDescription, customTitle, hideHeader } = useHeaderAction();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isClubs = segments.includes("clubs");
  const isDynamicClub =
    isClubs && segments.length > segments.indexOf("clubs") + 1;

  const routeFormatted = segments.map((segment) => {
    if (segment === "market") return "Mercado";
    if (segment === "league") return "Liga";
    if (segment === "players") return "Jogadores";
    if (segment === "clubs") return "Clubes";
    if (segment === "matches") return "Partidas";
    if (segment === "standings") return "Classificação";
    return segment;
  });

  const getPageDescription = () => {
    if (segments.includes("players")) {
      return "Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.";
    }
    if (isClubs) {
      return isDynamicClub
        ? "Stats do clube"
        : "Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes.";
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
  };

  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex flex-row items-center gap-2">
          <span className="body-sm text-muted-foreground">
            {routeFormatted[routeFormatted.length - 2] ?? "Liga"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="body-sm-medium text-foreground">
            {customTitle ?? routeFormatted[routeFormatted.length - 1] ?? ""}
          </span>
        </div>
      </header>

      <main className="flex-1 py-7 px-8">
        {!hideHeader && (
          <div className="flex flex-row items-baseline justify-between mb-6 gap-2">
            <div className="flex flex-row items-center gap-4">
              <div>
                <IconContainer className="bg-primary-soft border border-primary h-12 w-12">
                  {getPageIcon()}
                </IconContainer>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl heading">
                  {customTitle ?? routeFormatted[routeFormatted.length - 1]}
                </h1>
                <div className="body-sm text-muted-foreground">
                  {headerDescription ?? getPageDescription()}
                </div>
              </div>
            </div>
            {headerAction}
          </div>
        )}
        {children}
      </main>
    </SidebarInset>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Suspense
        fallback={
          <div className="flex h-screen w-full">
            <div className="w-64 border-r border-border bg-sidebar" />
            <SidebarInset>
              <header className="flex h-14 items-center border-b border-border px-4 shrink-0">
                <SidebarTrigger />
              </header>
              <main className="flex-1 py-7 px-8">{children}</main>
            </SidebarInset>
          </div>
        }
      >
        <AppSidebar />
        <LayoutContent>{children}</LayoutContent>
      </Suspense>
    </SidebarProvider>
  );
}
