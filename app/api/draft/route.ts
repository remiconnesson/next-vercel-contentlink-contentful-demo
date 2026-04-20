import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPageBySlug } from "@/lib/cms";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Validate the shared secret
  if (
    !process.env.CONTENTFUL_PREVIEW_SECRET ||
    secret !== process.env.CONTENTFUL_PREVIEW_SECRET
  ) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable draft mode (sets a cookie)
  const draft = await draftMode();
  draft.enable();

  // If a slug was provided, validate and redirect
  if (slug) {
    const page = await getPageBySlug(slug, true);
    if (page?.slug) {
      redirect(`/${page.slug}`);
    }
    return new Response(`Entry "${slug}" not found`, { status: 404 });
  }

  return new Response("Draft mode enabled", { status: 200 });
}
