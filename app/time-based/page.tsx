import { cacheLife } from "next/cache"
import { DemoNav } from "@/components/demo-nav"
import { TimestampCard } from "@/components/timestamp-card"
import { CodeBlock } from "@/components/code-block"
import { Callout } from "@/components/callout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { generateRandomName } from "@/lib/random-name"

// ---------------------------------------------------------------
// This cached function generates a timestamp and random value.
// The result is cached for 15 seconds. After 15s the cache is
// stale, and the next call triggers background regeneration.
// ---------------------------------------------------------------
async function getPageData() {
  "use cache"
  cacheLife({
    stale: 15,
    revalidate: 15,
    expire: 300,
  })

  const now = new Date()
  const generatedAt = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })
  const randomValue = Math.floor(Math.random() * 100_000)
  const randomName = generateRandomName()

  return { generatedAt, randomValue, randomName }
}

export default async function TimeBasedPage() {
  const { generatedAt, randomValue, randomName } = await getPageData()

  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath="/time-based" />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-4 pb-8">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Strategy 1</Badge>
            <Badge variant="outline" className="font-mono text-xs">
              cacheLife &#x2014; 15s
            </Badge>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Time-based revalidation
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed">
            This page re-generates automatically every 15 seconds. Refresh
            repeatedly and watch the timestamp and random value below: they
            will stay the same until the 15-second window expires.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Live demo */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Live result
          </h2>
          <TimestampCard
            generatedAt={generatedAt}
            cacheStatus="cacheLife: 15s"
            randomValue={randomValue}
            randomName={randomName}
            title="Cached page data"
            description="These values were captured when the page was last rendered on the server."
          />

          <Callout type="info" title="How to test">
            <ol className="mt-1 flex flex-col gap-2 text-sm">
              <li>
                <strong>1.</strong> Note the timestamp, random value, and random
                name above.
              </li>
              <li>
                <strong>2.</strong> Refresh immediately &mdash; all three values
                stay the same. The page is served from cache.
              </li>
              <li>
                <strong>3.</strong> Wait at least 15 seconds, then refresh
                &mdash; all three values change. The cache has expired and
                Next.js generated a fresh version.
              </li>
              <li>
                <strong>4.</strong> Refresh again right away &mdash; the values
                stay the same. The fresh page is now cached for another 15
                seconds.
              </li>
            </ol>
          </Callout>
        </section>

        <Separator className="mb-8" />

        {/* Source code walkthrough */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Source code
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The entire implementation uses the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              &quot;use cache&quot;
            </code>{" "}
            directive with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              cacheLife()
            </code>{" "}
            to control the revalidation window:
          </p>

          <CodeBlock
            filename="app/time-based/page.tsx"
            code={`import { cacheLife } from "next/cache"

// Cached data function — revalidates every 15 seconds
async function getPageData() {
  "use cache"
  cacheLife({
    stale: 15,      // serve stale for 15s
    revalidate: 15, // revalidate after 15s
    expire: 300,    // expire after 5 min
  })

  return {
    generatedAt: new Date().toLocaleTimeString(...),
    randomValue: Math.floor(Math.random() * 100_000),
  }
}

export default async function TimeBasedPage() {
  const { generatedAt, randomValue } = await getPageData()

  return (
    <div>
      <p>Generated at: {generatedAt}</p>
      <p>Random value: {randomValue}</p>
    </div>
  )
}`}
            highlight={[4, 5, 6, 7, 8, 9, 10]}
          />

          <Callout type="tip" title="Why &quot;use cache&quot;?">
            <p>
              In Next.js 16, the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                &quot;use cache&quot;
              </code>{" "}
              directive (enabled via{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                cacheComponents: true
              </code>{" "}
              in next.config) marks a component or function as cacheable. The{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                cacheLife()
              </code>{" "}
              call controls how long the cached result lives.
            </p>
          </Callout>
        </section>

        <Separator className="mb-8" />

        {/* config callout */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Required configuration
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To use{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              &quot;use cache&quot;
            </code>{" "}
            you must enable{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              cacheComponents
            </code>{" "}
            in your Next.js config:
          </p>
          <CodeBlock
            filename="next.config.mjs"
            code={`/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
}

export default nextConfig`}
            highlight={[3]}
          />
        </section>

        <Separator className="mb-8" />

        {/* Timeline */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            What happens under the hood
          </h2>

          <div className="flex flex-col gap-0">
            {[
              {
                time: "t = 0s",
                title: "Build / first request",
                desc: 'Next.js renders the page and caches the result. The "use cache" directive with cacheLife({revalidate: 15}) starts the timer.',
              },
              {
                time: "t < 15s",
                title: "Within the stale window",
                desc: "All requests get the cached HTML instantly. No server rendering occurs.",
              },
              {
                time: "t = 15s",
                title: "Window expires",
                desc: "The cache is now considered stale. The next request still gets the stale version.",
              },
              {
                time: "t > 15s (first hit)",
                title: "Background regeneration triggered",
                desc: 'The visitor gets the stale page, but Next.js re-renders the page in the background. This is the "stale-while-revalidate" pattern.',
              },
              {
                time: "t > 15s (next hit)",
                title: "Fresh page served",
                desc: "The regenerated page replaces the old cache. All new requests get the fresh version. The timer resets.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-mono font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex flex-col gap-1 pb-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {step.time}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* cacheLife profiles */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Built-in cacheLife profiles
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Instead of a custom object, you can use built-in profile names
            for common durations:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">
                    Profile
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-foreground">
                    stale
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-foreground">
                    revalidate
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-foreground">
                    expire
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground font-mono text-xs">
                {[
                  ["seconds", "0", "1s", "60s"],
                  ["minutes", "5m", "1m", "1h"],
                  ["hours", "5m", "1h", "1d"],
                  ["days", "5m", "1d", "1w"],
                  ["weeks", "5m", "1w", "30d"],
                  ["max", "5m", "30d", "indefinite"],
                ].map(([profile, stale, revalidate, expire]) => (
                  <tr key={profile} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {profile}
                    </td>
                    <td className="py-3 px-4">{stale}</td>
                    <td className="py-3 px-4">{revalidate}</td>
                    <td className="py-3 pl-4">{expire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock
            filename="example.tsx"
            code={`import { cacheLife } from "next/cache"

// Use a built-in profile
export async function getData() {
  "use cache"
  cacheLife("hours") // stale: 5m, revalidate: 1h, expire: 1d
  return fetch("/api/data")
}`}
            highlight={[6]}
          />
        </section>
      </main>
    </div>
  )
}
