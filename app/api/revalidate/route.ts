import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag")

  if (!tag) {
    return NextResponse.json(
      { error: "Missing 'tag' query parameter. Usage: /api/revalidate?tag=post-1" },
      { status: 400 }
    )
  }

  // Purge all cache entries associated with this tag.
  // The 'max' cache life profile enables stale-while-revalidate behavior.
  revalidateTag(tag, "max")

  return NextResponse.json({
    revalidated: true,
    tag,
    now: Date.now(),
  })
}
