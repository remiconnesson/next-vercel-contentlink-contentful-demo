import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { DemoNav } from "@/components/demo-nav";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Pencil, Eye, RefreshCw } from "lucide-react";
import {
  GenerationStamp,
  generateStampData,
  type StampData,
} from "@/components/generation-stamp";
import { getPages } from "@/lib/cms";

async function getCachedPages(): Promise<{
  pages: Awaited<ReturnType<typeof getPages>>;
  stamp: StampData;
}> {
  "use cache";
  cacheLife("max");
  cacheTag("page:list");

  const pages = await getPages();
  const stamp = generateStampData();
  return { pages, stamp };
}

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode();

  let pages: Awaited<ReturnType<typeof getPages>>;
  let stamp: StampData;

  if (draft) {
    pages = await getPages(true);
    stamp = generateStampData();
  } else {
    const cached = await getCachedPages();
    pages = cached.pages;
    stamp = cached.stamp;
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath="/" />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="flex flex-col gap-4 pb-8">
          <Badge variant="secondary" className="w-fit">
            Contentful + Vercel
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Content Link Demo
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            This demo shows how{" "}
            <strong className="text-foreground">Vercel Content Link</strong>{" "}
            connects your deployed site to Contentful, so editors can click
            any piece of content and jump straight to the matching field in
            the CMS.
          </p>
        </div>

        <Separator className="mb-10" />

        {/* How it works */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            How does Content Link work?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Content Link uses{" "}
            <strong className="text-foreground">Content Source Maps</strong>{" "}
            -- hidden metadata encoded into your GraphQL responses -- to map
            every rendered string back to the exact field and entry in
            Contentful.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pencil className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">
                  1. Content Source Maps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    @contentSourceMaps
                  </code>{" "}
                  to your GraphQL queries. Contentful returns hidden metadata
                  alongside your data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">
                  2. Vercel Toolbar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  The Vercel Toolbar reads the encoded metadata and overlays
                  edit buttons on every CMS-managed element on your preview
                  deployment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCw className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">
                  3. Click to edit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Editors click a field on the live site and land directly in
                  Contentful at the right entry and field. No searching, no
                  guessing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* The key: @contentSourceMaps */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            The key ingredient
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The only change to your data layer is the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              @contentSourceMaps
            </code>{" "}
            directive on your GraphQL query and calling{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              encodeGraphQLResponse
            </code>{" "}
            in draft mode.
          </p>
          <CodeBlock
            filename="lib/cms/index.ts"
            code={`const GET_PAGES_QUERY = \`
  query GetPages($preview: Boolean) @contentSourceMaps {
    clDemoPageCollection(preview: $preview) {
      items {
        sys { id }
        title
        slug
        body { json }
      }
    }
  }
\`;

// In the fetcher, encode the response in draft mode:
if (draft && json.extensions) {
  return encodeGraphQLResponse({
    data: json.data,
    extensions: json.extensions,
  }).data;
}`}
            highlight={[2, 16, 17, 18, 19]}
          />
          <Callout type="tip" title="No extra setup needed">
            <p>
              Content Source Maps work automatically on Vercel preview
              deployments. The Vercel Toolbar detects the encoded metadata
              and shows edit links without any configuration.
            </p>
          </Callout>
        </section>

        <Separator className="mb-10" />

        {/* Live pages from Contentful */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Pages from Contentful
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            These pages are fetched from your Contentful space at build time
            and cached. On a Vercel preview deployment, hover over any title
            below to see the Content Link edit button.
          </p>

          {pages.length === 0 ? (
            <Callout type="warning" title="No pages found">
              <p>
                No entries of type <code>clDemoPage</code> were found in
                your Contentful space. Create some entries with a title,
                slug, and body to see them listed here.
              </p>
            </Callout>
          ) : (
            <div className="grid gap-4">
              {pages.map((page) => (
                <Link key={page.id} href={`/${page.slug}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {page.title}
                        </CardTitle>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                      <CardDescription>/{page.slug}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {draft && (
            <Badge variant="outline" className="w-fit">
              Draft mode active -- showing preview content
            </Badge>
          )}
        </section>

        {/* ISR + On-Demand Revalidation Demo */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            ISR + On-Demand Revalidation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Each page is cached independently with its own{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              cacheTag
            </code>
            . When Contentful fires a webhook, only the changed page is
            revalidated -- the others keep serving from cache. The
            generation stamp below proves it: edit a page in Contentful,
            and only that page&apos;s stamp changes.
          </p>

          <GenerationStamp data={stamp} />

          <Callout type="info" title="How to verify">
            <p>
              Open two page tabs side by side (e.g. <code>/hello-world</code>{" "}
              and <code>/about</code>). Edit one entry in Contentful and
              publish. Refresh both tabs -- only the edited page&apos;s
              generation stamp will change.
            </p>
          </Callout>

          <h3 className="text-lg font-semibold text-foreground pt-2">
            Cache Tag Strategy
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Each page registers two tags: one by slug (for the Next.js cache
            key) and one by Contentful entry ID (for the webhook). The
            landing page uses a separate <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">page:list</code> tag.
          </p>
          <CodeBlock
            filename="app/[slug]/page.tsx"
            code={`async function getCachedPage(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(\`page:slug:\${slug}\`);

  const page = await getPageBySlug(slug);
  if (page) {
    cacheTag(\`page:id:\${page.id}\`);
  }
  // Stamp data is generated inside the cache boundary
  // so it shares the same tags and revalidates together.
  const stamp = generateStampData();
  return { page: page ?? null, stamp };
}`}
            highlight={[3, 4, 8, 13]}
          />

          <h3 className="text-lg font-semibold text-foreground pt-2">
            Webhook Handler
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The webhook at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              /api/revalidate
            </code>{" "}
            reads the entry ID from the Contentful payload and revalidates
            only the matching cache tag.
          </p>
          <CodeBlock
            filename="app/api/revalidate/route.ts"
            code={`// The webhook handler matches on the namespaced content
// type ID from the Contentful payload:
// sys.contentType.sys.id === "clDemoPage"

switch (contentType) {
  case "clDemoPage":
    // Always revalidate the individual page
    tags.push(\`page:id:\${entryId}\`);
    // Always revalidate the list page too
    tags.push("page:list");
    break;
}`}
            highlight={[6]}
          />

          <h3 className="text-lg font-semibold text-foreground pt-2">
            Contentful Webhook Setup
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            To enable on-demand revalidation, create a webhook in Contentful
            that fires on entry publish / unpublish events.
          </p>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-semibold text-foreground">
              Step-by-step
            </p>
            <ol className="flex flex-col gap-2 text-sm text-muted-foreground list-decimal pl-5 leading-relaxed">
              <li>
                In Contentful, go to{" "}
                <strong className="text-foreground">
                  Settings &rarr; Webhooks &rarr; Add Webhook
                </strong>
              </li>
              <li>
                Set the URL to your deployed site:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  https://your-site.vercel.app/api/revalidate
                </code>
              </li>
              <li>
                Set method to <strong className="text-foreground">POST</strong>
              </li>
              <li>
                Add a custom header:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  x-contentful-webhook-secret
                </code>{" "}
                with the value of your{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  CONTENTFUL_REVALIDATE_SECRET
                </code>{" "}
                env var
              </li>
              <li>
                Under <strong className="text-foreground">Triggers</strong>,
                select <strong className="text-foreground">Entry</strong> events:{" "}
                Publish, Unpublish
              </li>
              <li>
                Under <strong className="text-foreground">Filters</strong>,
                filter by content type ID{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  clDemoPage
                </code>{" "}
                so the webhook only fires for entries matching this content
                model
              </li>
              <li>
                Under <strong className="text-foreground">Payload</strong>,
                use the default (entire entry). The handler reads{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  sys.id
                </code>{" "}
                and matches{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  sys.contentType.sys.id === {'"clDemoPage"'}
                </code>
              </li>
              <li>Save and test by publishing an entry</li>
            </ol>
          </div>

          <Callout type="tip" title="Environment variable">
            <p>
              Make sure{" "}
              <code>CONTENTFUL_REVALIDATE_SECRET</code>{" "}
              is set in your Vercel project&apos;s environment variables. It can
              be any random string -- just make sure it matches the webhook
              header value.
            </p>
          </Callout>
        </section>

        {/* Footer */}
        <Separator className="my-6" />
        <footer className="flex flex-col gap-2 pb-12 text-sm text-muted-foreground">
          <p>
            Built with Next.js 16, Contentful, and Vercel Content Link.
          </p>
          <p>
            Learn more in the{" "}
            <a
              href="https://vercel.com/docs/workflow-collaboration/content-link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Vercel Content Link documentation
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}
