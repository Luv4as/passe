interface IconContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function IconContainer({ children, className = '' }: IconContainerProps ) {
    return (
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ${className ?? ""}`}>
            {children}
        </div>
    );
}