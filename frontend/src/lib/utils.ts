export function formatCoins(value: number): string {
    return `${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDate(dateString: string | Date): string {
    if (!dateString) return "-";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}