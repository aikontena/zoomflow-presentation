import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="h-screen w-full flex items-center justify-center bg-white">
        <h1 className="text-2xl font-bold">ZoomCanvas AI Editor</h1>
    </div>
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
