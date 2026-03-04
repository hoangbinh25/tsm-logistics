import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    description?: string
    className?: string
    iconClassName?: string
}

export function StatsCard({
    label,
    value,
    icon: Icon,
    description,
    className,
    iconClassName
}: StatsCardProps) {
    return (
        <div className={cn("p-4 border rounded-xl bg-card shadow-sm flex flex-col justify-between", className)}>
            <div className="flex justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
                <div className={cn("p-2 bg-primary/10 rounded-lg", iconClassName)}>
                    <Icon className={cn("w-5 h-5 text-primary", iconClassName?.replace("bg-", "text-").replace("/10", ""))} />
                </div>
            </div>
            {description && (
                <div className="mt-4 text-xs text-muted-foreground">
                    {description}
                </div>
            )}
        </div>
    )
}
