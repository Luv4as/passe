'use client'

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  Users,
  UserCheck,
  Tag
} from "lucide-react";

import { useGetClubs } from "@/src/hooks/useGetClubs";
import { useGetMatches } from "@/src/hooks/useGetMatches";
import { useStandings } from "@/src/hooks/useStandings";
import { useGetPlayers } from "@/src/hooks/useGetPlayers";

export default function LandingPage() {
  const router = useRouter();

  const { getClubs, clubs } = useGetClubs();
  const { getMatches, matches } = useGetMatches();
  const { standings, getStandings } = useStandings();
  const { players, getPlayers, meta } = useGetPlayers();

  useEffect(() => {
    getClubs();
    getMatches();
    getStandings();
    getPlayers({ limit: 50 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push("/market/players");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);


  const totalPlayers = meta?.total_items || players?.length || 0;


  const freePlayers = useMemo(() => {
    if (!players || players.length === 0) return 0;
    return players.filter((p) => p.clubId === null || p.clubId === undefined || p.clubId === 0).length;
  }, [players]);

  const totalClubs = clubs?.length ?? 0;
  const totalMatches = matches?.length ?? 0;

  const leader = useMemo(() => {
    if (!standings || standings.length === 0) return null;
    return standings[0];
  }, [standings]);

  return (
    <div className="w-full h-full bg-background flex flex-col items-center justify-center p-4 sm:p-8">

      <div className="absolute inset-0 pointer-events-none opacity-5 flex justify-between items-center px-12">
        <div className="w-32 h-64 border border-foreground rounded-r-full" />
        <div className="w-40 h-40 border border-foreground rounded-full" />
        <div className="w-32 h-64 border border-foreground rounded-l-full" />
      </div>


      <div className="flex items-center gap-3 mb-6 z-10">
        <Image
          src="/marca.svg"
          alt="logo Passe"
          width={56}
          height={56}
          priority
          className="shrink-0"
        />
        <span className="text-3xl font-extrabold tracking-tight text-foreground">
          Passe
        </span>
      </div>

      <div className="mb-6 z-10">
        <Badge variant="outline" className="border-border bg-background px-3 py-1 rounded-full text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="caption-xs-medium text-foreground">Liga Fictícia 2026</span>
          <span className="text-border">·</span>
          <span className="caption-xs text-muted-foreground">
            Líder: {leader ? `${leader.clubName}, ${leader.points} pontos` : "Calculando..."}
          </span>
        </Badge>
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-tight mb-4 z-10 text-center">
        Gestão da liga, do mercado à classificação
      </h1>

      <p className="body text-muted-foreground max-w-2xl mb-8 z-10 text-center">
        Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois,
        escale os titulares e jogue partidas com placar calculatedo pelos atributos.
      </p>

      <div className="flex flex-row items-center gap-3 mb-10 z-10">
        <Button
          size="lg"
          className="rounded-xl px-8 body-sm-medium"
          onClick={() => router.push(`/market/players`)}>
          Iniciar
          <ArrowRight size={18} className="ml-2" />
        </Button>
        <span className="caption-xs text-muted-foreground flex items-center gap-1.5">
          ou tecle
          <kbd className="px-2 py-1 text-[11px] border border-border bg-muted rounded-md text-foreground">
            Enter
          </kbd>
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 caption-xs text-muted-foreground mb-12 z-10">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-muted-foreground" />
          <span className="caption-xs-semibold text-foreground">{totalPlayers}</span>
          jogadores
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <UserCheck size={14} className="text-muted-foreground" />
          <span className="caption-xs-semibold text-foreground">{freePlayers}</span> livres
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-muted-foreground" />
          <span className="caption-xs-semibold text-foreground">{totalClubs}</span> clubes
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <Swords size={14} className="text-muted-foreground" />
          <span className="caption-xs-semibold text-foreground">{totalMatches}</span> partidas
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <span className="caption-xs-semibold text-foreground">Não precisa de login</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full z-10">
        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">01</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Jogadores</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.
          </p>
        </div>

        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">02</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Clubes</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Começam com 300,00 em caixa e sem jogadores.
          </p>
        </div>

        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">03</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Compra</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Valor + taxa, até 50% do caixa, com contrato de fidelidade.
          </p>
        </div>

        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">04</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Venda</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Multa antes do fim da fidelidade e comissão sobre o lucro.
          </p>
        </div>

        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">05</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Histórico</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Toda compra e venda fica registrada, com totais e CSV.
          </p>
        </div>

        <div className="flex flex-col text-left p-4 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy size={16} />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">06</span>
          </div>
          <h4 className="body-sm-medium text-foreground mb-1">Liga</h4>
          <p className="caption-xs text-muted-foreground leading-relaxed">
            Escale 5 titulares e jogue partidas que entram na classificação.
          </p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border/50 w-full flex items-center justify-center gap-2 caption-xs text-muted-foreground z-10">
        <Clock size={14} />
        <span>Liga Fictícia 2026 · Horário de Brasília (UTC-3)</span>
      </div>
    </div>
  );
}