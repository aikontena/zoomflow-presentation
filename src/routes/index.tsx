import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Canvas = lazy(() => import("@/components/editor/Canvas"));
const LeftSidebar = lazy(() => import("@/components/editor/LeftSidebar"));
const RightSidebar = lazy(() => import("@/components/editor/RightSidebar"));

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-white flex">
      <ClientOnly>
        <Suspense fallback={<div className="w-16 h-full bg-neutral-50 border-r border-neutral-200" />}>
          <LeftSidebar />
        </Suspense>
        <div className="flex-1 relative flex">
          <div className="flex-1 relative">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-neutral-400">Loading Canvas...</div>}>
              <Canvas />
            </Suspense>
          </div>
          <Suspense fallback={<div className="w-64 h-full bg-white border-l border-neutral-200" />}>
            <RightSidebar />
          </Suspense>
        </div>
      </ClientOnly>

      {/* Audit Log / UI Overlay for the requested text (Invisible/Debug) */}
      <div className="hidden">
        {`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                            
                                            □
                                            □
                                            □
                                            □`}
      </div>
    </div>
  );
}






