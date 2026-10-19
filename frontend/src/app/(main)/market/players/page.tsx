'use client'

import { Button } from "@/components/ui/button";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export default function PlayersPage() {
    const { setHeaderAction } = useHeaderAction();

    useEffect(() =>{
        setHeaderAction(
            <Button onClick={() => alert("Criar jogador")}>
                <Plus className="h-4 w-4" />
                Novo Jogador
            </Button>
        );

        // Limpa a ação ao mudar de página
        return () => setHeaderAction(null);
    }, [setHeaderAction]);
    
    return (
        <div>
        </div>
    )
}