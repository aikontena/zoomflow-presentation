import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const EditorLayout = lazy(() => import("@/components/editor/EditorLayout"));

export const Route = createFileRoute("/")({
  component: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorLayout />
    </Suspense>
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
