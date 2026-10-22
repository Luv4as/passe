import { CardLastMatch } from "@/src/components/cardLastMatch";

export default function MatchesPage() {
    return (
        <div>
            <div className="flex flex-col gap-2">
                <p className="body-sm-medium text-muted-foreground">Ultimas partidas</p>
                <CardLastMatch/>
            </div>
        </div>
    )
}