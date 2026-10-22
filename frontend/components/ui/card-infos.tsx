
interface CardInfosProps {
    title: string;
    icon: React.ReactNode;
    bigNumber: number;
    unit?: string;
    description?: string;
    className?: string;
}
export function CardInfos({ title, icon, bigNumber, description, unit, className }: CardInfosProps) {
    return (
        <div className={`flex flex-col gap-2 rounded-xl w-full border border-border bg-card p-4 ${className || ""}`}>
            <div className="flex flex-row justify-between items-center gap-2">
                <p className="body-sm-medium text-muted-foreground">{title}</p>
                {icon}
            </div>
            <div className="flex flex-row items-baseline gap-1">
                <p className="display text-foreground">{bigNumber}</p>
                <p className="body-sm text-muted-foreground">{unit}</p>
            </div>
            <p className="caption-xs text-muted-foreground">{description}</p>
        </div>
    )
}