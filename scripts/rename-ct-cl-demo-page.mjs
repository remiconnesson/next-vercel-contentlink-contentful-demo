/**
 * Renames the content type from "clDemoPage" to "cl-demo-Page".
 *
 * Since Contentful doesn't support renaming content type IDs, this:
 *   1. Creates "cl-demo-Page" with the same fields
 *   2. Copies all entries from "clDemoPage" to "cl-demo-Page"
 *   3. Publishes the new entries
 *   4. Cleans up old entries and content type
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/rename-ct-cl-demo-page.mjs
 */

const SPACE_ID = "xked43r46smn";
const ENV_ID = "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const OLD_CT_ID = "clDemoPage";
const NEW_CT_ID = "cl-demo-Page";

if (!CMA_TOKEN) {
  console.error("Missing CONTENTFUL_MANAGEMENT_TOKEN");
  process.exit(1);
}

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
    if (res.status === 409) return { conflict: true, status: 409 };
    if (res.status === 404) return { notFound: true, status: 404 };
    console.error(`${method} ${path} → ${res.status}\n${text}`);
    throw new Error(`CMA error ${res.status}`);
  }
  return text ? JSON.parse(text) : {};
}

// ── Step 1: Create new content type ─────────────────────────────────
async function createNewContentType() {
  console.log(`Creating content type "${NEW_CT_ID}"...`);

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

  const result = await cma(
    `/content_types/${NEW_CT_ID}`,
    "PUT",
    contentType,
    { "X-Contentful-Version": "0" },
  );

  if (result.conflict) {
    console.log(`"${NEW_CT_ID}" already exists, fetching it...`);
    return await cma(`/content_types/${NEW_CT_ID}`);
  }

  console.log(`"${NEW_CT_ID}" created.`);
  return result;
}

async function activateContentType(version) {
  console.log(`Activating "${NEW_CT_ID}" (version ${version})...`);
  const result = await cma(
    `/content_types/${NEW_CT_ID}/published`,
    "PUT",
    null,
    { "X-Contentful-Version": String(version) },
  );
  if (result.conflict) {
    console.log("Already activated.");
    return;
  }
  console.log("Activated.");
}

// ── Step 2: Migrate entries ─────────────────────────────────────────
async function publishEntry(entryId, version) {
  const result = await cma(`/entries/${entryId}/published`, "PUT", null, {
    "X-Contentful-Version": String(version),
  });
  if (result.conflict) {
    console.log(`  "${entryId}" already published.`);
    return;
  }
  console.log(`  "${entryId}" published.`);
}

async function migrateEntries() {
  console.log(`\nFetching entries of type "${OLD_CT_ID}"...`);
  const res = await cma(`/entries?content_type=${OLD_CT_ID}&limit=100`);

  if (res.notFound || !res.items || res.items.length === 0) {
    console.log(`No entries found for "${OLD_CT_ID}". Nothing to migrate.`);
    return [];
  }

  console.log(`Found ${res.items.length} entries to migrate.`);

  for (const entry of res.items) {
    const oldId = entry.sys.id;
    // Keep the same entry ID prefix pattern, just swap clDemo → cl-demo
    const newId = oldId.replace(/^clDemo-/, "cl-demo-");
    console.log(`\n  Migrating "${oldId}" → "${newId}"...`);

    const createResult = await cma(
      `/entries/${newId}`,
      "PUT",
      { fields: entry.fields },
      {
        "X-Contentful-Content-Type": NEW_CT_ID,
        "X-Contentful-Version": "0",
      },
    );

    if (createResult.conflict) {
      console.log(`  "${newId}" already exists, fetching for publish...`);
      const existing = await cma(`/entries/${newId}`);
      await publishEntry(newId, existing.sys.version);
    } else {
      console.log(`  "${newId}" created. Publishing...`);
      await publishEntry(newId, createResult.sys.version);
    }
  }

  return res.items;
}

// ── Step 3: Clean up old entries and content type ───────────────────
async function cleanupOldEntries(entries) {
  console.log("\nCleaning up old entries...");

  for (const entry of entries) {
    const id = entry.sys.id;

    if (entry.sys.publishedVersion) {
      console.log(`  Unpublishing "${id}"...`);
      try {
        await cma(`/entries/${id}/published`, "DELETE");
      } catch {
        console.log(`  Could not unpublish "${id}".`);
      }
    }

    console.log(`  Deleting "${id}"...`);
    try {
      const latest = await cma(`/entries/${id}`);
      if (!latest.notFound) {
        await cma(`/entries/${id}`, "DELETE");
        console.log(`  Deleted "${id}".`);
      }
    } catch {
      console.log(`  Could not delete "${id}".`);
    }
  }
}

async function deleteOldContentType() {
  console.log(`\nDeleting old "${OLD_CT_ID}" content type...`);

  try {
    await cma(`/content_types/${OLD_CT_ID}/published`, "DELETE");
    console.log(`"${OLD_CT_ID}" content type unpublished.`);
  } catch {
    console.log(`Could not unpublish "${OLD_CT_ID}".`);
  }

  try {
    await cma(`/content_types/${OLD_CT_ID}`, "DELETE");
    console.log(`"${OLD_CT_ID}" content type deleted.`);
  } catch {
    console.log(`Could not delete "${OLD_CT_ID}".`);
  }
}

// ── Step 4: Verify GraphQL collection name ──────────────────────────
async function verifyGraphQL() {
  console.log("\nVerifying GraphQL collection name...");

  const CDA_TOKEN = "9Vs0QOtvV1Yl0hJtlyUCtwZ7N7FoIxKJhtmwfIaR-Ao";
  const query = `{ clDemoPageCollection { items { sys { id } title slug } } }`;

  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CDA_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    },
  );

  const json = await res.json();
  if (json.data?.clDemoPageCollection?.items) {
    console.log(
      "GraphQL collection name 'clDemoPageCollection' confirmed working.",
    );
    for (const item of json.data.clDemoPageCollection.items) {
      console.log(`  - ${item.title} (/${item.slug})`);
    }
  } else {
    console.warn(
      "GraphQL collection name may have changed! Response:",
      JSON.stringify(json, null, 2),
    );
  }
}

// ── Run ─────────────────────────────────────────────────────────────
async function main() {
  const ct = await createNewContentType();
  await activateContentType(ct.sys.version);
  const oldEntries = await migrateEntries();
  if (oldEntries.length > 0) {
    await cleanupOldEntries(oldEntries);
    await deleteOldContentType();
  }
  await verifyGraphQL();
  console.log(
    `\nDone! Content type renamed from "${OLD_CT_ID}" to "${NEW_CT_ID}".`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
