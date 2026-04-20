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

function randomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

/**
 * Shows the page generation timestamp, a random number, and a random
 * name. All three values are computed at server render time, so they
 * only change when the page is regenerated (proving ISR / revalidation).
 *
 * The "use cache" directive makes this a Cache Component -- Next.js
 * captures `new Date()` and `Math.random()` at cache time and freezes
 * them until the cache entry is revalidated.
 */
export async function GenerationStamp() {
  "use cache";
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
  const name = randomName();

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
            {time} UTC
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            #{String(randomNumber).padStart(4, "0")}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {name}
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
