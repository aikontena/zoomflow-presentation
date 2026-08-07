import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { RightSidebar } from "@/components/editor/RightSidebar";
import { TopToolbar } from "@/components/editor/TopToolbar";
import { MiniMap } from "@/components/editor/MiniMap";
import { PresentMode } from "@/components/editor/PresentMode";
import { Timeline } from "@/components/editor/Timeline";

function CanvasFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-canvas p-10 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Canvas Resetting</h2>
        <p className="text-sm text-muted-foreground">
          The canvas module is being completely rebuilt to address stability and performance issues. 
          Please wait for the next update to begin editing.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 animate-pulse bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

const title = "ZoomCanvas AI — Infinite canvas presentation editor";
const description =
  "Design presentations on an infinite zooming canvas. Pan, zoom, add text, shapes and media, then present with smooth cinematic transitions.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const [presenting, setPresenting] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden aurora-bg">
      <h1 className="sr-only">ZoomCanvas AI infinite canvas presentation editor</h1>
      <TopToolbar onPresent={() => setPresenting(true)} />

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <LeftSidebar />
        </div>

          <main className="relative min-w-0 flex-1">
            <CanvasFallback />
            <div className="pointer-events-none absolute bottom-4 right-4 hidden sm:block">
              <div className="pointer-events-auto">
                <MiniMap />
              </div>
            </div>
            <div className="glass pointer-events-none absolute bottom-4 left-4 rounded-xl px-3 py-2 text-[11px] text-muted-foreground">
              Scroll to pan · ⌘/Ctrl + scroll to zoom · double-click to edit text
            </div>
            <Timeline />
          </main>

        <RightSidebar />
      </div>

      {presenting && <PresentMode onExit={() => setPresenting(false)} />}
    </div>
  );
}
