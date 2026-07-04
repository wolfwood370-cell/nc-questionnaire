import { createFileRoute } from "@tanstack/react-router";
import { CoachPage } from "@/components/coach/CoachPage";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Area coach — Questionari d'ingresso" },
      // area riservata: fuori dai motori di ricerca
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Coach,
});

function Coach() {
  return (
    <div className="min-h-screen w-full text-ink" style={{ background: "var(--bg-page)" }}>
      <CoachPage />
    </div>
  );
}
