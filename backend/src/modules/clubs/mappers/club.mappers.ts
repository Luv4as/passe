export class ClubMapper {
    static toResponse(club: any, squadValue: number) {
        const cash = Number(club.caixa);
        const squadValueArredondado = Number(squadValue.toFixed(2));
        const netWorth = Number((cash + squadValue).toFixed(2));

        return {
            id: club.id,
            name: club.nome,
            acronym: club.sigla,
            cash: cash,
            squad_value: squadValue,
            net_worth: netWorth,
            players: mappedPlayers,
        };
    }
}
