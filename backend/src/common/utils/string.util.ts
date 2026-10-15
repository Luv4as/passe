export function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function compararNomes(nomeA: string, nomeB: string): number {
  const normA = normalizarTexto(nomeA);
  const normB = normalizarTexto(nomeB);

  if (normA < normB) return -1;
  if (normA > normB) return 1;
  return 0;
}