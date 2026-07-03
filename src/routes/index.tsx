import { createFileRoute } from "@tanstack/react-router";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Questionario d'ingresso — Personal Trainer" },
      {
        name: "description",
        content:
          "Compila il questionario d'ingresso per iniziare il tuo percorso di personal training: anagrafica, salute, obiettivi e stile di vita.",
      },
      { property: "og:title", content: "Questionario d'ingresso — Personal Trainer" },
      {
        property: "og:description",
        content:
          "Questionario di valutazione iniziale per il tuo percorso di personal training.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <IntakeForm />
      <Toaster richColors position="top-center" />
    </div>
  );
}
