import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { DemoNav } from "@/components/demo-nav";
import { ContentRenderer } from "@/lib/cms/content-renderer";
import { getPageBySlug, getPages } from "@/lib/cms";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GenerationStamp } from "@/components/generation-stamp";

// Pre-render all known slugs at build time
export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((p) => ({ slug: p.slug }));
}

async function getCachedPage(slug: string) {
  "use cache";
  cacheLife("max");
  // Tag by slug so generateMetadata can also hit the same cache entry.
  // After fetching, we add a tag for the entry ID so the Contentful
  // webhook (which only knows the entry ID) can revalidate this page
  // without touching the list page.
  cacheTag(`page:slug:${slug}`);

  const page = await getPageBySlug(slug);
  if (page) {
    cacheTag(`page:id:${page.id}`);
  }
  return page ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getCachedPage(slug);
  if (!page) return {};
  return { title: page.title, description: `${page.title} — Content Link Demo` };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();

  const page = draft
    ? await getPageBySlug(slug, true)
    : await getCachedPage(slug);

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath={`/${slug}`} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          All pages
        </Link>

        <div className="flex flex-col gap-4 pb-8">
          {draft && (
            <Badge variant="outline" className="w-fit">
              Draft mode
            </Badge>
          )}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {page.title}
          </h1>
        </div>

        <Separator className="mb-10" />

        <article className="pb-12">
          <ContentRenderer content={page.body} />
        </article>

        <GenerationStamp />

        <Separator className="my-6" />
        <footer className="pb-12 text-sm text-muted-foreground">
          <p>
            On a Vercel preview deployment, hover over the title or body text
            above to see Content Link edit buttons that open Contentful
            directly.
          </p>
        </footer>
      </main>
    </div>
  );
}
