
interface SvgIconProps {
    src: string;
    className?: string;
}

export function SvgIcon({ src, className = "" }: SvgIconProps) {
    return (
        <span
            className={`inline-block size-3.5 shrink-0 transition-colors ${className}`}
            style={{
                maskImage: `url(${src})`,
                WebkitMaskImage: `url(${src})`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
            }}
        />
    );
}