import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { DemoNav } from "@/components/demo-nav";
import { HomeContent } from "@/components/home-content";
import {
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
      <HomeContent pages={pages} stamp={stamp} draft={draft} />
    </div>
  );
}
