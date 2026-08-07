import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Canvas = lazy(() => import("@/components/editor/Canvas"));

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-red-500 flex items-center justify-center">
      <h1 className="text-white text-4xl">TEST RENDER</h1>
    </div>
  );
}





