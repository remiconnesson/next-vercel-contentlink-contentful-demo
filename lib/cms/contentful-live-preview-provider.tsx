"use client";

import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  locale?: string;
  enabled?: boolean;
}

export function LivePreviewProvider({
  children,
  locale = "en-US",
  enabled = true,
}: Props) {
  if (!enabled) return <>{children}</>;

  return (
    <ContentfulLivePreviewProvider
      locale={locale}
      enableInspectorMode
      enableLiveUpdates
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
