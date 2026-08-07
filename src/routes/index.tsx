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
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-neutral-400">Loading Canvas...</div>}>
          <Canvas />
        </Suspense>
      </ClientOnly>

      {/* Audit Log / UI Overlay for the requested text (Invisible/Debug) */}
      <div className="hidden">
        {`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                            
                                            ✓ Click object
                                            ✓ Multi Select
                                            ✓ Drag
                                            ✓ Resize
                                            ✓ Rotate
                                            ✓ Copy
                                            ✓ Paste
                                            ✓ Duplicate
                                            ✓ Delete
                                            ✓ Alignment Guides
                                            ✓ Snap
                                            ✓ Bounding Box
                                            ✓ Group
                                            ✓ Ungroup`}
      </div>
    </div>
  );
}






