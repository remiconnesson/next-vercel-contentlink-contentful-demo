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
                No entries of type <code>cl-demo-Page</code> were found in
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
// sys.contentType.sys.id === "cl-demo-Page"

switch (contentType) {
  case "cl-demo-Page":
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
              1. URL &amp; Method
            </p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
              <li>
                Go to{" "}
                <strong className="text-foreground">
                  Settings &rarr; Webhooks &rarr; Add Webhook
                </strong>
              </li>
              <li>
                URL:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  https://your-site.vercel.app/api/revalidate
                </code>
              </li>
              <li>
                Method:{" "}
                <strong className="text-foreground">POST</strong>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-semibold text-foreground">
              2. Headers
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two custom headers are required:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 pr-4 text-left font-medium text-foreground">
                      Header
                    </th>
                    <th className="pb-2 text-left font-medium text-foreground">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        x-contentful-webhook-secret
                      </code>
                    </td>
                    <td className="py-2">
                      Your{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        CONTENTFUL_REVALIDATE_SECRET
                      </code>{" "}
                      value
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        x-vercel-protection-bypass
                      </code>
                    </td>
                    <td className="py-2">
                      Your{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        VERCEL_AUTOMATION_BYPASS_SECRET
                      </code>{" "}
                      value
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Callout type="info" title="Deployment Protection">
              <p>
                If your Vercel project has Deployment Protection enabled,
                webhooks will be blocked with a 401/403. The{" "}
                <code>x-vercel-protection-bypass</code> header lets
                Contentful bypass this. Generate the secret in your Vercel
                project under{" "}
                <strong>
                  Settings &rarr; Deployment Protection &rarr; Protection
                  Bypass for Automation
                </strong>
                . The value is automatically available as the{" "}
                <code>VERCEL_AUTOMATION_BYPASS_SECRET</code> env var.
              </p>
            </Callout>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-semibold text-foreground">
              3. Triggers
            </p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
              <li>
                Select{" "}
                <strong className="text-foreground">Entry</strong> events:{" "}
                <strong className="text-foreground">
                  Publish, Unpublish
                </strong>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-semibold text-foreground">
              4. Filters
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add two filters so the webhook only fires for the right
              content in the right environment:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 pr-4 text-left font-medium text-foreground">
                      Filter
                    </th>
                    <th className="pb-2 pr-4 text-left font-medium text-foreground">
                      Operator
                    </th>
                    <th className="pb-2 text-left font-medium text-foreground">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      Content type ID{" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        sys.contentType.sys.id
                      </code>
                    </td>
                    <td className="py-2 pr-4">equals</td>
                    <td className="py-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        cl-demo-Page
                      </code>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      Environment ID{" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        sys.environment.sys.id
                      </code>
                    </td>
                    <td className="py-2 pr-4">equals</td>
                    <td className="py-2">
                      Your{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        CONTENTFUL_ENV
                      </code>{" "}
                      value (e.g.{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        staging
                      </code>
                      )
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Callout type="warning" title="Match your environment">
              <p>
                The Environment ID filter must match the{" "}
                <code>CONTENTFUL_ENV</code> your app reads from. If your app
                fetches from <code>staging</code>, set the filter to{" "}
                <code>staging</code>. If it fetches from{" "}
                <code>master</code>, set it to <code>master</code>.
                Mismatched values mean edits in Contentful will never trigger
                revalidation.
              </p>
            </Callout>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-semibold text-foreground">
              5. Payload
            </p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
              <li>
                Use the default payload (entire entry). The handler only
                reads{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  sys.id
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  sys.contentType.sys.id
                </code>
              </li>
            </ul>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Environment Variables Reference */}
        <section className="flex flex-col gap-6 pb-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Environment Variables
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            All the environment variables needed for this demo. Set them in
            your Vercel project under{" "}
            <strong className="text-foreground">
              Settings &rarr; Environment Variables
            </strong>
            .
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">
                    Variable
                  </th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">
                    Source
                  </th>
                  <th className="pb-2 text-left font-medium text-foreground">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_SPACE_ID
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">Contentful &rarr; Settings &rarr; General</td>
                  <td className="py-2.5">
                    Short alphanumeric string (e.g.{" "}
                    <code className="font-mono text-xs">xked43r46smn</code>
                    ). Not the management token.
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_ACCESS_TOKEN
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">
                    Contentful &rarr; Settings &rarr; API keys
                  </td>
                  <td className="py-2.5">
                    Content Delivery API (CDA) token. Must{" "}
                    <strong className="text-foreground">not</strong> start
                    with <code className="font-mono text-xs">CFPAT-</code>{" "}
                    (that is a management token).
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_PREVIEW_ACCESS_TOKEN
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">
                    Contentful &rarr; Settings &rarr; API keys
                  </td>
                  <td className="py-2.5">
                    Content Preview API (CPA) token. Used for draft mode and
                    Content Source Maps on preview deployments.
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_ENV
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">You choose</td>
                  <td className="py-2.5">
                    Contentful environment to query (e.g.{" "}
                    <code className="font-mono text-xs">master</code>,{" "}
                    <code className="font-mono text-xs">staging</code>).
                    Defaults to{" "}
                    <code className="font-mono text-xs">master</code>. The
                    API key must have access to this environment.
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_REVALIDATE_SECRET
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">You generate</td>
                  <td className="py-2.5">
                    Any random string. Must match the{" "}
                    <code className="font-mono text-xs">
                      x-contentful-webhook-secret
                    </code>{" "}
                    header in your Contentful webhook.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      CONTENTFUL_MANAGEMENT_TOKEN
                    </code>
                  </td>
                  <td className="py-2.5 pr-4">
                    Contentful &rarr; Settings &rarr; CMA tokens
                  </td>
                  <td className="py-2.5">
                    Only needed for scripts (setup, migrations). Starts with{" "}
                    <code className="font-mono text-xs">CFPAT-</code>. Not
                    used at runtime.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="warning" title="Common mistake">
            <p>
              Do not confuse the CDA token with the CMA (management) token.
              The CDA token is found under{" "}
              <strong>Settings &rarr; API keys</strong> and does not start
              with <code>CFPAT-</code>. If{" "}
              <code>CONTENTFUL_ACCESS_TOKEN</code> starts with{" "}
              <code>CFPAT-</code>, the app will throw an explicit error.
            </p>
          </Callout>

          <Callout type="info" title="API key environment access">
            <p>
              Contentful API keys are scoped to specific environments. If
              you use <code>CONTENTFUL_ENV=staging</code>, your CDA/CPA API
              key must include <code>staging</code> in its allowed
              environments list. Check this in{" "}
              <strong>
                Settings &rarr; API keys &rarr; (your key) &rarr;
                Environments
              </strong>
              .
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
