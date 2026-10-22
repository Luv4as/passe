import { CardLastMatch } from "@/src/components/cardLastMatch";
import { MatchesTable } from "@/src/components/matchesTable";

export default function MatchesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <p className="body-sm-medium text-muted-foreground">Ultimas partidas</p>
                <CardLastMatch />
            </div>
            <MatchesTable />
            <p className="body-sm text-muted-foreground">
                Partidas da mais recente para a mais antiga, com filtro por clube. “Ver duelos” abre a partida.
            </p>
        </div>
    )
}