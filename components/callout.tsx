import { cn } from "@/lib/utils"
import { Info, AlertTriangle, Lightbulb } from "lucide-react"

interface CalloutProps {
  type?: "info" | "warning" | "tip"
  title?: string
  children: React.ReactNode
  className?: string
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
}

const styles = {
  info: "border-primary/30 bg-primary/5",
  warning: "border-[oklch(0.8_0.15_80)]/30 bg-[oklch(0.8_0.15_80)]/5",
  tip: "border-[oklch(0.7_0.15_150)]/30 bg-[oklch(0.7_0.15_150)]/5",
}

const iconStyles = {
  info: "text-primary",
  warning: "text-[oklch(0.8_0.15_80)]",
  tip: "text-[oklch(0.7_0.15_150)]",
}

export function Callout({
  type = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const Icon = icons[type]

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        styles[type],
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconStyles[type])} />
      <div className="flex flex-col gap-1">
        {title && (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        )}
        <div className="text-sm text-foreground/80 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
          {children}
        </div>
      </div>
    </div>
  )
}
