import { cacheTag, cacheLife } from "next/cache"
import { DemoNav } from "@/components/demo-nav"
import { TimestampCard } from "@/components/timestamp-card"
import { RevalidateButton } from "@/components/revalidate-button"
import { CodeBlock } from "@/components/code-block"
import { Callout } from "@/components/callout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { generateRandomName } from "@/lib/random-name"

// ---------------------------------------------------------------
// Simulated "post" data. In a real app, you would fetch this from
// a CMS or database.
// ---------------------------------------------------------------
const posts: Record<string, { title: string; body: string }> = {
  "post-1": {
    title: "Understanding ISR with pre-built pages",
    body: "This page was listed in generateStaticParams, so Next.js pre-rendered it at build time. It exists in the cache from the very first deployment.",
  },
  "post-2": {
    title: "Understanding ISR with dynamic pages",
    body: "This page was NOT listed in generateStaticParams. It was rendered on the first user request and then cached. This is sometimes called 'on-demand ISR' or 'lazy ISR'.",
  },
}

// ---------------------------------------------------------------
// generateStaticParams tells Next.js which slugs to pre-render
// at build time. Only "post-1" is listed here intentionally.
// "post-2" will be rendered on the first request instead.
// ---------------------------------------------------------------
export function generateStaticParams() {
  return [{ slug: "post-1" }]
}

