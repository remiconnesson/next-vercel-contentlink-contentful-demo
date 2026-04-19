import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Server, Tag } from "lucide-react"

interface TimestampCardProps {
  generatedAt: string
  cacheStatus: string
  randomValue: number
  randomName: string
  title?: string
  description?: string
}

export function TimestampCard({
  generatedAt,
  cacheStatus,
  randomValue,
  randomName,
  title = "Server-rendered data",
  description = "This data was generated on the server at build time or on a cache miss.",
}: TimestampCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {cacheStatus}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Clock className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Generated at</p>
                <p className="truncate font-mono text-sm font-semibold text-foreground">
                  {generatedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Server className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Random value</p>
                <p className="truncate font-mono text-sm font-semibold text-foreground">
                  {randomValue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Tag className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Random name</p>
                <p className="truncate font-mono text-sm font-semibold text-foreground">
                  {randomName}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Refresh the page to see if these values change. If they stay the
            same, the page is being served from cache.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
