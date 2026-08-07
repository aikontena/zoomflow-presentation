import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Canvas = lazy(() => import("@/components/editor/Canvas"));

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <ClientOnly>
        <Suspense fallback={<div>Loading Canvas...</div>}>
          <Canvas />
        </Suspense>
      </ClientOnly>
    </div>
  );
}






