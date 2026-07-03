import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Goals } from "@/lib/intake-types";

type Step3GoalsProps = {
  value: Goals;
  onChange: (v: Goals) => void;
};

export function Step3Goals({ value, onChange }: Step3GoalsProps) {
  const set = (key: keyof Goals, val: string) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="height_cm">
            Altezza (cm) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="height_cm"
            type="number"
            inputMode="numeric"
            min={1}
            value={value.height_cm}
            onChange={(e) => set("height_cm", e.target.value)}
            placeholder="Es. 175"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight_kg">
            Peso attuale (kg) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="weight_kg"
            type="number"
            inputMode="numeric"
            min={1}
            step={0.1}
            value={value.weight_kg}
            onChange={(e) => set("weight_kg", e.target.value)}
            placeholder="Es. 70"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight_history">Storia del peso (max e min da adulto)</Label>
        <Textarea
          id="weight_history"
          value={value.weight_history}
          onChange={(e) => set("weight_history", e.target.value)}
          placeholder="Es. Ho pesato 85 kg nel 2019, il minimo è stato 68 kg nel 2021."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight_target">Peso obiettivo / target</Label>
        <Input
          id="weight_target"
          value={value.weight_target}
          onChange={(e) => set("weight_target", e.target.value)}
          placeholder="Es. Vorrei tornare intorno ai 72 kg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="main_goal">
          Obiettivo principale lavorando con me <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="main_goal"
          value={value.main_goal}
          onChange={(e) => set("main_goal", e.target.value)}
          placeholder="Descrivi cosa vuoi ottenere, perché ora e cosa significherebbe per te."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aesthetic_goal">Qualcosa dell’aspetto fisico che vuoi migliorare</Label>
        <Textarea
          id="aesthetic_goal"
          value={value.aesthetic_goal}
          onChange={(e) => set("aesthetic_goal", e.target.value)}
          placeholder="Es. Vorrei tonificare braccia e add_skip_the_rest_of_the_field_placeholder_but_in_italian"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline_event">Scadenza o evento di riferimento</Label>
        <Input
          id="deadline_event"
          value={value.deadline_event}
          onChange={(e) => set("deadline_event", e.target.value)}
          placeholder="Es. Matrimonio di mia sorella a giugno, oppure nessuna scadenza precisa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement_goal">Qualcosa nel modo di muoverti che vuoi migliorare</Label>
        <Textarea
          id="movement_goal"
          value={value.movement_goal}
          onChange={(e) => set("movement_goal", e.target.value)}
          placeholder="Es. Voglio correre 5 km senza fermarmi, oppure sentirmi più stabile su una gamba."
          rows={3}
        />
      </div>
    </div>
  );
}
