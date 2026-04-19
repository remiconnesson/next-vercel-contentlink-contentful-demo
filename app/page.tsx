import Link from "next/link"
import { DemoNav } from "@/components/demo-nav"
import { CodeBlock } from "@/components/code-block"
import { Callout } from "@/components/callout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Clock, Zap, RefreshCw } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath="/" />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="flex flex-col gap-4 pb-8">
          <Badge variant="secondary" className="w-fit">
            Next.js App Router
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Incremental Static Regeneration
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            ISR lets you create or update static pages{" "}
            <strong className="text-foreground">after</strong> you&apos;ve built
            your site, without rebuilding the entire app. It combines the
            performance of static generation with the flexibility of
            server-side rendering.
          </p>
        </div>

        <Separator className="mb-10" />

        {/* What is ISR */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            How does ISR work?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            When a user requests a page that has been statically generated,
            Next.js serves the cached version instantly. In the background, it
            checks whether the page needs to be regenerated based on the
            revalidation strategy you chose.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">1. Initial request</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Next.js serves the pre-rendered HTML from cache. The response
                  is instant, just like a CDN-served static file.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">
                  2. Background regeneration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  After the revalidation period expires, the next request
                  triggers a background rebuild. The stale page is served while
                  the new one generates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCw className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">3. Fresh content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Once regeneration completes, subsequent requests receive the
                  freshly-rendered page. The old cache entry is replaced.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Two strategies */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Two revalidation strategies
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Next.js gives you two ways to tell it when a cached page should be
            refreshed. You can use either one, or combine them.
          </p>

          {/* Strategy 1: Time-based */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge>Strategy 1</Badge>
                <CardTitle className="text-lg">
                  Time-based revalidation
                </CardTitle>
              </div>
              <CardDescription>
                Automatically refresh cached data after a set time interval.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">&quot;use cache&quot;</code>{" "}
                  directive with{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">cacheLife()</code>{" "}
                  to control how long the page stays cached. Next.js will serve the
                  cached page until the timer expires, then regenerate it on the
                  next request.
                </p>
                <CodeBlock
                  filename="app/time-based/page.tsx"
                  code={`import { cacheLife } from "next/cache"

// Cached function — revalidates every 15 seconds
async function getPageData() {
  "use cache"
  cacheLife({ stale: 15, revalidate: 15, expire: 300 })

  return { timestamp: new Date().toISOString() }
}

export default async function Page() {
  const data = await getPageData()
  return <div>{data.timestamp}</div>
}`}
                  highlight={[5, 6]}
                />
                <Callout type="tip" title="Stale-while-revalidate pattern">
                  <p>
                    The first request after the 15-second window still gets the
                    stale page. The regeneration happens in the background.
                    The <em>following</em> request gets the fresh version.
                  </p>
                </Callout>
                <Link
                  href="/time-based"
                  className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Try the live demo
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Strategy 2: On-demand */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge>Strategy 2</Badge>
                <CardTitle className="text-lg">
                  On-demand revalidation
                </CardTitle>
              </div>
              <CardDescription>
                Manually purge cached data when something changes (e.g., CMS
                update, form submission).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tag your cached pages with{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">cacheTag()</code>{" "}
                  inside a{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">&quot;use cache&quot;</code>{" "}
                  scope. Then call{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">revalidateTag()</code>{" "}
                  in a Route Handler or Server Action to invalidate them.
                </p>
                <CodeBlock
                  filename="app/api/revalidate/route.ts"
                  code={`import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag")
  if (!tag) {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 })
  }

  // Purge all cache entries tagged with this name
  revalidateTag(tag, "max")
  return NextResponse.json({ revalidated: true, tag })
}`}
                  highlight={[11]}
                />
                <Callout type="info" title="generateStaticParams">
                  <p>
                    Pages listed in <code>generateStaticParams</code> are
                    pre-rendered at build time. Pages <em>not</em> listed are
                    rendered on first request, then cached. Both can be
                    revalidated on demand.
                  </p>
                </Callout>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/on-demand/post-1"
                    className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Pre-built page demo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <span className="text-muted-foreground/50">|</span>
                  <Link
                    href="/on-demand/post-2"
                    className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Dynamic page demo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="mb-10" />

        {/* Key concepts */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Key concepts to remember
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground">
                fetch() cache integration
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can set revalidation per-fetch using{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {"fetch(url, { next: { revalidate: 15 } })"}
                </code>{" "}
                for granular control. Tags work similarly with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {"{ next: { tags: ['my-tag'] } }"}
                </code>.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground">
                revalidateTag vs revalidatePath
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">revalidateTag</code>{" "}
                invalidates all entries sharing a tag across routes.{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">revalidatePath</code>{" "}
                invalidates a specific route path.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Dev mode caveat
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ISR only works in production builds (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">next build && next start</code>
                ). In dev mode, pages are always server-rendered on every
                request.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Dynamic segments
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pages using{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">params</code>{" "}
                (like <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/on-demand/[slug]</code>)
                can optionally export{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">generateStaticParams</code>{" "}
                to pre-generate specific pages at build time.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Separator className="mb-6" />
        <footer className="flex flex-col gap-2 pb-12 text-sm text-muted-foreground">
          <p>
            Built with Next.js 16 App Router. View the source code in each demo
            page to understand the implementation.
          </p>
          <p>
            Learn more in the{" "}
            <a
              href="https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Next.js ISR documentation
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  )
}
