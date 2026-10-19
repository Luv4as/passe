import { IconContainer } from "./icon-container";
import { SvgIcon } from "./svg-icon";

interface LeagueBasicsProps {
    className?: string;
    leagueName?: string;
    lastMatch?: string;
    clubs?: number;
    players?: number;
}

export default function LeagueBasics({ className, leagueName, lastMatch, clubs, players }: LeagueBasicsProps) {
    return (
        <section
            aria-label="Resumo da liga"
            className={`flex w-full flex-col items-start gap-2.5 rounded-xl border border-sidebar-border bg-background p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${className ?? ""}`}
        >
            <div className="flex w-full items-center gap-2.5">
                <IconContainer>
                    <SvgIcon
                        src="/liga.svg"
                        className="bg-muted-foreground"
                    />
                </IconContainer>
                <div className="flex min-w-0 flex-1 flex-col items-start whitespace-nowrap">
                    <p className="text-sm font-medium leading-5 text-foreground">
                        {leagueName ?? "Liga de Exemplo"}
                    </p>
                    <p className="text-xs font-normal leading-4 text-muted-foreground">
                        {clubs ?? 6} clubes · {players ?? 23} jogadores
                    </p>
                </div>
            </div>

            <div className="flex w-full items-center gap-2.5">
                <IconContainer>
                    <SvgIcon
                        src="/partidas.svg"
                        className="bg-muted-foreground"
                    />
                </IconContainer>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <p className="whitespace-nowrap text-sm font-medium leading-5 text-foreground">
                        Última partida
                    </p>
                    <p className="overflow-hidden whitespace-nowrap text-xs font-normal leading-4 text-muted-foreground">
                        {lastMatch ?? "Delta FC 2 × 1 Águias FC"}
                    </p>
                </div>
            </div>

            <div className="h-px w-full bg-sidebar-border" />

            <div className="flex w-full items-center justify-between">
                <div className="flex shrink-0 items-center gap-1.5">
                    <SvgIcon
                        src="/relogio.svg"
                        className="bg-muted-foreground"
                    />
                    <p className="whitespace-nowrap text-xs font-normal leading-4 text-muted-foreground">
                        Horário de Brasília (UTC−3)
                    </p>
                </div>
            </div>
        </section>
    );
}