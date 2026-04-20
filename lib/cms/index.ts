import type { Document } from "@contentful/rich-text-types";
import { encodeGraphQLResponse } from "@contentful/live-preview";
import { vercelStegaClean } from "@vercel/stega";
import type { Page } from "../types";

// ─── GraphQL fetcher ────────────────────────────────────────────────

interface ContentfulResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
  extensions?: Record<string, unknown>;
}

// ─── Environment helpers ────────────────────────────────────────────

/**
 * Returns true when running on a Vercel preview deployment or when
 * draft mode is explicitly requested. On preview deployments we always
 * want stega-encoded Content Source Maps so the Vercel Toolbar shows
 * Content Link edit buttons without requiring the user to enable draft
 * mode first.
 */
function shouldUsePreviewApi(draft: boolean): boolean {
  if (draft) return true;
  return process.env.VERCEL_ENV === "preview";
}

function getSpaceId(): string {
  const raw = process.env.CONTENTFUL_SPACE_ID;
  if (!raw) throw new Error("Missing CONTENTFUL_SPACE_ID env var");
  return raw;
}

function getToken(usePreview: boolean): string {
  if (usePreview) {
    const token = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
    if (!token) throw new Error("Missing CONTENTFUL_PREVIEW_ACCESS_TOKEN env var");
    return token;
  }
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!token) throw new Error("Missing CONTENTFUL_ACCESS_TOKEN env var");
  return token;
}

async function fetchContent<T = Record<string, unknown>>(
  query: string,
  variables: Record<string, unknown> = {},
  draft = false,
): Promise<T> {
  const usePreview = shouldUsePreviewApi(draft);
  const spaceId = getSpaceId();
  const token = getToken(usePreview);

  if (!spaceId || !token) {
    throw new Error("Missing Contentful environment variables");
  }

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { ...variables, preview: usePreview },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Contentful HTTP ${response.status}: ${errorText}`);
  }

  const json: ContentfulResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(
      `Contentful GraphQL errors: ${JSON.stringify(json.errors)}`,
    );
  }

  // Content Source Maps enable field-level Content Link in the Vercel
  // Toolbar. The extensions object is only present when
  // @contentSourceMaps is in the query AND the Preview API is used.
  // We encode on both draft mode AND Vercel preview deployments so
  // the toolbar works without requiring the editor to enable draft mode.
  if (usePreview && json.extensions) {
    return encodeGraphQLResponse({
      data: json.data,
      extensions: json.extensions,
    }).data;
  }

  return json.data;
}

// ─── GraphQL queries ────────────────────────────────────────────────

const GET_PAGES_QUERY = `
  query GetPages($preview: Boolean) @contentSourceMaps {
    clDemoPageCollection(preview: $preview, order: [title_ASC]) {
      items {
        sys { id }
        title
        slug
        body { json }
      }
    }
  }
`;

const GET_PAGE_BY_SLUG_QUERY = `
  query GetPageBySlug($slug: String!, $preview: Boolean) @contentSourceMaps {
    clDemoPageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items {
        sys { id }
        title
        slug
        body { json }
      }
    }
  }
`;

// ─── Reshaping ──────────────────────────────────────────────────────

function reshapeToPage(item: Record<string, unknown>): Page {
  const sys = item.sys as { id: string };
  return {
    id: sys.id,
    // Always strip stega from slug -- it is used for routing, cache
    // tags, and GraphQL variables where invisible characters break things.
    slug: vercelStegaClean(item.slug as string),
    title: item.title as string,
    body: (item.body as { json: Document })?.json ?? null,
  };
}

// ─── Exported data-fetching functions ───────────────────────────────

export async function getPages(draft = false): Promise<Page[]> {
  const res = await fetchContent<{
    clDemoPageCollection: { items: Record<string, unknown>[] };
  }>(GET_PAGES_QUERY, {}, draft);

  return res?.clDemoPageCollection?.items?.map(reshapeToPage) ?? [];
}

export async function getPageBySlug(
  slug: string,
  draft = false,
): Promise<Page | undefined> {
  // Ensure the slug sent to Contentful is free of stega encoding
  const cleanSlug = vercelStegaClean(slug);
  const res = await fetchContent<{
    clDemoPageCollection: { items: Record<string, unknown>[] };
  }>(GET_PAGE_BY_SLUG_QUERY, { slug: cleanSlug }, draft);

  const item = res?.clDemoPageCollection?.items?.[0];
  return item ? reshapeToPage(item) : undefined;
}
