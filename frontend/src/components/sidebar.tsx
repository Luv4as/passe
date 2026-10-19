"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SvgIcon } from "@/components/ui/svg-icon";
import { ClubSidebar } from "@/components/ui/club-sidebar";
import LeagueBasics from "@/components/ui/league-basics";
import { useSidebarData } from "../hooks/useSidebarData";

export function AppSidebar() {
    const pathname = usePathname();
    const { playersCount, clubsCount, matchesCount, clubs, lastLeagueMatch, loading } = useSidebarData();

    return (
        <Sidebar collapsible="icon" variant="floating" className="border-none">
            <SidebarHeader className="px-4 pt-3.5 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
                <div className="flex flex-row items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                    <Image
                        src="/marca.svg"
                        alt="logo Passe"
                        width={32}
                        height={32}
                        priority
                        className="shrink-0"
                    />
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="body-sm-semibold text-sidebar-foreground">Passe</p>
                        <p className="caption-xs-medium text-muted-foreground">Gestão de liga</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 caption-xs-medium text-muted-foreground">
                        Mercado
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                <SidebarMenuButton
                                    render={<Link href="/market/players" />}
                                    tooltip="Jogadores"
                                    isActive={pathname === "/market/players" || pathname === "/"}
                                >
                                    <SvgIcon
                                        src="/jogadores.svg"
                                        className={pathname === "/market/players" || pathname === "/"
                                            ? "bg-primary"
                                            : "bg-muted-foreground"}
                                    />
                                    <span className={`group-data-[collapsible=icon]:hidden body-sm ${pathname === "/market/players" || pathname === "/"
                                        ? "body-sm-medium text-sidebar-foreground"
                                        : "body-sm text-sidebar-foreground"
                                        }`}>
                                        Jogadores
                                    </span>
                                </SidebarMenuButton>
                                <SidebarMenuBadge className="caption-xs-medium text-muted-foreground">
                                    {loading ? "--" : playersCount}
                                </SidebarMenuBadge>
                            </SidebarMenuItem>

                            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                <SidebarMenuButton
                                    render={<Link href="/market/clubs" />}
                                    tooltip="Clubes"
                                    isActive={pathname.startsWith("/market/clubs")}
                                >
                                    <SvgIcon
                                        src="/clube.svg"
                                        className={pathname.startsWith("/market/clubs")
                                            ? "bg-primary"
                                            : "bg-muted-foreground"}
                                    />
                                    <span className={`group-data-[collapsible=icon]:hidden body-sm ${pathname.startsWith("/market/clubs")
                                        ? "body-sm-medium text-sidebar-foreground"
                                        : "body-sm text-sidebar-foreground"
                                        }`}>
                                        Clubes
                                    </span>
                                </SidebarMenuButton>
                                <SidebarMenuBadge className="caption-xs-medium text-muted-foreground">
                                    {loading ? "--" : `${clubsCount}/20`}
                                </SidebarMenuBadge>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 caption-xs-medium text-muted-foreground">
                        Liga
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                <SidebarMenuButton
                                    render={<Link href="/league/matches" />}
                                    tooltip="Partidas"
                                    isActive={pathname.startsWith("/league/matches")}
                                >
                                    <SvgIcon
                                        src="/partidas.svg"
                                        className={pathname.startsWith("/league/matches")
                                            ? "bg-primary"
                                            : "bg-muted-foreground"}
                                    />
                                    <span className={`group-data-[collapsible=icon]:hidden body-sm ${pathname.startsWith("/league/matches")
                                        ? "body-sm-medium text-sidebar-foreground"
                                        : "body-sm text-sidebar-foreground"
                                        }`}>
                                        Partidas
                                    </span>
                                </SidebarMenuButton>
                                <SidebarMenuBadge className="caption-xs-medium text-muted-foreground">
                                    {loading ? "--" : matchesCount}
                                </SidebarMenuBadge>
                            </SidebarMenuItem>

                            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                <SidebarMenuButton
                                    render={<Link href="/league/standings" />}
                                    tooltip="Classificação"
                                    isActive={pathname === "/league/standings"}
                                >
                                    <SvgIcon
                                        src="/classificacao.svg"
                                        className={pathname === "/league/standings"
                                            ? "bg-primary"
                                            : "bg-muted-foreground"}
                                    />
                                    <span className={`group-data-[collapsible=icon]:hidden body-sm ${pathname === "/league/standings"
                                        ? "body-sm-medium text-primary"
                                        : "body-sm text-sidebar-foreground"
                                        }`}>
                                        Classificação
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 caption-xs-medium text-muted-foreground">
                        Clubes
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {clubs.map((club) => (
                                <SidebarMenuItem key={club.id} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                    <Link href={`/market/clubs/${club.id}`} className="w-full">
                                        <ClubSidebar
                                            initial={club.nome.charAt(0).toUpperCase()}
                                            clubName={club.nome}
                                        />
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                            {clubs.length === 0 && !loading && (
                                <p className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                                    Nenhum clube criado
                                </p>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-4 py-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <div className="w-full group-data-[collapsible=icon]:hidden">
                    <LeagueBasics 
                        clubs={clubsCount}
                        players={playersCount}
                        leagueName="Liga Fictícia"
                        lastMatch={lastLeagueMatch ?? (loading ? "Carregando..." : "Nenhuma partida realizada")}
                    />
                </div>
                <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                    <SidebarMenuButton tooltip="Resumo da liga" className="size-8">
                        <SvgIcon src="/liga.svg" className="bg-muted-foreground" />
                    </SidebarMenuButton>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}