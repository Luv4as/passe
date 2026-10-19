export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full items-center justify-center bg-background text-foreground font-sans">
      <main className="flex w-full flex-1 flex-col items-start justify-between bg-card text-card-foreground border border-border rounded-xl py-12 px-8 sm:px-16">
        <h1 className="heading font-bold text-primary">Passe</h1>
        <p className="body text-muted-foreground mt-2">
          Gerenciamento completo de liga, clubes e mercado.
        </p>
      </main>
    </div>
  );
}