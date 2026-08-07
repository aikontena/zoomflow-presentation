import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import React, { lazy, Suspense } from "react";

const EditorLayout = lazy(() => import("@/components/editor/EditorLayout"));

export const Route = createFileRoute("/")({
  component: () => (
    <ClientOnly>
      <Suspense fallback={<div className="h-screen w-full bg-white flex items-center justify-center">Loading Editor...</div>}>
        <EditorLayout />
      </Suspense>
    </ClientOnly>
  ),
  head: () => ({
    title: "Editor | ZoomCanvas AI",
    meta: [
      { name: "description", content: "Professional AI presentation editor with infinite canvas and rich icon library." },
      { property: "og:title", content: "ZoomCanvas AI Editor" },
      { property: "og:description", content: "Design stunning presentations with our AI-powered infinite canvas." },
    ],
  }),
});
