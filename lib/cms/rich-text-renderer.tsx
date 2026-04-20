import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Block, Document, Inline } from "@contentful/rich-text-types";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import type { ReactNode } from "react";

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_: unknown, children: ReactNode) => (
      <p className="mb-6 leading-relaxed text-lg">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_: unknown, children: ReactNode) => (
      <h1 className="text-3xl font-bold mt-10 mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_: unknown, children: ReactNode) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_: unknown, children: ReactNode) => (
      <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_: unknown, children: ReactNode) => (
      <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_: unknown, children: ReactNode) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
    ),
    [BLOCKS.QUOTE]: (_: unknown, children: ReactNode) => (
      <blockquote className="border-l-4 border-primary/30 pl-6 py-4 my-8 bg-muted/50 italic rounded-r-lg">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-12 border-border" />,
    [INLINES.HYPERLINK]: (node: Block | Inline, children: ReactNode) => (
      <a
        href={(node.data as { uri: string }).uri}
        className="text-primary underline hover:text-primary/80"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  renderMark: {
    bold: (text: ReactNode) => <strong>{text}</strong>,
    italic: (text: ReactNode) => <em>{text}</em>,
    underline: (text: ReactNode) => <u>{text}</u>,
    code: (text: ReactNode) => (
      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">
        {text}
      </code>
    ),
  },
};

export default function RichTextRenderer({
  content,
}: {
  content: Document;
}) {
  if (!content) return null;
  return (
    <div className="prose max-w-none">
      {documentToReactComponents(content, options)}
    </div>
  );
}
