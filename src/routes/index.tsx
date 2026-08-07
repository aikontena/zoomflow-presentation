import { createFileRoute } from "@tanstack/react-router";
import Canvas from "@/components/editor/Canvas";

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <Canvas />
    </div>
  );
}


