"use client";

const CRITERIA = [
  "Mais pontos",
  "Maior saldo de gols",
  "Mais gols marcados",
  "Nome do clube, de A a Z",
];

export function StandingsCriteriaCard() {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border p-4">
        <h3 className="heading-card text-foreground">Ordem da tabela</h3>
        <p className="body-sm text-muted-foreground mt-0.5">
          Critérios de classificação, nesta ordem.
        </p>
      </header>
      <div className="flex flex-col gap-3 p-4">
        {CRITERIA.map((criterion, index) => (
          <div key={criterion} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted body-sm-medium text-foreground">
              {index + 1}
            </span>
            <span className="body-sm text-foreground">{criterion}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
