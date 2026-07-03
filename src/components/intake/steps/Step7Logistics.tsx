import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Logistics } from "@/lib/intake-types";

type Props = {
  value: Logistics;
  onChange: (v: Logistics) => void;
};

export function Step7Logistics({ value, onChange }: Props) {
  const set = (key: keyof Logistics, val: string) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="work_mode">
          Come preferisci lavorare <span className="text-destructive">*</span>
        </Label>
        <Select value={value.work_mode} onValueChange={(v) => set("work_mode", v)}>
          <SelectTrigger id="work_mode">
            <SelectValue placeholder="Seleziona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presenza">In presenza</SelectItem>
            <SelectItem value="remoto">Da remoto</SelectItem>
            <SelectItem value="ibrido">Ibrido</SelectItem>
            <SelectItem value="app">Solo tramite app</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Disponibilità (giorni e fasce orarie)</Label>
        <Textarea
          id="availability"
          value={value.availability}
          onChange={(e) => set("availability", e.target.value)}
          placeholder="Es. Lun–Ven dopo le 18, sabato mattina."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="why_now">Perché proprio ora</Label>
        <Textarea
          id="why_now"
          value={value.why_now}
          onChange={(e) => set("why_now", e.target.value)}
          placeholder="Es. Ho un evento fra 6 mesi, oppure ho deciso di prendermi cura di me."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="past_coaching">
          Hai già lavorato con un coach o in palestra: cosa ha funzionato e cosa no
        </Label>
        <Textarea
          id="past_coaching"
          value={value.past_coaching}
          onChange={(e) => set("past_coaching", e.target.value)}
          placeholder="Es. Con il coach precedente andavo bene con i pesi ma non seguivo la dieta."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foreseen_obstacles">Ostacoli che prevedi</Label>
        <Textarea
          id="foreseen_obstacles"
          value={value.foreseen_obstacles}
          onChange={(e) => set("foreseen_obstacles", e.target.value)}
          placeholder="Es. Trasferte di lavoro, mancanza di tempo la sera, cene fuori frequenti."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="success_definition">
          Fra qualche mese, cosa dovrà essere successo per farti sentire soddisfatto/a
        </Label>
        <Textarea
          id="success_definition"
          value={value.success_definition}
          onChange={(e) => set("success_definition", e.target.value)}
          placeholder="Es. Rientrare in una taglia, sollevare X kg, sentirmi più in forma nella vita quotidiana."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="support_network">Supporto attorno a te (famiglia, amici, partner)</Label>
        <Input
          id="support_network"
          value={value.support_network}
          onChange={(e) => set("support_network", e.target.value)}
          placeholder="Es. Partner molto di supporto, famiglia scettica."
        />
      </div>
    </div>
  );
}
