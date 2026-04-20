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
import { getPages } from "@/lib/cms";

async function getCachedPages() {
  "use cache";
  cacheLife("max");
  cacheTag("page:list");

  const pages = await getPages();
  return pages;
}

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode();
  const pages = draft ? await getPages(true) : await getCachedPages();

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
    pageCollection(preview: $preview) {
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
                No entries of type <code>Page</code> were found in your
                Contentful space. Create some entries with a title, slug, and
                body to see them listed here.
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

        {/* Footer */}
        <Separator className="mb-6" />
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
