import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ADJECTIVES = [
  "Swift",
  "Brave",
  "Calm",
  "Eager",
  "Gentle",
  "Happy",
  "Jolly",
  "Kind",
  "Lively",
  "Noble",
  "Proud",
  "Quiet",
  "Witty",
  "Zen",
  "Bold",
  "Daring",
];

const NOUNS = [
  "Panda",
  "Falcon",
  "Otter",
  "Lynx",
  "Dolphin",
  "Eagle",
  "Fox",
  "Heron",
  "Ibis",
  "Koala",
  "Moose",
  "Raven",
  "Tiger",
  "Wolf",
  "Bear",
  "Crane",
];

export interface StampData {
  time: string;
  randomNumber: number;
  name: string;
}

/**
 * Generate stamp data inside a "use cache" boundary so the values are
 * frozen alongside the page content and share the same cache tags.
 */
export function generateStampData(): StampData {
  const now = new Date();
  const time = now.toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const randomNumber = Math.floor(Math.random() * 10000);
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return { time, randomNumber, name: `${adj} ${noun}` };
}

/**
 * Renders pre-computed stamp data. Call `generateStampData()` inside your
 * "use cache" function and pass the result as the `data` prop. That way
 * the stamp values are tied to the same cache entry and revalidated
 * together with the page content.
 */
export function GenerationStamp({ data }: { data: StampData }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Page Generation Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="font-mono text-xs">
            {data.time} UTC
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            #{String(data.randomNumber).padStart(4, "0")}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {data.name}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          These values are generated at server render time. They only change
          when the page is re-built, proving ISR and on-demand revalidation
          are working.
        </p>
      </CardContent>
    </Card>
  );
}
