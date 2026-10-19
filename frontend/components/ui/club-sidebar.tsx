import { SidebarMenuButton } from "./sidebar";

interface ClubSidebarProps {
    initial: string;
    clubName: string;
    className?: string;
}

export function ClubSidebar({ initial, clubName, className }: ClubSidebarProps) {
    return (
        <SidebarMenuButton
            tooltip={clubName}
            className={`group/club-btn ${className || ""}`}
        >
            <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors group-active/club-btn:border-primary group-active/club-btn:bg-primary">
                <span className="caption-xs-medium text-foreground transition-colors group-active/club-btn:text-primary-foreground">
                    {initial}
                </span>
            </div>
            <span className="body-sm text-sidebar-foreground transition-colors group-active/club-btn:font-semibold group-data-[collapsible=icon]:hidden">
                {clubName}
            </span>
        </SidebarMenuButton>
    );
}