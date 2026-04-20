import type { Document } from "@contentful/rich-text-types";
import type { RichTextContent } from "@/lib/types";
import RichTextRenderer from "./rich-text-renderer";

interface ContentRendererProps {
  content: RichTextContent;
}

/**
 * Public wrapper -- pages import this instead of touching Contentful types.
 */
export function ContentRenderer({ content }: ContentRendererProps) {
  return <RichTextRenderer content={content as Document} />;
}
