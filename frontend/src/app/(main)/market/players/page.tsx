'use client'

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Dropdown } from "@/src/components/combobox";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { Coins, HeartPulse, Plus, Search, Shield, Shirt, UserRound } from "lucide-react";
import { useEffect } from "react";

export default function PlayersPage() {
    const { setHeaderAction } = useHeaderAction();

    useEffect(() => {
        setHeaderAction(
            <Button onClick={() => alert("Criar jogador")}>
                <Plus className="h-4 w-4" />
                Novo Jogador
            </Button>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    return (
        <div>
            <div className="flex flex-row gap-2 p-2 border border-border rounded-xl">
                <InputGroup className="max-w-xs">
                    <InputGroupInput placeholder="Buscar por nome" />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
                <Dropdown
                    icon={<Shirt className="h-4 w-4" />}
                    placeholder="Posição"
                    opcoes={["Opção 1", "Opção 2", "Opção 3"]} />
                <Dropdown
                    icon={<HeartPulse className="h-4 w-4" />}
                    placeholder="Condição"
                    opcoes={["Opção 1", "Opção 2", "Opção 3"]} />
                <Dropdown
                    icon={<Shield className="h-4 w-4" />}
                    placeholder="Clube"
                    opcoes={["Opção 1", "Opção 2", "Opção 3"]} />
                <Dropdown
                    icon={<UserRound className="h-4 w-4" />}
                    placeholder="Idade"
                    opcoes={["Opção 1", "Opção 2", "Opção 3"]} />
                <Dropdown
                    icon={<Coins className="h-4 w-4" />}
                    placeholder="Valor de Mercado"
                    opcoes={["Opção 1", "Opção 2", "Opção 3"]} />
            </div>
            
        </div>
    )
}