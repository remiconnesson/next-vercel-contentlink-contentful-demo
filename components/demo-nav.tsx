import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const links = [
  { href: "/", label: "Overview" },
  { href: "/time-based", label: "Time-based" },
  { href: "/on-demand/post-1", label: "On-demand (pre-built)" },
  { href: "/on-demand/post-2", label: "On-demand (dynamic)" },
]

interface DemoNavProps {
  currentPath?: string
}

export function DemoNav({ currentPath }: DemoNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
            <span className="text-xs font-bold text-background">ISR</span>
          </div>
          <span className="hidden font-semibold sm:inline">
            Next.js ISR Demo
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {links.map((link) => {
            const isActive = currentPath === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="hidden md:inline">{link.label}</span>
                <span className="md:hidden">
                  {link.label === "Overview"
                    ? "Home"
                    : link.label.split(" ")[0]}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
