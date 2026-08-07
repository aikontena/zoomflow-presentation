import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Loader2 } from "lucide-react";


const Canvas = lazy(() => import("@/components/editor/Canvas"));

function CanvasFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-canvas p-10 text-center">
      <div className="max-w-md space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading Editor...</h2>
        <p className="text-sm text-muted-foreground">
          Preparing the infinite canvas for your presentation.
        </p>
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <main className="relative min-w-0 flex-1">
        <ClientOnly>
          <Suspense fallback={<CanvasFallback />}>
            <Canvas />
          </Suspense>
        </ClientOnly>
      </main>
    </div>
  );
}

