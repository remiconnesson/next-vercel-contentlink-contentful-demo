/**
 * Migrates the "page" content type to "clDemoPage" (namespaced).
 *
 * Because Contentful does not support renaming content type IDs, this
 * script:
 *   1. Creates a new "clDemoPage" content type with the same fields
 *   2. Copies all entries from "page" to "clDemoPage"
 *   3. Publishes the new entries
 *   4. Unpublishes and deletes the old entries
 *   5. Unpublishes and deletes the old "page" content type
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-namespace-contentful.mjs
 */

const SPACE_ID = "xked43r46smn";
const ENV_ID = "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

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

// ── Step 1: Create new "clDemoPage" content type ────────────────────
async function createNewContentType() {
  console.log('Creating content type "clDemoPage"...');

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

  const result = await cma("/content_types/clDemoPage", "PUT", contentType, {
    "X-Contentful-Version": "0",
  });

  if (result.conflict) {
    console.log('"clDemoPage" already exists, fetching it...');
    return await cma("/content_types/clDemoPage");
  }

  console.log('"clDemoPage" created.');
  return result;
}

async function activateContentType(version) {
  console.log(`Activating "clDemoPage" (version ${version})...`);
  const result = await cma("/content_types/clDemoPage/published", "PUT", null, {
    "X-Contentful-Version": String(version),
  });
  if (result.conflict) {
    console.log("Already activated.");
    return;
  }
  console.log("Activated.");
}

// ── Step 2: Copy entries from "page" to "clDemoPage" ────────────────
async function migrateEntries() {
  console.log('\nFetching entries of type "page"...');
  const res = await cma("/entries?content_type=page&limit=100");

  if (res.notFound || !res.items || res.items.length === 0) {
    console.log("No entries found for 'page'. Nothing to migrate.");
    return [];
  }

  console.log(`Found ${res.items.length} entries to migrate.`);
  const newIds = [];

  for (const entry of res.items) {
    const oldId = entry.sys.id;
    // Use a predictable new ID: prefix with clDemo-
    const newId = `clDemo-${oldId.replace(/^page-/, "")}`;
    console.log(`\n  Migrating "${oldId}" → "${newId}"...`);

    const createResult = await cma(
      `/entries/${newId}`,
      "PUT",
      { fields: entry.fields },
      {
        "X-Contentful-Content-Type": "clDemoPage",
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

    newIds.push(newId);
  }

  return res.items;
}

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

// ── Step 3: Clean up old "page" entries and content type ────────────
async function cleanupOldEntries(entries) {
  console.log("\nCleaning up old entries...");

  for (const entry of entries) {
    const id = entry.sys.id;
    const version = entry.sys.version || entry.sys.publishedVersion;

    // Unpublish first (if published)
    if (entry.sys.publishedVersion) {
      console.log(`  Unpublishing "${id}"...`);
      try {
        await cma(`/entries/${id}/published`, "DELETE");
      } catch {
        console.log(`  Could not unpublish "${id}", may already be unpublished.`);
      }
    }

    // Delete
    console.log(`  Deleting "${id}"...`);
    try {
      // Re-fetch to get latest version
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
  console.log('\nDeleting old "page" content type...');

  // Unpublish
  try {
    await cma("/content_types/page/published", "DELETE");
    console.log('"page" content type unpublished.');
  } catch {
    console.log('Could not unpublish "page" content type (may already be unpublished).');
  }

  // Delete
  try {
    await cma("/content_types/page", "DELETE");
    console.log('"page" content type deleted.');
  } catch {
    console.log('Could not delete "page" content type.');
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
  console.log(
    '\nDone! Content type renamed from "page" to "clDemoPage" and entries migrated.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
