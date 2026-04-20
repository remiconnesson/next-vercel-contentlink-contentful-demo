// Domain types — CMS-agnostic.
// Only lib/cms/ knows about Contentful.

export type RichTextContent = unknown;

export interface Page {
  id: string;
  slug: string;
  title: string;
  body: RichTextContent;
}
