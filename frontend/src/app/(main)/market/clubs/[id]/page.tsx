'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardInfos } from "@/components/ui/card-infos";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useGetClub } from "@/src/hooks/useGetClub";
import { Coins, Landmark, Shirt, ShoppingCart, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect } from "react";


interface ClubPageProps {
    params: Promise<{ id: string }>;
}

function ClubContent({ params }: ClubPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const clubId = Number(id);

    const { getClub, club, loading, error } = useGetClub(clubId);
    const { setHeaderAction, setHeaderDescription, setCustomTitle } = useHeaderAction();

    useEffect(() => {
        if (clubId) getClub(clubId);
    }, [clubId, getClub]);

    useEffect(() => {
        if (club) {
            setCustomTitle(club.name);

            setHeaderDescription(
                <div className="flex flex-row items-center gap-2">
                    <Badge variant="outline" className="border-border bg-background text-foreground">
                        Sigla {club.acronym}
                    </Badge>
                    <Badge variant="outline" className="border-border bg-background text-foreground">
                        {club.players.length} de 5 jogadores
                    </Badge>
                </div>
            );
            setHeaderAction(
                <div className="flex flex-row items-center gap-2">
                    <Button
                    type="button"
                    onClick={() => 
                        router.push(`/market/players`)
                    }>
                        <ShoppingCart size={16} />
                        Comprar Jogadores
                    </Button>
                </div>
            );
        }
        return () => {
            setHeaderAction(null);
            setHeaderDescription(null);
            setCustomTitle(null);
        };
    }, [club, setHeaderAction, setHeaderDescription, setCustomTitle, router]);

    if (loading) {
        return <div className="py-12 text-center text-muted-foreground">Carregando detalhes do clube...</div>;
    }

    if (error || !club) {
        return <div className="py-12 text-center text-destructive">{error || "Clube não encontrado."}</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-stretch justify-center gap-4">
                <CardInfos
                    title="Caixa"
                    icon={<Wallet size={16} />}
                    bigNumber={club.cash}
                    unit="moedas"
                    description="Só muda por compras e vendas" />
                <CardInfos
                    title="Valor do elenco"
                    icon={<Coins size={16} />}
                    bigNumber={club.squadValue}
                    unit="moedas"
                    description="Soma dos valores de mercado" />
                <CardInfos
                    title="Patrimonio"
                    icon={<Landmark size={16} />}
                    bigNumber={club.netWorth}
                    unit="moedas"
                    description="Caixa + valor do elenco" />
                <CardInfos
                    title="Elenco"
                    icon={<Shirt size={16} />}
                    bigNumber={club.players.length}
                    unit="jogadores"
                    description="Limite de 12 jogadores" />
            </div>

        </div>
    )
}

export default function ClubEspecificPage(props: ClubPageProps) {
    return (
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando...</div>}>
            <ClubContent {...props} />
        </Suspense>
    );
}
