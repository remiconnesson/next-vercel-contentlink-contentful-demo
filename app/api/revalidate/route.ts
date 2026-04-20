import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // Validate webhook secret (sent as a custom header)
  const secret = request.headers.get("x-contentful-webhook-secret");
  if (!secret || secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  const sys = body?.sys as
    | { contentType?: { sys?: { id?: string } }; id?: string }
    | undefined;
  const contentType = sys?.contentType?.sys?.id;
  const entryId = sys?.id;

  if (!contentType || !entryId) {
    return new Response("Missing contentType or entryId", { status: 400 });
  }

  const tags: string[] = [];

  switch (contentType) {
    case "page":
      // Always revalidate the individual page by its entry ID
      tags.push(`page:id:${entryId}`);
      // Always revalidate the list page too -- it displays titles and
      // slugs that may have changed on any publish, not just removals.
      tags.push("page:list");
      break;
    default:
      return new Response(`Unknown type: ${contentType}`, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return Response.json({ success: true, revalidated: tags });
}