// ---------------------------------------------------------------
// Cached data function. Tagged with the slug so we can invalidate
// individual posts on demand via revalidateTag(slug).
// ---------------------------------------------------------------
async function getPostPageData(slug: string) {
  "use cache"
  cacheTag(slug)
  cacheLife("max")

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

export default async function OnDemandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <DemoNav />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-bold text-foreground">
            Post not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            Try{" "}
            <Link
              href="/on-demand/post-1"
              className="text-primary underline"
            >
              /on-demand/post-1
            </Link>{" "}
            or{" "}
            <Link
              href="/on-demand/post-2"
              className="text-primary underline"
            >
              /on-demand/post-2
            </Link>
            .
          </p>
        </main>
      </div>
    )
  }

  const isPreBuilt = slug === "post-1"
  const { generatedAt, randomValue, randomName } = await getPostPageData(slug)

  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath={`/on-demand/${slug}`} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 pb-8">
          <Link
            href="/"
            className="group flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Strategy 2</Badge>
            <Badge variant="outline" className="font-mono text-xs">
              on-demand revalidation
            </Badge>
            {isPreBuilt ? (
              <Badge className="bg-emerald-100 text-emerald-900">
                Pre-built at build time
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-900">
                Rendered on first request
              </Badge>
            )}
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed">
            {post.body}
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
            cacheStatus={isPreBuilt ? "pre-built" : "lazy-rendered"}
            randomValue={randomValue}
            randomName={randomName}
            title="Cached page data"
            description={
              isPreBuilt
                ? "This page was pre-rendered at build time via generateStaticParams."
                : "This page was rendered on the first visit and then cached."
            }
          />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Trigger on-demand revalidation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the button below to call{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                revalidateTag(&quot;{slug}&quot;)
              </code>{" "}
              via an API route. Then refresh the page to see new data.
            </p>
            <RevalidateButton tag={slug} />
          </div>

          <Callout type="tip" title="Test flow">
            <ol className="mt-1 flex flex-col gap-2 text-sm">
              <li>
                <strong>1.</strong> Note the current timestamp, random value,
                and random name.
              </li>
              <li>
                <strong>2.</strong> Click &quot;Revalidate now&quot; to purge
                the cache entry for this page.
              </li>
              <li>
                <strong>3.</strong> Refresh the page &mdash; all three values
                change. The cache was invalidated and a fresh version was
                generated.
              </li>
              <li>
                <strong>4.</strong> Refresh again without revalidating &mdash;
                values stay the same (cached again).
              </li>
            </ol>
          </Callout>
        </section>

        <Separator className="mb-8" />

        {/* Source walkthrough */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Source code walkthrough
          </h2>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              1. The dynamic page component
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A cached helper function uses{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                cacheTag(slug)
              </code>{" "}
              to associate each post&apos;s cache entry with a tag, and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                cacheLife(&quot;max&quot;)
              </code>{" "}
              to keep it cached until manually invalidated. Only{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                post-1
              </code>{" "}
              is listed in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                generateStaticParams
              </code>
              .
            </p>
            <CodeBlock
              filename="app/on-demand/[slug]/page.tsx"
              code={`import { cacheTag, cacheLife } from "next/cache"

// Cached data function — tagged per slug for on-demand invalidation
async function getPostPageData(slug: string) {
  "use cache"
  cacheTag(slug)
  cacheLife("max")

  return {
    generatedAt: new Date().toISOString(),
    randomValue: Math.floor(Math.random() * 100_000),
  }
}

// Only "post-1" is pre-rendered at build time
export function generateStaticParams() {
  return [{ slug: "post-1" }]
}

export default async function OnDemandPage({ params }) {
  const { slug } = await params
  const { generatedAt, randomValue } = await getPostPageData(slug)

  return (
    <div>
      <h1>{slug}</h1>
      <p>Generated at: {generatedAt}</p>
      <p>Random: {randomValue}</p>
    </div>
  )
}`}
              highlight={[4, 5, 6, 7, 22]}
            />
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              2. The revalidation API route
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Route Handler receives a tag name via query parameter and
              calls{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                revalidateTag()
              </code>{" "}
              to purge all cached entries that were tagged with that name. The
              second argument{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                &quot;max&quot;
              </code>{" "}
              sets how long stale content can be served while fresh content
              generates in the background.
            </p>
            <CodeBlock
              filename="app/api/revalidate/route.ts"
              code={`import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag")

  if (!tag) {
    return NextResponse.json(
      { error: "Missing tag parameter" },
      { status: 400 }
    )
  }

  // Purge all cache entries tagged with this name.
  // "max" = stale-while-revalidate (serve stale while regenerating)
  revalidateTag(tag, "max")

  return NextResponse.json({
    revalidated: true,
    tag,
    now: Date.now(),
  })
}`}
              highlight={[16]}
            />
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Comparison */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Pre-built vs. dynamically rendered
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">
                    Aspect
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-foreground">
                    post-1 (pre-built)
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-foreground">
                    post-2 (dynamic)
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    In generateStaticParams?
                  </td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">No</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    When is it rendered?
                  </td>
                  <td className="py-3 px-4">At build time</td>
                  <td className="py-3 pl-4">On first user request</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    First visit experience
                  </td>
                  <td className="py-3 px-4">Instant (pre-cached)</td>
                  <td className="py-3 pl-4">
                    Slight delay (server render), then cached
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    Subsequent visits
                  </td>
                  <td className="py-3 px-4">Instant (from cache)</td>
                  <td className="py-3 pl-4">Instant (from cache)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    On-demand revalidation
                  </td>
                  <td className="py-3 px-4">Supported via cacheTag</td>
                  <td className="py-3 pl-4">Supported via cacheTag</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="info">
            <p>
              Once cached, both pages behave identically. The only difference
              is <em>when</em> the initial render happens: build time vs. first
              request.
            </p>
          </Callout>
        </section>

        {/* Navigation */}
        <Separator className="mb-6" />
        <div className="flex gap-4 pb-12">
          {slug === "post-1" ? (
            <Link
              href="/on-demand/post-2"
              className="text-sm font-medium text-primary hover:underline"
            >
              View the dynamically rendered page (post-2) &rarr;
            </Link>
          ) : (
            <Link
              href="/on-demand/post-1"
              className="text-sm font-medium text-primary hover:underline"
            >
              &larr; View the pre-built page (post-1)
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
