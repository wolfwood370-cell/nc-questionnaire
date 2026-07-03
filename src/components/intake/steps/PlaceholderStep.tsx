import { StepShell } from "../StepShell";

type Props = { title: string; note?: string };

export function PlaceholderStep({ title, note }: Props) {
  return (
    <StepShell
      title={title}
      description="Contenuto in arrivo — i campi di questa sezione verranno aggiunti a breve."
    >
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        {note ?? "Placeholder: sezione da compilare nei prossimi step."}
      </div>
    </StepShell>
  );
}
