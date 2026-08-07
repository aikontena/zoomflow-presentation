import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Safe Mode Active</h1>
    </div>
  );
}



