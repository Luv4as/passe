"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardInfos } from "@/components/ui/card-infos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClubLineupTab } from "@/src/components/clubLineupTab";
import { ClubPlayersTable } from "@/src/components/clubPlayersTable";
import { ClubTransactionsTable } from "@/src/components/clubTransactionsTable";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useGetClub } from "@/src/hooks/useGetClub";
import {
    Coins,
    Landmark,
    Shirt,
    ShoppingCart,
    Wallet,
    History,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // 1. Adicionado useSearchParams
import { Suspense, use, useEffect } from "react";

interface ClubPageProps {
    params: Promise<{ id: string }>;
}

type ClubTab = "elenco" | "escalacao" | "historico";

function ClubContent({ params }: ClubPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as ClubTab | null;

    const { id } = use(params);
    const clubId = Number(id);

    const activeTab: ClubTab =
        tabParam && ["elenco", "escalacao", "historico"].includes(tabParam)
            ? tabParam
            : "elenco";

    const handleTabChange = (val: string) => {
        const newTab = val as ClubTab;
        router.replace(`/market/clubs/${clubId}?tab=${newTab}`, { scroll: false });
    };

    const { getClub, club, loading, error } = useGetClub(clubId);
    const { setHeaderAction, setHeaderDescription, setCustomTitle } =
        useHeaderAction();

    useEffect(() => {
        if (clubId) getClub(clubId);
    }, [clubId, getClub]);

    useEffect(() => {
        if (club) {
            setCustomTitle(club.name);

            setHeaderDescription(
                <div className="flex flex-row items-center gap-2">
                    <Badge
                        variant="outline"
                        className="border-border bg-background text-foreground"
                    >
                        Sigla {club.acronym}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-border bg-background text-foreground"
                    >
                        {club.players.length} de 12 jogadores
                    </Badge>
                </div>,
            );
            setHeaderAction(
                <div className="flex flex-row items-center gap-2">
                    <Button type="button" onClick={() => router.push(`/market/players`)}>
                        <ShoppingCart size={16} className="mr-1.5" />
                        Comprar Jogadores
                    </Button>
                </div>,
            );
        }
        return () => {
            setHeaderAction(null);
            setHeaderDescription(null);
            setCustomTitle(null);
        };
    }, [club, setHeaderAction, setHeaderDescription, setCustomTitle, router]);

    if (loading) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Carregando detalhes do clube...
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="py-12 text-center text-destructive">
                {error || "Clube não encontrado."}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-stretch justify-center gap-4">
                <CardInfos
                    title="Caixa"
                    icon={<Wallet size={16} />}
                    bigNumber={club.cash}
                    unit="moedas"
                    description="Só muda por compras e vendas"
                />
                <CardInfos
                    title="Valor do elenco"
                    icon={<Coins size={16} />}
                    bigNumber={club.squadValue}
                    unit="moedas"
                    description="Soma dos valores de mercado"
                />
                <CardInfos
                    title="Patrimônio"
                    icon={<Landmark size={16} />}
                    bigNumber={club.netWorth}
                    unit="moedas"
                    description="Caixa + valor do elenco"
                />
                <CardInfos
                    title="Elenco"
                    icon={<Shirt size={16} />}
                    bigNumber={club.players.length}
                    unit="de 12"
                    description="Limite de 12 jogadores"
                />
            </div>
            <Tabs
                defaultValue="elenco"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <TabsList className="flex w-full justify-start items-center border-b border-border bg-transparent p-0 h-auto gap-6 rounded-none">
                    <TabsTrigger
                        value="elenco"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 pt-2 font-medium flex items-center gap-2"
                    >
                        <Shirt size={16} />
                        Elenco
                        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-semibold">
                            {club.players.length}
                        </span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="escalacao"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 pt-2 font-medium flex items-center gap-2"
                    >
                        Escalação
                    </TabsTrigger>

                    <TabsTrigger
                        value="historico"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 pt-2 font-medium flex items-center gap-2"
                    >
                        <History size={16} />
                        Histórico
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="elenco" className="mt-4 flex flex-col gap-2">
                    <ClubPlayersTable />
                    <p className="caption-xs text-muted-foreground">
                        Valor de mercado, dias restantes e % de multa calculados para uma
                        venda agora. A multa tem teto de 10,00.
                    </p>
                </TabsContent>

                <TabsContent value="escalacao" className="mt-4">
                    <div className="p-8 border border-border rounded-xl bg-card text-center text-muted-foreground">
                        <ClubLineupTab
                            clubId={clubId}
                            clubName={club.name}
                            allPlayers={club.players}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="historico" className="mt-4">
                    <ClubTransactionsTable clubId={clubId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function ClubEspecificPage(props: ClubPageProps) {
    return (
        <Suspense
            fallback={
                <div className="py-12 text-center text-muted-foreground">
                    Carregando...
                </div>
            }
        >
            <ClubContent {...props} />
        </Suspense>
    );
}