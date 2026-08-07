import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { RightSidebar } from "@/components/editor/RightSidebar";
import { TopToolbar } from "@/components/editor/TopToolbar";
import { MiniMap } from "@/components/editor/MiniMap";
import { PresentMode } from "@/components/editor/PresentMode";
import { Timeline } from "@/components/editor/Timeline";


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
            <Canvas />
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
