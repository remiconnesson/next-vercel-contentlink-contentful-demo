/**
 * Creates the "Page" content type in Contentful and seeds 2 entries.
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/setup-contentful.mjs
 *
 * Requires: CONTENTFUL_MANAGEMENT_TOKEN (CMA token starting with CFPAT-)
 */

const SPACE_ID = "xked43r46smn";
const ENV_ID = process.env.CONTENTFUL_ENV || "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!CMA_TOKEN) {
  console.error("Missing CONTENTFUL_MANAGEMENT_TOKEN");
  process.exit(1);
}

console.log(`Targeting Contentful environment: "${ENV_ID}"`);

const BASE = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV_ID}`;

async function cma(path, method = "GET", body = null, extraHeaders = {}) {
  const headers = {
    Authorization: `Bearer ${CMA_TOKEN}`,
    "Content-Type": "application/vnd.contentful.management.v1+json",
    ...extraHeaders,
  };
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    // 409 = already exists / version conflict — that's fine
    if (res.status === 409) return { conflict: true, status: 409 };
    console.error(`${method} ${path} → ${res.status}\n${text}`);
    throw new Error(`CMA error ${res.status}`);
  }
  return text ? JSON.parse(text) : {};
}

// ── Step 1: Create "cl-demo-Page" content type ────────────────────────
async function createContentType() {
  console.log("Creating content type 'cl-demo-Page'...");

  const contentType = {
    name: "CL Demo Page",
    description:
      "A minimal page with title, slug, and body. Namespaced for shared Contentful spaces.",
    displayField: "title",
    fields: [
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        required: true,
        localized: false,
      },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        required: true,
        localized: false,
        validations: [{ unique: true }],
      },
      {
        id: "body",
        name: "Body",
        type: "RichText",
        required: false,
        localized: false,
        validations: [
          {
            enabledNodeTypes: [
              "heading-1",
              "heading-2",
              "heading-3",
              "heading-4",
              "ordered-list",
              "unordered-list",
              "hr",
              "blockquote",
              "hyperlink",
              "paragraph",
            ],
          },
        ],
      },
    ],
  };

  const result = await cma("/content_types/cl-demo-Page", "PUT", contentType, {
    "X-Contentful-Version": "0",
  });

  if (result.conflict) {
    console.log("Content type 'cl-demo-Page' already exists, fetching it...");
    const existing = await cma("/content_types/cl-demo-Page");
    return existing;
  }

  console.log("Content type 'cl-demo-Page' created.");
  return result;
}

async function activateContentType(version) {
  console.log(`Activating content type 'cl-demo-Page' (version ${version})...`);
  const result = await cma(
    "/content_types/cl-demo-Page/published",
    "PUT",
    null,
    { "X-Contentful-Version": String(version) },
  );
  if (result.conflict) {
    console.log("Content type already activated.");
    return;
  }
  console.log("Content type 'cl-demo-Page' activated.");
}

// ── Step 2: Seed entries ────────────────────────────────────────────
function richText(paragraphs) {
  return {
    nodeType: "document",
    data: {},
    content: paragraphs.map((text) => ({
      nodeType: "paragraph",
      data: {},
      content: [{ nodeType: "text", value: text, marks: [], data: {} }],
    })),
  };
}

const ENTRIES = [
  {
    id: "cl-demo-hello-world",
    fields: {
      title: { "en-US": "Hello World" },
      slug: { "en-US": "hello-world" },
      body: {
        "en-US": richText([
          "This is a minimal page managed in Contentful.",
          "Edit this entry in Contentful and watch Content Link highlight the corresponding element on the page.",
        ]),
      },
    },
  },
  {
    id: "cl-demo-about",
    fields: {
      title: { "en-US": "About" },
      slug: { "en-US": "about" },
      body: {
        "en-US": richText([
          "This page demonstrates Vercel Content Link with Contentful.",
          "Content editors can click on any piece of content to jump directly to the corresponding field in Contentful.",
        ]),
      },
    },
  },
];

async function seedEntries() {
  for (const entry of ENTRIES) {
    console.log(`Creating entry '${entry.id}'...`);
    const result = await cma(
      `/entries/${entry.id}`,
      "PUT",
      { fields: entry.fields },
      {
        "X-Contentful-Content-Type": "cl-demo-Page",
        "X-Contentful-Version": "0",
      },
    );

    if (result.conflict) {
      console.log(`Entry '${entry.id}' already exists, skipping creation.`);
      // Fetch existing to get version for publishing
      const existing = await cma(`/entries/${entry.id}`);
      await publishEntry(entry.id, existing.sys.version);
      continue;
    }

    console.log(`Entry '${entry.id}' created. Publishing...`);
    await publishEntry(entry.id, result.sys.version);
  }
}

async function publishEntry(entryId, version) {
  const result = await cma(
    `/entries/${entryId}/published`,
    "PUT",
    null,
    { "X-Contentful-Version": String(version) },
  );
  if (result.conflict) {
    console.log(`Entry '${entryId}' already published.`);
    return;
  }
  console.log(`Entry '${entryId}' published.`);
}

// ── Run ─────────────────────────────────────────────────────────────
async function main() {
  const ct = await createContentType();
  await activateContentType(ct.sys.version);
  await seedEntries();
  console.log(
    '\nDone! Content type "cl-demo-Page" and 2 entries created and published.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
