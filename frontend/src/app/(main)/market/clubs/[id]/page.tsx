'use client'

import { Badge } from "@/components/ui/badge";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useGetClub } from "@/src/hooks/useGetClub";
import { Suspense, use, useEffect } from "react";


interface ClubPageProps {
    params: Promise<{ id: string }>;
}

 function ClubContent({ params }: ClubPageProps) {
    const { id } = use(params);
    const clubId = Number(id);

    const { getClub, club, loading, error } = useGetClub(clubId);
    const { setHeaderAction, setCustomTitle } = useHeaderAction();

    useEffect(() => {
        if (clubId) getClub(clubId);
    }, [clubId, getClub]);

    useEffect(() => {
        if (club) {
            setCustomTitle(club.name);
            setHeaderAction(
                <div className="flex flex-row items-center gap-2">
                    <Badge variant="outline" className="border-border bg-background text-foreground">
                        Sigla {club.acronym}
                    </Badge>
                    <Badge variant="outline" className="border-border bg-background text-foreground">
                        {club.players.length} de 5 jogadores
                    </Badge>
                </div>
            );
        }
        return () => {
            setHeaderAction(null);
            setCustomTitle(null);
        };
    }, [club, setHeaderAction, setCustomTitle]);

    if (loading) {
        return <div className="py-12 text-center text-muted-foreground">Carregando detalhes do clube...</div>;
    }

    if (error || !club) {
        return <div className="py-12 text-center text-destructive">{error || "Clube não encontrado."}</div>;
    }

    return (
        <div>
            WIP
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
